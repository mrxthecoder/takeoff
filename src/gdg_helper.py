import ast, io, json, contextlib


def _snap(ns):
    names = {}
    for k, v in ns.items():  # first variable name wins when two names point at one object
        if not k.startswith("__") and not isinstance(v, type) and type(v).__module__ == "__main__":
            names.setdefault(id(v), k)

    def fmt(x):
        if id(x) in names:
            return "\u2192 " + names[id(x)]          # reference to another named object (has-a)
        if isinstance(x, list):
            return "[" + ", ".join(fmt(i) for i in x) + "]"
        if type(x).__module__ == "__main__" and not isinstance(x, type):
            return "<%s>" % type(x).__name__
        return repr(x)

    classes, objects, seen = [], [], set()
    for k, v in list(ns.items()):
        if k.startswith("__"):
            continue
        if isinstance(v, type) and v.__module__ == "__main__":
            classes.append({
                "name": k,
                "bases": [b.__name__ for b in v.__bases__ if b is not object],
                "methods": [m for m, f in v.__dict__.items()
                            if callable(f) and (not m.startswith("__") or m == "__init__")],
                "inherited": [m for b in v.__mro__[1:-1] for m, f in b.__dict__.items()
                              if callable(f) and not m.startswith("__")],
            })
        elif type(v).__module__ == "__main__" and hasattr(v, "__dict__") and names.get(id(v)) == k and k not in seen:
            seen.add(k)
            objects.append({
                "var": k,
                "cls": type(v).__name__,
                "attrs": {a: fmt(x) for a, x in vars(v).items()},
            })
    return {"classes": classes, "objects": objects}


def gdg_run(code):
    """Run learner code one top-level statement at a time; snapshot objects after each."""
    ns = {"__name__": "__main__"}
    buf = io.StringIO()
    steps, err = [], None
    try:
        tree = ast.parse(code, "<editor>")
    except SyntaxError as e:
        return json.dumps({"out": "", "err": "SyntaxError: %s (line %s)" % (e.msg, e.lineno), "steps": []})
    with contextlib.redirect_stdout(buf), contextlib.redirect_stderr(buf):
        for node in tree.body:
            try:
                exec(compile(ast.Module([node], []), "<editor>", "exec"), ns)
            except BaseException as e:  # noqa: BLE001
                line, tb = node.lineno, e.__traceback__
                while tb:
                    if tb.tb_frame.f_code.co_filename == "<editor>":
                        line = tb.tb_lineno
                    tb = tb.tb_next
                err = "%s: %s (line %s)" % (type(e).__name__, e, line)
                break
            steps.append({"line": node.end_lineno, "out_len": len(buf.getvalue()), **_snap(ns)})
    return json.dumps({"out": buf.getvalue(), "err": err, "steps": steps})
