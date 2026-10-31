import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { SceneName } from "./Geometry";
import { CodeLab, type Callout } from "./CodeLab";
import { Reveal, useBeat } from "./beats";
import { Logo } from "./Logo";

export type SlideDef = { id: string; scene: SceneName; kicker: string; mins?: number; phase?: 0 | 1 | 2 | 3; title: ReactNode; body: ReactNode; bare?: boolean;
  beats?: number; say: string; script?: string[] };

const rise = (i: number) => ({ initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 },
  transition: { delay: 0.15 + i * 0.1, type: "spring" as const, stiffness: 120, damping: 18 } });
// A runnable code slide: every callout is one beat, revealed on the presenter's command.
const lab = (id: string, initial: string, callouts: Callout[] = [], side?: ReactNode, sideBeats = 0) => ({
  body: <CodeLab id={id} initial={initial} callouts={callouts} side={side} />, beats: Math.max(callouts.length, sideBeats),
  script: callouts.map((c) => `${c.label} — ${c.text}`) });
const Bar = ({ c, label, children }: { c: string; label: string; children: ReactNode }) => (<div className={"bigbar " + c}><b>{label}</b><div>{children}</div></div>);

function Title() {
  const agenda = [["10m", "THE MESS", "#4285F4"], ["25m", "OBJECTS + CLASSES", "#EA4335"], ["40m", "GUIDED BUILD", "#FBBC04"], ["10m", "CHALLENGE", "#34A853"], ["5m", "RECAP + Q&A", "#4285F4"]];
  return (
    <div className="title-slide">
      <motion.div {...rise(0)}><Logo big /></motion.div>
      <motion.div className="eyebrow" style={{ marginTop: 28 }} {...rise(1)}>BEGINNER WORKSHOP &nbsp;/&nbsp; 90 MIN &nbsp;/&nbsp; PYTHON OOP</motion.div>
      <motion.h1 {...rise(2)}>THINK IN<br /><span style={{ color: "#4285F4" }}>OBJECTS.</span><br />BUILD IN<br /><span style={{ color: "#EA4335" }}>SYSTEMS.</span></motion.h1>
      <motion.p className="lead" {...rise(3)}>Object-Oriented Programming, told through Berry's Pizza</motion.p>
      <motion.div className="agenda" {...rise(4)}>
        {agenda.map(([t, l, c]) => (<span key={l} className="pill" style={{ background: c, color: c === "#FBBC04" ? "#202124" : "#fff" }}><b>{t}</b> {l}</span>))}
      </motion.div>
    </div>
  );
}

const NOTES = ["sam_items = [...]", "sam_total = 33", 'sam_status = "unpaid"', "nia_items = [...]", "nia_total = 18", 'nia_status = "paid"', "raj_items = [...]", "raj_total = 27", 'raj_status = "unpaid"'];
function Problem() {
  return (
    <div className="problem">
      <div className="twocol">
        <motion.div className="card" {...rise(0)}><h3>Loose variables</h3>
          <div className="sticky-wrap">{NOTES.map((n, k) => (<span key={n} className="sticky" style={{ ["--r" as string]: `${(k % 3) - 1.2 + (k % 2 ? 1.5 : -1.5)}deg`, animationDelay: `-${k * 0.45}s` }}>{n}</span>))}</div></motion.div>
        <div><Reveal at={1}><div className="card obj-card"><h3>Organized orders</h3>
          {[["Sam", "2 pizzas", "unpaid"], ["Nia", "pizza + cola", "paid"], ["Raj", "family combo", "unpaid"]].map(([a, b, c]) => (<div key={a} className="rec">{a} &nbsp;/&nbsp; {b} &nbsp;/&nbsp; {c}</div>))}</div></Reveal></div>
      </div>
      <Reveal at={2}><p className="caption static">Functions and dictionaries remain useful. OOP is one way to unite related data and behavior.</p>
        <h3 className="ask">Can we treat each order as one meaningful unit?</h3></Reveal>
    </div>
  );
}

