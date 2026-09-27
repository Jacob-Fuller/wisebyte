/* =========================================================
   WISEBYTE — SUBJECTS
   ---------------------------------------------------------
   A subject is an ordered course of lessons. Finish every
   lesson to unlock its mastery exam; pass the exam to master
   the subject. A lesson can appear in more than one subject.
     id     unique, starts with "s-"
     area   an AREAS key (groups subjects in the Library)
     cat    CATEGORIES key used for its colour
     title, desc
     steps  lesson ids, in teaching order
   ========================================================= */
window.WB = window.WB || {};

WB.AREAS = [
  { id: "history", name: "History & Civilisation" },
  { id: "science", name: "Science & Nature" },
  { id: "mind",    name: "Mind & Philosophy" },
  { id: "money",   name: "Money & Work" },
  { id: "life",    name: "Life Skills" },
  { id: "tech",    name: "Technology" },
  { id: "culture", name: "Culture & Beliefs" },
  { id: "world",   name: "World & Society" },
];

WB.SUBJECTS = [
  /* ---------------- History & Civilisation ---------------- */
  { id: "s-world-history", area: "history", cat: "history", title: "World History: The Big Picture", desc: "The turning points that shaped how we live, from the first Australians to the Cold War.",
    steps: ["first-australians", "ancient-egypt", "ancient-rome", "black-death", "printing-press", "renaissance", "industrial-revolution", "ww1", "ww2", "cold-war"] },
  { id: "s-first-civs", area: "history", cat: "ancient", title: "The First Civilisations", desc: "Where cities, writing, law and empire began.",
    steps: ["mesopotamia", "writing-origins", "ancient-egypt", "indus-valley", "ancient-china", "maya-aztec-inca"] },
  { id: "s-ancient-greece", area: "history", cat: "ancient", title: "Ancient Greece", desc: "Democracy, philosophy, theatre and war: the civilisation behind Western thought.",
    steps: ["greek-city-states", "greek-democracy", "greek-wars", "greek-philosophers", "alexander", "greek-legacy"] },
  { id: "s-ancient-rome", area: "history", cat: "ancient", title: "Ancient Rome", desc: "How a village became an empire, and why it fell.",
    steps: ["ancient-rome", "roman-republic", "julius-caesar", "roman-daily-life", "roman-engineering", "fall-of-rome"] },
  { id: "s-middle-ages", area: "history", cat: "ancient", title: "The Middle Ages", desc: "Knights, Vikings, plague and the ideas that carried the world forward.",
    steps: ["feudalism", "vikings", "islamic-golden-age", "crusades", "magna-carta", "black-death", "printing-press"] },
  { id: "s-revolutions", area: "history", cat: "history", title: "The Age of Revolutions", desc: "The upheavals in science, politics and industry that made the modern world.",
    steps: ["scientific-revolution", "american-revolution", "french-revolution", "industrial-revolution", "abolition", "russian-revolution"] },
  { id: "s-20th-century", area: "history", cat: "history", title: "The 20th Century", desc: "World wars, depression, genocide, civil rights and the end of empires.",
    steps: ["ww1", "great-depression", "ww2", "holocaust", "cold-war", "end-of-empires", "civil-rights"] },
  { id: "s-australian-history", area: "history", cat: "history", title: "Australian History", desc: "From the world's oldest living cultures to a modern multicultural nation.",
    steps: ["first-australians", "first-fleet", "gold-rush", "federation", "ww1", "modern-australia"] },
  { id: "s-explorers", area: "history", cat: "explore", title: "Great Explorers", desc: "The voyages that mapped the world, and what they cost.",
    steps: ["polynesian-navigators", "marco-polo", "age-of-discovery", "magellan", "cook", "polar-explorers"] },

  /* ---------------- Science & Nature ---------------- */
  { id: "s-human-body", area: "science", cat: "body", title: "The Human Body", desc: "How the machine you live in actually works.",
    steps: ["heart-blood", "digestion", "muscles-bones", "senses", "brain", "immune-system", "sleep"] },
  { id: "s-brain", area: "science", cat: "body", title: "The Brain", desc: "Neurons, chemicals, dreams and the mystery of consciousness.",
    steps: ["brain", "neurons", "brain-chemicals", "sleep", "dreams", "consciousness"] },
  { id: "s-chemistry", area: "science", cat: "science", title: "Chemistry Basics", desc: "What everything is made of, and how it changes.",
    steps: ["atoms", "periodic-table", "chemical-reactions", "acids-bases", "water", "kitchen-chemistry"] },
  { id: "s-physics", area: "science", cat: "science", title: "Physics Basics", desc: "Motion, energy, light and the strange rules of the very big and very small.",
    steps: ["newtons-laws", "gravity", "energy", "electricity", "light", "relativity", "quantum"] },
  { id: "s-evolution", area: "science", cat: "science", title: "Evolution & Genetics", desc: "How life changes, and the code that carries it.",
    steps: ["evolution", "dna", "genes-inheritance", "human-evolution", "extinction", "gene-editing"] },
  { id: "s-prehistoric", area: "science", cat: "science", title: "Prehistoric Life", desc: "Four billion years of life before us.",
    steps: ["first-life", "fossils", "dinosaurs", "dino-extinction", "megafauna", "extinction"] },
  { id: "s-universe", area: "science", cat: "space", title: "The Universe", desc: "From our Moon to the edge of a black hole.",
    steps: ["solar-system", "moon", "stars", "galaxies", "exoplanets", "black-holes", "big-bang"] },
  { id: "s-space-exploration", area: "science", cat: "space", title: "Space Exploration", desc: "How humans left the planet, and where we're going next.",
    steps: ["rockets", "space-race", "moon-landing", "iss", "telescopes", "mars"] },
  { id: "s-planet-earth", area: "science", cat: "geography", title: "Planet Earth & Climate", desc: "The forces that shape our planet, its weather and its climate.",
    steps: ["earth-structure", "plate-tectonics", "volcanoes-earthquakes", "weather", "australia-climate", "ice-ages", "climate-change", "renewable-energy"] },
  { id: "s-oceans", area: "science", cat: "nature", title: "The Oceans", desc: "The least explored place on Earth, and the life within it.",
    steps: ["ocean-zones", "ocean-currents", "deep-sea", "sharks", "whales", "octopus-mind", "great-barrier-reef"] },
  { id: "s-medicine", area: "science", cat: "body", title: "Medicine & Disease", desc: "How we learned to fight illness, and how we know what works.",
    steps: ["germ-theory", "vaccines", "antibiotics", "anaesthesia-surgery", "pandemics", "clinical-trials", "placebo"] },

  /* ---------------- Mind & Philosophy ---------------- */
  { id: "s-psychology", area: "mind", cat: "psychology", title: "Psychology", desc: "How your mind learns, forms habits, decides and gets persuaded.",
    steps: ["conditioning", "famous-experiments", "personality", "habits", "cognitive-biases", "procrastination", "placebo", "persuasion"] },
  { id: "s-social-psych", area: "mind", cat: "psychology", title: "Social Psychology", desc: "Why we conform, obey, stand by, and judge in seconds.",
    steps: ["first-impressions", "conformity", "obedience", "bystander-effect", "groupthink", "famous-experiments"] },
  { id: "s-manipulation", area: "mind", cat: "psychology", title: "Spotting Manipulation", desc: "Recognise the tactics people use to control and exploit, and protect yourself.",
    steps: ["manipulation-tactics", "gaslighting", "dark-triad", "cults", "persuasion", "scams"] },
  { id: "s-mind-quirks", area: "mind", cat: "psychology", title: "Quirks of the Mind", desc: "False memories, illusions and the strange ways your brain fools you.",
    steps: ["false-memories", "optical-illusions", "dunning-kruger", "intuition", "cognitive-biases", "placebo"] },
  { id: "s-critical-thinking", area: "mind", cat: "thinking", title: "Critical Thinking", desc: "Spot bad reasoning, weigh evidence and decide well.",
    steps: ["correlation-causation", "misinformation", "logical-fallacies", "cognitive-biases", "probability", "statistics", "evidence"] },
  { id: "s-decisions", area: "mind", cat: "thinking", title: "Better Decisions", desc: "Tools for thinking clearly when the stakes are real.",
    steps: ["decisions", "mental-models", "risk", "probability", "game-theory"] },
  { id: "s-philosophy", area: "mind", cat: "philosophy", title: "Philosophy: Big Ideas", desc: "The questions humans have argued about for 2,500 years.",
    steps: ["greek-philosophers", "socratic-method", "eastern-philosophy", "ethics", "enlightenment", "free-will", "existentialism"] },
  { id: "s-stoicism", area: "mind", cat: "philosophy", title: "Stoicism", desc: "The ancient philosophy of calm, courage and self-command.",
    steps: ["stoicism", "stoic-founders", "epictetus", "seneca", "marcus-aurelius", "stoic-practices"] },
  { id: "s-memory-learning", area: "mind", cat: "psychology", title: "Memory & Learning", desc: "Learn faster, remember longer and focus deeper.",
    steps: ["forgetting-curve", "mnemonics", "memory-palace", "learning-science", "focus", "growth-mindset"] },
  { id: "s-emotional-intelligence", area: "mind", cat: "emotions", title: "Emotional Intelligence", desc: "Understand emotions, yours and other people's.",
    steps: ["emotions-science", "emotional-regulation", "stress", "empathy", "resilience", "communication"] },
  { id: "s-happiness", area: "mind", cat: "emotions", title: "The Science of Happiness", desc: "What decades of research say about living well.",
    steps: ["happiness-science", "hedonic-adaptation", "gratitude", "social-connection", "meaning", "mindfulness"] },

  /* ---------------- Money & Work ---------------- */
  { id: "s-finance", area: "money", cat: "money", title: "Financial Literacy", desc: "From your first budget to super, tax, loans and insurance.",
    steps: ["budgeting", "compound-interest", "credit-scores", "tax-basics", "superannuation", "insurance", "home-loans", "scams", "retirement"] },
  { id: "s-investing", area: "money", cat: "money", title: "Investing", desc: "How investing works, and the mistakes that cost people most.",
    steps: ["risk-return", "stock-market", "bonds", "diversification", "index-funds", "property-investing", "investing-mistakes"] },
  { id: "s-economics", area: "money", cat: "money", title: "Economics", desc: "Why prices rise, economies grow and recessions happen.",
    steps: ["supply-demand", "gdp", "inflation", "interest-rates", "trade", "recessions"] },
  { id: "s-business", area: "money", cat: "business", title: "Starting a Business", desc: "From idea to first customers, and why so many fail.",
    steps: ["business-idea", "business-model", "marketing-basics", "cash-flow", "start-business-au", "startup-lessons"] },
  { id: "s-work", area: "money", cat: "business", title: "Get Ahead at Work", desc: "Communicate, focus, persuade and negotiate with confidence.",
    steps: ["communication", "time-management", "procrastination", "writing-emails", "public-speaking", "negotiation", "job-interview"] },
  { id: "s-persuasion", area: "money", cat: "business", title: "Persuasion & Rhetoric", desc: "The ancient art of speaking well, and how it's used on you.",
    steps: ["aristotle-rhetoric", "storytelling", "famous-speeches", "arguing-well", "body-language", "persuasion"] },

  /* ---------------- Life Skills ---------------- */
  { id: "s-adulting", area: "life", cat: "life", title: "Adulting 101", desc: "The life skills nobody formally teaches you.",
    steps: ["budgeting", "cooking", "home-maintenance", "car-basics", "renting", "digital-security", "scams", "tax-basics", "first-aid"] },
  { id: "s-fitness", area: "life", cat: "body", title: "Health & Fitness", desc: "What the evidence says about moving, eating and staying well.",
    steps: ["exercise", "cardio-fitness", "strength-training", "nutrition", "alcohol", "stress", "sun-safety"] },
  { id: "s-food", area: "life", cat: "food", title: "Food & Cooking", desc: "Cook with confidence, safely and on a budget.",
    steps: ["cooking", "knife-skills", "flavour", "food-safety", "baking-science", "meal-planning"] },
  { id: "s-safety", area: "life", cat: "safety", title: "First Aid & Safety", desc: "The knowledge that could save a life, including your own.",
    steps: ["first-aid", "cpr", "bites-stings", "water-safety", "bushfire-safety", "sun-safety"] },
  { id: "s-relationships", area: "life", cat: "emotions", title: "Relationships", desc: "Build, keep and repair the connections that matter most.",
    steps: ["communication", "attachment", "love-science", "conflict", "boundaries", "adult-friendship"] },
  { id: "s-law", area: "life", cat: "society", title: "Law & Your Rights", desc: "How Australian law works, and the rights you have every day.",
    steps: ["legal-system-au", "constitution-au", "contracts", "consumer-rights", "workplace-rights", "renting"] },

  /* ---------------- Technology ---------------- */
  { id: "s-tech", area: "tech", cat: "technology", title: "How Tech Works", desc: "What happens behind every tap and click.",
    steps: ["computers-work", "binary", "internet", "smartphones", "gps", "encryption", "blockchain"] },
  { id: "s-ai", area: "tech", cat: "ai", title: "Artificial Intelligence", desc: "What AI is, how it learns, and what it means for us.",
    steps: ["ai-history", "machine-learning", "ai-models", "ai-images", "using-ai-well", "ai-risks"] },
  { id: "s-cyber", area: "tech", cat: "technology", title: "Cybersecurity", desc: "Protect your accounts, money and privacy online.",
    steps: ["passwords", "phishing", "scams", "digital-security", "privacy", "hacking", "encryption"] },
  { id: "s-coding", area: "tech", cat: "technology", title: "Coding Basics", desc: "How software works, explained without the jargon.",
    steps: ["what-is-code", "binary", "algorithms", "programming-languages", "how-websites", "debugging"] },

  /* ---------------- Culture & Beliefs ---------------- */
  { id: "s-art", area: "culture", cat: "arts", title: "Art History", desc: "From cave walls to modern galleries: how to see art.",
    steps: ["cave-art", "aboriginal-art", "renaissance", "impressionism", "modern-art", "looking-at-art"] },
  { id: "s-music", area: "culture", cat: "arts", title: "Music", desc: "How music works, where it came from, and why it moves us.",
    steps: ["how-music-works", "instruments", "classical-music", "popular-music", "music-brain"] },
  { id: "s-books", area: "culture", cat: "literature", title: "Great Books", desc: "The stories and poems that shaped the world.",
    steps: ["epics", "shakespeare", "the-novel", "poetry", "dystopias"] },
  { id: "s-language", area: "culture", cat: "literature", title: "Words & Language", desc: "Where language came from, and how to use it well.",
    steps: ["language-origins", "english-language", "etymology", "world-languages", "grammar-myths", "writing-well"] },
  { id: "s-mythology", area: "culture", cat: "beliefs", title: "Mythology", desc: "The gods, heroes and monsters that still shape our stories.",
    steps: ["why-myths", "greek-gods", "greek-heroes", "norse-myths", "egyptian-myths"] },
  { id: "s-religions", area: "culture", cat: "beliefs", title: "World Religions", desc: "What billions of people believe, and why it matters, explained neutrally.",
    steps: ["religions-overview", "hinduism", "judaism", "buddhism", "christianity", "islam"] },

  /* ---------------- World & Society ---------------- */
  { id: "s-geography", area: "world", cat: "geography", title: "World Geography", desc: "The shape of the world, and how people live on it.",
    steps: ["continents", "rivers-mountains", "deserts", "borders", "cities", "population"] },
  { id: "s-government", area: "world", cat: "society", title: "Government & Democracy", desc: "How power is organised, from your local MP to the United Nations.",
    steps: ["how-democracy", "political-ideas", "australian-parliament", "voting-au", "human-rights", "united-nations"] },
  { id: "s-wild-australia", area: "world", cat: "nature", title: "Wild Australia", desc: "The world's strangest animals, and the truth about the dangerous ones.",
    steps: ["marsupials", "monotremes", "australian-birds", "reptiles", "wildlife", "great-barrier-reef"] },
  { id: "s-animals", area: "world", cat: "nature", title: "Amazing Animals", desc: "Minds, senses and journeys that outdo our own.",
    steps: ["animal-intelligence", "animal-senses", "migration", "octopus-mind", "bees"] },
  { id: "s-maths", area: "world", cat: "maths", title: "Everyday Maths", desc: "The numbers skills that make life easier and harder to fool.",
    steps: ["percentages", "mental-maths", "big-numbers", "compound-interest", "probability", "statistics", "famous-maths"] },
  { id: "s-inventions", area: "world", cat: "explore", title: "Great Inventions", desc: "The ideas that changed everyday life.",
    steps: ["printing-press", "engines", "electric-light", "telephone-radio", "flight", "australian-inventions"] },
];


/* Topic overrides: moves lessons into the more specific topics */
WB.RECAT = {
  // ancient & medieval
  "ancient-egypt": "ancient", "ancient-rome": "ancient", "first-australians": "ancient", "black-death": "ancient",
  "mesopotamia": "ancient", "indus-valley": "ancient", "ancient-china": "ancient", "maya-aztec-inca": "ancient",
  "greek-city-states": "ancient", "greek-democracy": "ancient", "greek-wars": "ancient", "alexander": "ancient", "greek-legacy": "ancient",
  "roman-republic": "ancient", "julius-caesar": "ancient", "roman-daily-life": "ancient", "roman-engineering": "ancient", "fall-of-rome": "ancient",
  "feudalism": "ancient", "vikings": "ancient", "islamic-golden-age": "ancient", "crusades": "ancient",
  // explorers & inventions
  "printing-press": "explore",
  // other moves
  "cooking": "food", "first-aid": "safety", "sun-safety": "safety", "communication": "emotions", "ai-models": "ai",
};
WB.LESSONS.forEach(l => { if (WB.RECAT[l.id]) l.cat = WB.RECAT[l.id]; });

WB.PATHS = WB.SUBJECTS; // older code reads WB.PATHS
