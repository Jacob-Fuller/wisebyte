/* =========================================================
   WISEBYTE — LESSON LIBRARY (core)
   ---------------------------------------------------------
   This file defines topic categories and collections.
   Lessons live in the lessons-*.js files and are added with
   WB.LESSONS.push(...). Subjects (ordered courses of lessons,
   each with a mastery exam) live in subjects.js.

   Lesson format (Learn → Test → Recall → Review):
     id         unique, lowercase-with-dashes
     cat        a CATEGORIES key
     level      "beginner" | "intermediate" | "advanced"
     title, hook
     sections   [{ h: heading, b: body text, key: one-line takeaway }]
                6–8 sections of ~100–130 words (a 5–10 minute lesson).
                The key is reused for refreshers and recall prompts.
     quiz       [{ q, o: [options], a: right index, e: explanation,
                   s: index of the section it tests }]
     related    optional; defaults to the next lessons in its subject
     trending   true to show under Trending
     popularity 1–100 (optional, default 70)
     added      publish date (optional)
   ========================================================= */
window.WB = window.WB || {};

WB.CATEGORIES = {
  ancient:    { name: "Ancient & Medieval",       color: "#9A5B34", tag: "Pharaohs, emperors, Vikings and knights" },
  history:    { name: "Modern History",           color: "#8A4B3A", tag: "Revolutions, world wars and the making of today" },
  explore:    { name: "Explorers & Inventions",   color: "#7A6440", tag: "The voyages and ideas that changed everyday life" },
  science:    { name: "Science",                  color: "#3F6E8C", tag: "How the world really works" },
  space:      { name: "Space & Cosmos",           color: "#55538A", tag: "From our Moon to the edge of the universe" },
  geography:  { name: "Planet Earth",             color: "#3E7A5E", tag: "Volcanoes, weather, climate and wild places" },
  nature:     { name: "Wild Nature",              color: "#5E7A3A", tag: "Remarkable animals, oceans and ecosystems" },
  body:       { name: "The Human Body",           color: "#9A4A5A", tag: "The machine you live in" },
  psychology: { name: "The Mind",                 color: "#3F7A7A", tag: "Why we think, feel and act the way we do" },
  emotions:   { name: "Emotions & Relationships", color: "#8A5068", tag: "Happiness, love, friendship and resilience" },
  thinking:   { name: "Critical Thinking",        color: "#4F5E86", tag: "Spot nonsense, weigh evidence, decide well" },
  philosophy: { name: "Philosophy",               color: "#7A5C3E", tag: "The big questions, from Socrates to the Stoics" },
  money:      { name: "Money & Economics",        color: "#8F7129", tag: "Make, grow and understand money" },
  business:   { name: "Business & Work",          color: "#6A6A3A", tag: "Get ahead, persuade and build something" },
  life:       { name: "Life Skills",              color: "#A0522D", tag: "The practical know-how nobody teaches you" },
  food:       { name: "Food & Cooking",           color: "#9A6A2E", tag: "Cook better, eat smarter" },
  safety:     { name: "Safety & Survival",        color: "#A04632", tag: "Knowledge that could save a life" },
  technology: { name: "Technology",               color: "#4A6A82", tag: "What happens behind every tap and click" },
  ai:         { name: "AI & the Future",          color: "#4E5E9A", tag: "The technology reshaping everything" },
  arts:       { name: "Art & Music",              color: "#8A4F7A", tag: "See and hear with new eyes" },
  literature: { name: "Books & Language",         color: "#6B5B4A", tag: "Stories, words and how to use them" },
  beliefs:    { name: "Myths & Religions",        color: "#7A6A2F", tag: "Gods, heroes and what billions believe" },
  society:    { name: "Law & Government",         color: "#6E3F46", tag: "Power, rights and who makes the rules" },
  maths:      { name: "Maths",                    color: "#5A5F6E", tag: "Numbers that make life easier" },
};

WB.LESSONS = [];

/* Compact lesson helper used by the lessons-x-*.js files:
   WB.L(id, cat, level, title, hook,
        [[heading, key idea, body], ...],
        [[section index, question, [options], right index, explanation], ...], extra) */
WB.L = (id, cat, level, title, hook, sections, quiz, extra) => WB.LESSONS.push(Object.assign({
  id, audience: "adult", cat, level, title, hook, popularity: 70, added: "2026-09-25",
  sections: sections.map(([h, key, b]) => ({ h, key, b })),
  quiz: quiz.map(([s, q, o, a, e]) => ({ s, q, o, a, e })),
}, extra || {}));

WB.COLLECTIONS = [
  { id: "simple", title: "Explain It Simply", desc: "Understand complicated things without reading a 30-page article.", icon: "bulb",
    ids: ["quantum", "ai-models", "blockchain", "black-holes", "big-bang", "climate-change", "dna", "compound-interest", "inflation", "supply-demand", "evolution", "encryption", "cognitive-biases"] },
  { id: "life", title: "Life Skills", desc: "Practical know-how for money, safety, home, work and people.", icon: "tools",
    ids: ["budgeting", "scams", "superannuation", "tax-basics", "cooking", "first-aid", "home-maintenance", "car-basics", "digital-security", "communication", "negotiation", "time-management", "public-speaking"] },
  { id: "critical", title: "Critical Thinking", desc: "Reason clearly, weigh evidence and see through weak arguments.", icon: "scale",
    ids: ["correlation-causation", "logical-fallacies", "evidence", "probability", "statistics", "misinformation", "cognitive-biases", "persuasion", "decisions"] },
  { id: "health", title: "Everyday Health", desc: "What the evidence says about looking after your body and mind.", icon: "heart",
    ids: ["sleep", "nutrition", "exercise", "stress", "sun-safety", "immune-system", "brain", "antibiotics"] },
  { id: "memory", title: "Memory Tools", desc: "Techniques to learn faster and remember for longer.", icon: "brain",
    ids: ["mnemonics", "memory-palace", "forgetting-curve", "sleep", "brain"] },
];

/* Subjects (learning paths) live in subjects.js */