const ORDERS = [["sam", "Sam", "Margherita ×2", "unpaid"], ["nia", "Nia", "Margherita, Cola", "paid"], ["raj", "Raj", "Family Combo", "unpaid"]];
function ClassVsObject() {
  const n = useBeat();
  return (
    <div className="cvo">
      <motion.div className="card class-card big" {...rise(0)}>
        <div className="tag blue">CLASS / BLANK ORDER FORM</div>
        <div className="card-title xl">Order</div>
        <div className="bar yellow"><b>FIELDS</b><br />customer · items · status</div>
        <div className="bar red"><b>METHODS</b><br />add_item() · calculate_total()<br />mark_paid()</div>
      </motion.div>
      {n >= 1 ? <motion.div className="trunk-in" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5 }}><span>fill in a form</span></motion.div> : <div />}
      <div className="cvo-objs">
        {ORDERS.slice(0, n).map(([v, who, items, st], i) => (
          <motion.div key={v} className="card obj-card" initial={{ opacity: 0, x: 90, scale: 0.8 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ type: "spring", stiffness: 190, damping: 17 }}>
            <div className="tag green">OBJECT / {v} · FILLED-IN FORM #{i + 1}</div>
            <div className="attr"><span className="k">customer:</span> {who}</div><div className="attr"><span className="k">items:</span> {items}</div><div className="attr"><span className="k">status:</span> {st}</div>
          </motion.div>))}
      </div>
      <p className="caption">The blank form is the class. Each filled-in copy is an object.</p>
    </div>
  );
}

function Specialization() {
  return (
    <div className="spec">
      <div className="spec3">
        <motion.div className="card class-card top" {...rise(0)}><div className="tag blue">GENERAL CLASS / MenuItem</div><div className="mono big">name · price</div></motion.div>
        <div><Reveal at={1}><div className="up">▲ a Pizza IS-A MenuItem</div><div className="card class-card"><div className="tag blue">SPECIALIZED / Pizza</div><div className="mono big">+ size</div></div></Reveal></div>
        <div><Reveal at={2}><div className="up">▲ a Drink IS-A MenuItem</div><div className="card class-card"><div className="tag blue">SPECIALIZED / Drink</div><div className="mono big">+ volume_ml</div></div></Reveal></div>
      </div>
      <div className="spec-side">
        <Reveal at={1}><Bar c="blue" label="Say it out loud">"A pizza is a menu item." Yes. "A drink is a menu item." Yes.</Bar></Reveal>
        <Reveal at={3}><Bar c="yellow" label="Why bother">Shared data lives in one place. Inheritance is one reuse tool, not the answer to every reuse problem.</Bar></Reveal>
      </div>
      <p className="caption">Menu grew: drinks, desserts, veggie pizzas. Do we copy name and price into every class?</p>
    </div>
  );
}

function Checkout() {
  const P = [["blue", "01", "Encapsulation", "Protects Sam's payment status.", "order.mark_paid(33, 33)", "Bank account: use the deposit slip, not a pen."],
    ["yellow", "02", "Inheritance + Composition", "Built Sam's combo meal.", "Combo(pizza, cola)", "Pizza IS-A MenuItem. Combo HAS-A pizza and a drink."],
    ["green", "03", "Polymorphism", "Calculated Sam's receipt.", "item.calculate_price()", "Same call, different behavior."],
    ["red", "04", "Abstraction", "Processed Sam's credit card.", "method.process_payment(33)", "Brake pedal: press it, ignore the hydraulics."]];
  return (
    <div className="pillars">
      {P.map(([c, n, t, d, k, note], i) => (
        <Reveal key={t} at={i + 1} className={"cell c" + (i + 1)}>
          <div className={"card pillar " + c}><h3><span>{n}</span> {t}</h3><p>{d}</p><pre className="mono">{k}</pre><small>{note}</small></div>
        </Reveal>))}
    </div>
  );
}

function Thinking() {
  const Q = [["blue", "01 INFORMATION", "What data belongs together?", "Classes + objects"], ["red", "02 BEHAVIOR", "Who is allowed to change this data?", "Encapsulation"],
    ["green", "03 RELATIONSHIPS", "Is this a version of that (IS-A) or does it contain that (HAS-A)?", "Inheritance · Composition · Polymorphism"]];
  return (
    <div className="judge">
      <div className="pyramid">
        {Q.map(([c, t, q, tag], i) => (<div key={t}><Reveal at={i + 1}><div className={"card q3 " + c}><div className="tag">{t}</div><p>{q}</p><div className="tag blue">→ {tag}</div></div></Reveal></div>))}
      </div>
      <Reveal at={4}><h3 className="ask line">Not a class for everything. Not inheritance just because you can. Not memorizing four pillars.<br />Choose the simplest structure that expresses the problem clearly.</h3></Reveal>
    </div>
  );
}

function Wrap() {
  const chain = ["Class", "Object", "__init__", "State", "Encapsulation", "Inheritance", "Composition", "Polymorphism", "Abstraction"], cols = ["#4285F4", "#EA4335", "#FBBC04", "#34A853"];
  return (
    <div className="wrap">
      <div className="chain">{chain.map((c, i) => (<motion.span key={c} className="pill" style={{ background: cols[i % 4], color: i % 4 === 2 ? "#202124" : "#fff" }} {...rise(i * 0.4)}>{c}</motion.span>))}</div>
      <Reveal at={1}><div className="eyebrow">THREE QUESTIONS TO TAKE WITH YOU</div>
        <ol className="qs"><li>What is the difference between a class and an object?</li><li>What does self refer to?</li><li>IS-A or HAS-A: how would you decide?</li></ol></Reveal>
      <Reveal at={2}><h3 className="ask line">Build small. Understand the model. Extend with intention.</h3></Reveal>
    </div>
  );
}

const ORDER = `class Order:
    def __init__(self, customer):
        self.customer = customer
        self.items = []
        self.status = "unpaid"

    def add_item(self, name, price):
        self.items.append((name, price))

    def calculate_total(self):
        return sum(price for name, price in self.items)
`;
const MENU = `class MenuItem:
    def __init__(self, name, price):
        self.name = name
        self.price = price
`;

export const SLIDES: SlideDef[] = [
  { id: "title", scene: "title", kicker: "", say: "Welcome. Today we think like engineers: take a messy pizza shop and organise it.", title: null, body: <Title />, bare: true },
  { id: "problem", scene: "problem", kicker: "RECAP / THE MESS", mins: 4, phase: 0, title: <>BERRY'S PIZZA JUST GOT POPULAR.</>, beats: 2,
    say: "Sam orders two pizzas, then Nia, then Raj. Where does each person's data live?", script: ["Reveal: one order = one organized unit", "Ask: can we treat each order as one meaningful unit?"], body: <Problem /> },
  { id: "tools", scene: "problem", kicker: "RECAP / FAMILIAR TOOLS", mins: 3, phase: 0, title: <>YOU ALREADY KNOW THE BUILDING BLOCKS.</>,
    say: "Variables, dicts and functions work fine, until the shop scales.", ...lab("tools", `order = {\n    "customer": "Sam",\n    "items": ["Margherita", "Margherita"],\n    "total": 33,\n    "status": "unpaid"\n}\n\ndef show_order(order):\n    print(order["customer"], order["items"], order["total"], order["status"])\n\nshow_order(order)\n`, [], 
      <div className="sidebars"><Reveal at={1}><Bar c="blue" label="Variable">order refers to a dictionary.</Bar></Reveal><Reveal at={2}><Bar c="yellow" label="Dictionary / data">Stores the order's fields.</Bar></Reveal>
        <Reveal at={3}><Bar c="red" label="Function / behavior">Operates on the supplied data.</Bar></Reveal><Reveal at={4}><h3 className="ask">What changes with 100 customers and discounts?</h3></Reveal></div>, 4),
    script: ["Variable — order refers to a dictionary", "Dictionary — stores the order's fields", "Function — operates on the supplied data", "Ask: what changes with 100 customers and discounts?"] },
  { id: "class-object", scene: "blueprint", kicker: "MENTAL MODELS / CLASS AND OBJECT", mins: 4, phase: 1, title: <>A CLASS IS A BLANK ORDER FORM.<br />AN OBJECT IS A FILLED-IN ONE.</>, beats: 3,
    say: "You can't design a custom structure per customer. You need a template.", script: ["Sam fills in a form", "Nia fills in a form", "Raj fills in a form"], body: <ClassVsObject /> },
  { id: "first-class", scene: "blueprint", kicker: "MENTAL MODELS / FIRST CLASS", mins: 2, phase: 1, title: <>DEFINE THE TEMPLATE.</>, say: "First class: Order. Then Sam's order is an instance of it.",
    ...lab("first-class", `class Order:\n    pass\n\nsam = Order()\nnia = Order()\n`, [
      { color: "blue", label: "class Order", text: "begins a definition. Order is the class name." }, { color: "yellow", label: "pass", text: "An empty-body placeholder." },
      { color: "green", label: "sam, nia", text: "each refer to their own instance of Order." }]) },
  { id: "init", scene: "objects", kicker: "MENTAL MODELS / INITIALIZATION", mins: 5, phase: 2, title: <>EVERY NEW ORDER STARTS SET UP.</>, say: "__init__ is the setup step for a brand-new order.",
    ...lab("init", `class Order:\n    def __init__(self, customer):\n        self.customer = customer\n        self.items = []\n        self.status = "unpaid"\n\nsam = Order("Sam")\nnia = Order("Nia")\n`, [
      { color: "blue", label: "01 CREATE", text: "Order(...) creates an instance." }, { color: "yellow", label: "02 INITIALIZE", text: "__init__ sets up the already-created instance." },
      { color: "green", label: "03 STORE", text: "Arguments become self.customer, self.items, self.status on that order." }]) },
  { id: "self", scene: "objects", kicker: "MENTAL MODELS / SELF", mins: 5, phase: 2, title: <>WHICH ORDER ARE WE TALKING ABOUT?</>, say: "self means: whichever order this method was called on.",
    ...lab("self", `class Order:\n    def __init__(self, customer):\n        self.customer = customer\n\n    def greet(self):\n        print(f"Order for {self.customer}")\n\nsam = Order("Sam")\nnia = Order("Nia")\nsam.greet()\nnia.greet()\n`, [
      { color: "red", label: "sam.greet()", text: "→ self refers to sam → Order for Sam" }, { color: "red", label: "nia.greet()", text: "→ self refers to nia → Order for Nia" },
      { color: "blue", label: "self", text: "is the conventional instance-reference name. It is not a Python keyword." }]) },
  { id: "attrs-methods", scene: "state", kicker: "MENTAL MODELS / DATA + BEHAVIOR", mins: 4, phase: 2, title: <>DATA AND BEHAVIOR, TOGETHER.</>, say: "The order holds its items, and knows how to total itself.",
    ...lab("attrs-methods", ORDER + `\nsam = Order("Sam")\nsam.add_item("Margherita", 15)\nprint(sam.calculate_total())\n`, [
      { color: "yellow", label: "Attributes / state", text: "customer, items, status — stored on each order." }, { color: "red", label: "Methods / behavior", text: "add_item() and calculate_total() work on this order." },
      { color: "green", label: "Rule", text: "Attributes hold state. Methods give that state useful behavior." }]) },
  { id: "state", scene: "state", kicker: "MENTAL MODELS / STATE CHANGES", mins: 3, phase: 2, title: <>SAME ORDER. NEW STATE.</>, say: "Watch Sam's total move as items are added.",
    ...lab("state", ORDER + `\nsam = Order("Sam")\nsam.add_item("Margherita", 15)\nprint(sam.calculate_total())\nsam.add_item("Margherita", 15)\nsam.add_item("Cola", 3)\nprint(sam.calculate_total())\n`, [
      { color: "red", label: "METHOD CALL", text: "add_item(...) — same instance, changed state." }, { color: "green", label: "Try it", text: "Run, then step ◀ ▶ through the diagram: total 15 → 33." }]) },
  { id: "encapsulation", scene: "state", kicker: "WORKING SYSTEM / ENCAPSULATION", mins: 6, phase: 3, title: <>USE THE DEPOSIT SLIP, NOT A PEN.</>,
    say: "A coupon feature marks an order paid before money arrives. Bank account metaphor: use the deposit slip.",
    ...lab("encapsulation", `class Order:\n    def __init__(self, customer):\n        self.customer = customer\n        self._status = "unpaid"\n\n    def mark_paid(self, received, total):\n        if received < total:\n            raise ValueError("Payment not collected yet")\n        self._status = "paid"\n\nsam = Order("Sam")\nsam.mark_paid(33, 33)\nprint(sam._status)\n# try: sam.mark_paid(10, 33)\n`, [
      { color: "red", label: "The rule lives with the data", text: "mark_paid() checks the payment before changing status." },
      { color: "blue", label: "Bank account", text: "You use the official deposit — not a pen on the balance." },
      { color: "yellow", label: "Honest nuance", text: "_status is a convention, not a security wall. Encapsulation is about structure and rules." }]) },
  { id: "lab", scene: "build", kicker: "GUIDED BUILD / START OF THE LAB", mins: 12, phase: 3, title: <>LET'S BUILD THE ORDER MODEL.</>, say: "Your turn: build Order together, then test two orders.",
    ...lab("lab", `class Order:\n    def __init__(self, customer):\n        # TODO: store customer, an empty items list, and status\n        pass\n\n    def add_item(self, name, price):\n        # TODO: add one item to THIS order\n        pass\n\n    def calculate_total(self):\n        # TODO: sum the prices of this order's items\n        pass\n\n# TODO: create two orders (Sam, Nia); add items to only one\n`, [
      { color: "green", label: "BUILD TOGETHER", text: "Store customer, items, status. Add items. Calculate a total. Create two orders." },
      { color: "yellow", label: "PREDICT BEFORE RUNNING", text: "If we add a Cola to Sam's order, should Nia's total change?" },
      { color: "blue", label: "TIMING", text: "3m setup · 5m implement · 2m test two orders · 2m peer check" }]) },
  { id: "specialization", scene: "inherit", kicker: "WORKING SYSTEM / IS-A", mins: 3, phase: 3, title: <>THE MENU GREW. DON'T COPY AND PASTE.</>, beats: 3,
    say: "Drinks, desserts, veggie pizzas. Every item has a name and price. Is a pizza a kind of menu item?", script: ["Pizza IS-A MenuItem", "Drink IS-A MenuItem", "Why: shared data in one place"], body: <Specialization /> },
  { id: "inheritance", scene: "inherit", kicker: "WORKING SYSTEM / INHERITANCE", mins: 6, phase: 3, title: <>PUT SHARED DATA IN ONE PLACE.</>, say: "Parent MenuItem holds name and price; Pizza and Drink add their own details.",
    ...lab("inheritance", MENU + `\nclass Pizza(MenuItem):\n    def __init__(self, name, price, size):\n        super().__init__(name, price)\n        self.size = size\n\nclass Drink(MenuItem):\n    def __init__(self, name, price, volume_ml):\n        super().__init__(name, price)\n        self.volume_ml = volume_ml\n\nmargherita = Pizza("Margherita", 15, "large")\ncola = Drink("Cola", 3, 500)\n`, [
      { color: "blue", label: "Pizza(MenuItem)", text: "Pizza inherits MenuItem's behavior." }, { color: "blue", label: "super().__init__(...)", text: "Runs the parent initializer for name and price." },
      { color: "yellow", label: "Each adds its own", text: "Pizza adds size. Drink adds volume_ml." }]) },
  { id: "composition", scene: "inherit", kicker: "WORKING SYSTEM / COMPOSITION", mins: 5, phase: 3, title: <>A COMBO IS NOT A PIZZA. IT HAS ONE.</>, say: "Is a family combo a kind of pizza? No. It has a pizza and drinks: HAS-A.",
    ...lab("composition", MENU + `\nclass Pizza(MenuItem):\n    pass\n\nclass Drink(MenuItem):\n    pass\n\nclass Combo:\n    def __init__(self, pizza, drink):\n        self.pizza = pizza\n        self.drink = drink\n\npizza = Pizza("Margherita", 15)\ncola = Drink("Cola", 3)\ncombo = Combo(pizza, cola)\n`, [
      { color: "red", label: "IS-A test", text: "Is a Combo a kind of pizza? No. A kind of drink? No." }, { color: "green", label: "HAS-A", text: "A Combo has a pizza and has a drink — see the → links in the diagram." },
      { color: "yellow", label: "Rule of thumb", text: "Prefer composition. Keep relationships simple." }]) },
  { id: "polymorphism", scene: "system", kicker: "WORKING SYSTEM / POLYMORPHISM", mins: 6, phase: 3, title: <>ASK EVERYONE: "WHAT'S YOUR PRICE?"</>, say: "The receipt printer shouldn't need an if-chain for every menu type.",
    ...lab("polymorphism", `class Pizza:\n    def __init__(self, size):\n        self.size = size\n\n    def calculate_price(self):\n        return 20 if self.size == "large" else 12\n\nclass Drink:\n    def __init__(self, volume_ml):\n        self.volume_ml = volume_ml\n\n    def calculate_price(self):\n        return self.volume_ml // 100\n\nclass Combo:\n    def __init__(self, pizza, drink):\n        self.pizza = pizza\n        self.drink = drink\n\n    def calculate_price(self):\n        return self.pizza.calculate_price() + self.drink.calculate_price() - 2\n\npizza = Pizza("large")\ndrink = Drink(500)\ncombo = Combo(Pizza("small"), Drink(330))\ncart = [pizza, drink, combo]\nfor item in cart:\n    print(item.calculate_price())\n`, [
      { color: "green", label: "Same call", text: "item.calculate_price() — the receipt never checks the type." }, { color: "red", label: "Different behavior", text: "Pizza uses size, Drink uses volume, Combo applies a bundle discount." },
      { color: "yellow", label: "Not overloading", text: "Overriding = same name, own behavior per class. Overloading = same name, different parameters." }]) },
  { id: "abstraction", scene: "system", kicker: "WORKING SYSTEM / ABSTRACTION", mins: 6, phase: 3, title: <>PRESS THE BRAKE. SKIP THE HYDRAULICS.</>, say: "Credit cards and wallets need huge API code. Should Order contain all of it? No.",
    ...lab("abstraction", `class PaymentMethod:\n    def process_payment(self, amount):\n        raise NotImplementedError\n\nclass CreditCard(PaymentMethod):\n    def process_payment(self, amount):\n        # imagine: bank API calls, security checks...\n        return f"Charged {amount} to card"\n\nclass DigitalWallet(PaymentMethod):\n    def process_payment(self, amount):\n        return f"Paid {amount} with wallet"\n\ndef checkout(method, amount):\n    print(method.process_payment(amount))\n\ncard = CreditCard()\nwallet = DigitalWallet()\ncheckout(card, 33)\ncheckout(wallet, 33)\n`, [
      { color: "blue", label: "The contract", text: "PaymentMethod exposes one button: process_payment()." }, { color: "red", label: "Hidden gears", text: "Order doesn't care if it's a card or a wallet behind the pedal." },
      { color: "yellow", label: "Note", text: "Python doesn't enforce the contract; the base class documents it." }]) },
  { id: "checkout", scene: "system", kicker: "WORKING SYSTEM / PUTTING IT TOGETHER", mins: 3, phase: 3, title: <>SAM'S CHECKOUT: ALL FOUR, TOGETHER.</>, beats: 4,
    say: "Everything we built, in one checkout.", script: ["Encapsulation protects the payment status", "Inheritance + composition built the combo", "Polymorphism calculated the receipt", "Abstraction processed the card"], body: <Checkout /> },
  { id: "challenge", scene: "build", kicker: "CHALLENGE / INDEPENDENT PRACTICE", mins: 10, phase: 3, title: <>YOUR TURN. ADD A COUPON.</>, say: "Challenge: apply a coupon to Sam's order only.",
    ...lab("challenge", ORDER + `    # TODO: add apply_coupon(self, percent) that reduces the total\n    # reject percents outside 0-100\n\nsam = Order("Sam")\nnia = Order("Nia")\nsam.add_item("Margherita", 15)\nnia.add_item("Cola", 3)\n# TODO: apply a coupon to Sam's order only, then print both totals\n`, [
      { color: "red", label: "TASK", text: "Add a coupon to Order. Create two orders. Change only one. Optional: add a Dessert menu item with its own price rule." },
      { color: "yellow", label: "SUCCESS LOOKS LIKE", text: "Two distinct orders · only Sam's total changes · invalid coupons rejected. (2m plan / 6m code / 2m demonstrate)" },
      { color: "blue", label: "HINTS", text: "1. What data does the coupon change?  2. Who is allowed to change it?  3. Should bad input raise an error?" }]) },
  { id: "thinking", scene: "wrap", kicker: "RECAP / OBJECT-ORIENTED THINKING", mins: 3, phase: 3, title: <>THREE QUESTIONS, NOT FOUR WORDS.</>, beats: 4,
    say: "OOP isn't a vocabulary test; it's three questions about a messy problem.", script: ["Information", "Behavior", "Relationships", "What OO thinking is NOT"], body: <Thinking /> },
  { id: "qa", scene: "wrap", kicker: "RECAP / Q&A", mins: 3, phase: 3, title: <>YOU'RE NOT JUST WRITING CLASSES.<br />YOU'RE MODELING A SYSTEM.</>, beats: 2,
    say: "Class → object → state → rules → relationships. Questions?", script: ["Three questions to take with you", "Build small. Understand the model. Extend with intention."], body: <Wrap /> },
];
