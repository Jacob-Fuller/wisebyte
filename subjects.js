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
    steps: ["mesopotamia", "code-of-hammurabi", "writing-origins", "ancient-egypt", "rosetta-stone", "indus-valley", "ancient-china", "persian-empire", "maya-aztec-inca"] },
  { id: "s-ancient-greece", area: "history", cat: "ancient", title: "Ancient Greece", desc: "Democracy, philosophy, theatre and war: the civilisation behind Western thought.",
    steps: ["greek-city-states", "ancient-olympics", "greek-democracy", "greek-wars", "greek-philosophers", "alexander", "antikythera-mechanism", "greek-legacy"] },
  { id: "s-ancient-rome", area: "history", cat: "ancient", title: "Ancient Rome", desc: "How a village became an empire, and why it fell.",
    steps: ["ancient-rome", "roman-republic", "hannibal-punic-wars", "julius-caesar", "cleopatra", "roman-daily-life", "roman-engineering", "hadrians-wall", "fall-of-rome"] },
  { id: "s-middle-ages", area: "history", cat: "ancient", title: "The Middle Ages", desc: "Knights, Vikings, plague and the ideas that carried the world forward.",
    steps: ["feudalism", "medieval-knights", "medieval-myths", "vikings", "norman-conquest-1066", "byzantine-empire", "islamic-golden-age", "crusades", "mongol-empire", "mali-empire-mansa-musa", "magna-carta", "gothic-cathedrals", "black-death", "printing-press"] },
  { id: "s-revolutions", area: "history", cat: "history", title: "The Age of Revolutions", desc: "The upheavals in science, politics and industry that made the modern world.",
    steps: ["scientific-revolution", "american-revolution", "french-revolution", "industrial-revolution", "revolutions-of-1848", "abolition", "russian-revolution"] },
  { id: "s-20th-century", area: "history", cat: "history", title: "The 20th Century", desc: "World wars, depression, genocide, civil rights and the end of empires.",
    steps: ["ww1", "christmas-truce-1914", "great-depression", "ww2", "dunkirk-evacuation", "holocaust", "nuremberg-trials", "cold-war", "maos-china", "end-of-empires", "civil-rights", "apartheid-south-africa"] },
  { id: "s-australian-history", area: "history", cat: "history", title: "Australian History", desc: "From the world's oldest living cultures to a modern multicultural nation.",
    steps: ["first-australians", "first-fleet", "matthew-flinders", "gold-rush", "federation", "votes-for-women-au", "ww1", "kokoda-track", "vietnam-war-australia", "referendum-1967", "modern-australia"] },
  { id: "s-explorers", area: "history", cat: "explore", title: "Great Explorers", desc: "The voyages that mapped the world, and what they cost.",
    steps: ["polynesian-navigators", "ibn-battuta", "marco-polo", "zheng-he", "age-of-discovery", "magellan", "longitude-problem", "cook", "scurvy-vitamin-c", "matthew-flinders", "burke-and-wills", "polar-explorers", "shackleton-endurance"] },
  { id: "s-disasters", area: "history", cat: "history", title: "Disasters That Changed the World", desc: "Catastrophes and what the world learned from them.",
    steps: ["pompeii-herculaneum", "great-fire-of-london", "year-without-summer", "irish-great-famine", "titanic-sinking", "chernobyl", "tropical-cyclones", "disaster-psychology", "bronze-age-collapse", "sanctum-collapse"] },

  /* ---------------- Science & Nature ---------------- */
  { id: "s-human-body", area: "science", cat: "body", title: "The Human Body", desc: "How the machine you live in actually works.",
    steps: ["cells", "heart-blood", "how-breathing-works", "digestion", "gut-microbiome", "liver-chemical-factory", "kidneys-filters", "hormones-messengers", "muscles-bones", "skin-largest-organ", "senses", "brain", "immune-system", "sleep"] },
  { id: "s-brain", area: "science", cat: "body", title: "The Brain", desc: "Neurons, chemicals, dreams and the mystery of consciousness.",
    steps: ["brain", "neurons", "reflexes-spinal-cord", "science-of-pain", "brain-chemicals", "sleep", "dreams", "consciousness", "sanctum-hard-problem"] },
  { id: "s-chemistry", area: "science", cat: "science", title: "Chemistry Basics", desc: "What everything is made of, and how it changes.",
    steps: ["atoms", "states-of-matter", "periodic-table", "carbon-element", "radioactivity", "chemical-reactions", "enzymes", "acids-bases", "water", "plastics-polymers", "kitchen-chemistry"] },
  { id: "s-physics", area: "science", cat: "science", title: "Physics Basics", desc: "Motion, energy, light and the strange rules of the very big and very small.",
    steps: ["newtons-laws", "gravity", "why-things-float", "energy", "heat-temperature", "sanctum-entropy", "electricity", "magnetism", "light", "sound", "relativity", "quantum", "antimatter"] },
  { id: "s-evolution", area: "science", cat: "science", title: "Evolution & Genetics", desc: "How life changes, and the code that carries it.",
    steps: ["evolution", "island-evolution", "symbiosis", "cells", "dna", "genes-inheritance", "human-evolution", "vestigial-body-parts", "extinction", "gene-editing"] },
  { id: "s-prehistoric", area: "science", cat: "science", title: "Prehistoric Life", desc: "Three and a half billion years of life before us.",
    steps: ["first-life", "fossils", "dinosaurs", "dino-extinction", "megafauna", "extinction"] },
  { id: "s-universe", area: "science", cat: "space", title: "The Universe", desc: "From our Moon to the edge of a black hole.",
    steps: ["solar-system", "venus", "jupiter-saturn", "moon", "eclipses", "stars", "galaxies", "cosmic-distance-ladder", "dark-matter-energy", "exoplanets", "sanctum-fermi", "black-holes", "gravitational-waves", "big-bang"] },
  { id: "s-space-exploration", area: "science", cat: "space", title: "Space Exploration", desc: "How humans left the planet, and where we're going next.",
    steps: ["rockets", "space-race", "moon-landing", "australia-in-space", "iss", "space-junk", "telescopes", "voyager-probes", "mars", "planetary-defence"] },
  { id: "s-planet-earth", area: "science", cat: "geography", title: "Planet Earth & Climate", desc: "The forces that shape our planet, its weather and its climate.",
    steps: ["earth-structure", "plate-tectonics", "volcanoes-earthquakes", "supervolcanoes", "weather", "cloud-types", "tropical-cyclones", "australia-climate", "ice-ages", "glaciers", "green-sahara", "ice-cores", "climate-change", "renewable-energy"] },
  { id: "s-oceans", area: "science", cat: "nature", title: "The Oceans", desc: "The least explored place on Earth, and the life within it.",
    steps: ["ocean-zones", "ocean-currents", "deep-sea", "challenger-deep", "bioluminescence", "sharks", "whales", "octopus-mind", "great-barrier-reef"] },
  { id: "s-medicine", area: "science", cat: "body", title: "Medicine & Disease", desc: "How we learned to fight illness, and how we know what works.",
    steps: ["germ-theory", "viruses", "vaccines", "antibiotics", "anaesthesia-surgery", "blood-types-explained", "pandemics", "clinical-trials", "scurvy-vitamin-c", "placebo", "what-cancer-is", "ai-in-medicine"] },

  /* ---------------- Mind & Philosophy ---------------- */
  { id: "s-psychology", area: "mind", cat: "psychology", title: "Psychology", desc: "How your mind learns, forms habits, decides and gets persuaded.",
    steps: ["conditioning", "learned-helplessness", "famous-experiments", "personality", "habits", "self-control-marshmallow", "cognitive-biases", "cognitive-dissonance", "procrastination", "placebo", "persuasion"] },
  { id: "s-social-psych", area: "mind", cat: "psychology", title: "Social Psychology", desc: "Why we conform, obey, stand by, and judge in seconds.",
    steps: ["first-impressions", "spotlight-effect", "conformity", "emotional-contagion", "obedience", "bystander-effect", "stockholm-syndrome", "groupthink", "famous-experiments"] },
  { id: "s-manipulation", area: "mind", cat: "psychology", title: "Spotting Manipulation", desc: "Recognise the tactics people use to control and exploit, and protect yourself.",
    steps: ["manipulation-tactics", "gaslighting", "dark-triad", "cults", "persuasion", "illusory-truth-effect", "cold-reading-barnum-effect", "scams"] },
  { id: "s-mind-quirks", area: "mind", cat: "psychology", title: "Quirks of the Mind", desc: "False memories, illusions and the strange ways your brain fools you.",
    steps: ["false-memories", "optical-illusions", "inattentional-blindness", "cant-tickle-yourself", "dunning-kruger", "illusion-of-explanatory-depth", "intuition", "patterns-in-randomness", "time-perception", "cognitive-biases", "placebo"] },
  { id: "s-critical-thinking", area: "mind", cat: "thinking", title: "Critical Thinking", desc: "Spot bad reasoning, weigh evidence and decide well.",
    steps: ["deduction-induction-abduction", "correlation-causation", "misinformation", "conspiracy-theories", "logical-fallacies", "wason-confirmation-bias", "cognitive-biases", "illusory-truth-effect", "probability", "law-of-small-numbers", "statistics", "regression-to-the-mean", "evidence", "science-vs-pseudoscience"] },
  { id: "s-decisions", area: "mind", cat: "thinking", title: "Better Decisions", desc: "Tools for thinking clearly when the stakes are real.",
    steps: ["decisions", "opportunity-cost", "mental-models", "sanctum-second-order", "risk", "outcome-bias", "probability", "framing-effect", "choice-overload", "game-theory"] },
  { id: "s-philosophy", area: "mind", cat: "philosophy", title: "Philosophy: Big Ideas", desc: "The questions humans have argued about for 2,500 years.",
    steps: ["greek-philosophers", "epicurus-pleasure", "socratic-method", "eastern-philosophy", "ubuntu-philosophy", "islamic-golden-age-philosophy", "ethics", "descartes-doubt", "enlightenment", "problem-of-induction", "free-will", "nietzsche-misunderstood", "existentialism"] },
  { id: "s-stoicism", area: "mind", cat: "philosophy", title: "Stoicism", desc: "The ancient philosophy of calm, courage and self-command.",
    steps: ["stoicism", "stoic-founders", "epictetus", "seneca", "marcus-aurelius", "stoic-practices"] },
  { id: "s-memory-learning", area: "mind", cat: "psychology", title: "Memory & Learning", desc: "Learn faster, remember longer and focus deeper.",
    steps: ["forgetting-curve", "mnemonics", "memory-palace", "learning-science", "focus", "growth-mindset"] },
  { id: "s-emotional-intelligence", area: "mind", cat: "emotions", title: "Emotional Intelligence", desc: "Understand emotions, yours and other people's.",
    steps: ["emotions-science", "fear-science", "emotional-regulation", "anger-and-venting", "shame-and-guilt", "stress", "empathy", "resilience", "self-compassion", "communication"] },
  { id: "s-happiness", area: "mind", cat: "emotions", title: "The Science of Happiness", desc: "What decades of research say about living well.",
    steps: ["happiness-science", "hedonic-adaptation", "gratitude", "science-of-awe", "social-connection", "meaning", "regret-science", "mindfulness"] },
  { id: "s-hoaxes", area: "mind", cat: "thinking", title: "Hoaxes, Frauds & Mistakes", desc: "How clever people were fooled, and how to avoid being next.",
    steps: ["mechanical-turk", "shortcut-learning", "n-rays-blondlot", "piltdown-man-hoax", "ern-malley-hoax", "art-forgery", "scams", "cold-reading-barnum-effect", "sanctum-replication", "science-vs-pseudoscience", "misinformation"] },
  { id: "s-strange-minds", area: "mind", cat: "psychology", title: "Strange Cases of the Mind", desc: "Real cases that revealed how the brain makes the mind.",
    steps: ["phineas-gage", "sleep-paralysis", "deja-vu", "patient-hm", "phantom-limbs", "split-brain"] },
  { id: "s-thought-experiments", area: "mind", cat: "philosophy", title: "Thought Experiments", desc: "Imaginary scenarios that test what you really believe.",
    steps: ["trolley-problem", "ship-of-theseus", "ring-of-gyges", "experience-machine", "descartes-doubt", "can-machines-have-minds", "sanctum-hard-problem", "drowning-child", "zeno-paradoxes", "pascals-wager", "veil-of-ignorance", "sorites-paradox", "gettier-problem"] },

  /* ---------------- Money & Work ---------------- */
  { id: "s-finance", area: "money", cat: "money", title: "Financial Literacy", desc: "From your first budget to super, tax, loans and insurance.",
    steps: ["budgeting", "building-an-emergency-fund", "compound-interest", "credit-scores", "comparing-personal-loans", "getting-out-of-debt", "tax-basics", "lodging-your-tax-return", "superannuation", "super-housekeeping", "insurance", "income-protection-insurance", "home-loans", "buying-a-home-step-by-step", "scams", "retirement"] },
  { id: "s-investing", area: "money", cat: "money", title: "Investing", desc: "How investing works, and the mistakes that cost people most.",
    steps: ["risk-return", "sanctum-ergodicity", "stock-market", "economic-moats", "valuing-a-business", "bonds", "diversification", "index-funds", "property-investing", "behavioural-economics-money", "financial-bubbles", "investing-mistakes"] },
  { id: "s-economics", area: "money", cat: "money", title: "Economics", desc: "Why prices rise, economies grow and recessions happen.",
    steps: ["opportunity-cost", "supply-demand", "externalities", "monopolies-competition", "incentives", "gdp", "inflation", "interest-rates", "trade", "exchange-rates-aussie-dollar", "recessions", "great-economic-debate"] },
  { id: "s-business", area: "money", cat: "business", title: "Starting a Business", desc: "From idea to first customers, and why so many fail.",
    steps: ["business-idea", "business-model", "unit-economics", "marketing-basics", "power-of-brands", "pricing-psychology", "cash-flow", "double-entry-bookkeeping", "start-business-au", "startup-lessons"] },
  { id: "s-work", area: "money", cat: "business", title: "Get Ahead at Work", desc: "Communicate, focus, persuade and negotiate with confidence.",
    steps: ["communication", "time-management", "procrastination", "writing-emails", "giving-and-receiving-feedback", "running-a-good-meeting", "public-speaking", "negotiation", "resume-that-gets-read", "job-interview", "asking-for-a-pay-rise", "leaving-a-job-well", "burnout-and-disconnecting"] },
  { id: "s-persuasion", area: "money", cat: "business", title: "Persuasion & Rhetoric", desc: "The ancient art of speaking well, and how it's used on you.",
    steps: ["aristotle-rhetoric", "storytelling", "famous-speeches", "arguing-well", "body-language", "persuasion", "framing-effect"] },
  { id: "s-story-of-money", area: "money", cat: "money", title: "The Story of Money", desc: "From shells and silver to crashes and central banks.",
    steps: ["history-of-money", "medici-bank", "double-entry-bookkeeping", "how-banks-create-money", "bank-runs", "financial-bubbles", "hyperinflation", "decimal-currency-1966", "gold-standard-bretton-woods", "global-financial-crisis", "quantitative-easing"] },
  { id: "s-brand-stories", area: "money", cat: "business", title: "Brand Stories", desc: "The triumphs and blunders behind famous brands.",
    steps: ["power-of-brands", "ford-toyota-production", "mcdonalds-franchising", "tupperware-brownie-wise", "post-it-note-story", "ikea-flat-pack", "new-coke-1985", "tylenol-crisis-1982", "kodak-disruption"] },

  /* ---------------- Life Skills ---------------- */
  { id: "s-adulting", area: "life", cat: "life", title: "Adulting 101", desc: "The life skills nobody formally teaches you.",
    steps: ["budgeting", "building-an-emergency-fund", "cooking", "laundry-done-right", "home-maintenance", "hiring-a-tradie", "car-basics", "buying-a-used-car", "renting", "moving-house-checklist", "digital-security", "scams", "tax-basics", "lodging-your-tax-return", "first-aid", "medicare-and-finding-a-gp", "mygov-and-government-services"] },
  { id: "s-fitness", area: "life", cat: "body", title: "Health & Fitness", desc: "What the evidence says about moving, eating and staying well.",
    steps: ["exercise", "cardio-fitness", "strength-training", "nutrition", "water-and-thirst", "alcohol", "stress", "sleep", "sun-safety"] },
  { id: "s-food", area: "life", cat: "food", title: "Food & Cooking", desc: "Cook with confidence, safely and on a budget.",
    steps: ["cooking", "knife-skills", "cookware-pans-guide", "flavour", "food-safety", "kitchen-chemistry", "kitchen-myths-busted", "baking-science", "fermentation-microbes", "meal-planning"] },
  { id: "s-safety", area: "life", cat: "safety", title: "First Aid & Safety", desc: "The knowledge that could save a life, including your own.",
    steps: ["first-aid", "cpr", "choking-first-aid", "severe-bleeding", "heart-attack-stroke-signs", "crash-scene-first-aid", "bites-stings", "poisons-and-button-batteries", "water-safety", "bushfire-safety", "heatwave-safety", "flood-safety", "home-fire-safety", "sun-safety", "lost-in-the-bush", "emergency-kit-plan"] },
  { id: "s-relationships", area: "life", cat: "emotions", title: "Relationships", desc: "Build, keep and repair the connections that matter most.",
    steps: ["communication", "attachment", "siblings-science", "love-science", "love-languages", "jealousy-and-envy", "conflict", "art-of-apology", "forgiveness-science", "boundaries", "adult-friendship"] },
  { id: "s-law", area: "life", cat: "society", title: "Law & Your Rights", desc: "How Australian law works, and the rights you have every day.",
    steps: ["legal-system-au", "common-law-civil-law", "trial-by-jury", "constitution-au", "separation-of-powers", "contracts", "snail-in-the-bottle", "consumer-rights", "complaints-that-get-results", "workplace-rights", "contractor-or-employee", "renting", "making-a-will"] },
  { id: "s-hands-on", area: "life", cat: "life", title: "Hands-On Life Skills", desc: "Fix, mend, clean and grow things yourself.",
    steps: ["diy-toolkit-basics", "home-maintenance", "useful-knots", "mending-clothes", "laundry-done-right", "cleaning-science-stains", "declutter-organise", "gardening-australia-basics", "keeping-pests-out", "jump-start-and-flat-tyre"] },

  /* ---------------- Technology ---------------- */
  { id: "s-tech", area: "tech", cat: "technology", title: "How Tech Works", desc: "What happens behind every tap and click.",
    steps: ["computers-work", "transistor-story", "making-microchips", "binary", "internet", "undersea-cables", "the-cloud", "search-engines", "how-wifi-works", "mobile-networks", "smartphones", "lithium-ion-batteries", "gps", "encryption", "blockchain"] },
  { id: "s-ai", area: "tech", cat: "ai", title: "Artificial Intelligence", desc: "What AI is, how it learns, and what it means for us.",
    steps: ["ai-history", "expert-systems", "machine-learning", "gradient-descent", "computer-vision", "word-embeddings", "ai-models", "bitter-lesson", "ai-images", "ai-in-medicine", "using-ai-well", "ai-risks", "specification-gaming", "automation-and-jobs", "can-machines-have-minds"] },
  { id: "s-cyber", area: "tech", cat: "technology", title: "Cybersecurity", desc: "Protect your accounts, money and privacy online.",
    steps: ["passwords", "phishing", "scams", "digital-security", "privacy", "backing-up-your-files", "hacking", "encryption"] },
  { id: "s-coding", area: "tech", cat: "technology", title: "Coding Basics", desc: "How software works, explained without the jargon.",
    steps: ["babbage-and-lovelace", "what-is-code", "binary", "text-encoding", "algorithms", "halting-problem", "programming-languages", "open-source", "how-websites", "debugging", "y2k-bug"] },

  /* ---------------- Culture & Beliefs ---------------- */
  { id: "s-art", area: "culture", cat: "arts", title: "Art History", desc: "From cave walls to modern galleries: how to see art.",
    steps: ["cave-art", "story-of-pigments", "aboriginal-art", "gothic-cathedrals", "renaissance", "sistine-chapel-ceiling", "vermeer-light", "ukiyo-e-great-wave", "impressionism", "modern-art", "bauhaus-design-school", "frida-kahlo", "looking-at-art"] },
  { id: "s-music", area: "culture", cat: "arts", title: "Music", desc: "How music works, where it came from, and why it moves us.",
    steps: ["how-music-works", "how-music-was-written-down", "tuning-and-temperament", "instruments", "stradivarius-violins", "classical-music", "opera-explained", "rite-of-spring-premiere", "popular-music", "music-brain", "earworms"] },
  { id: "s-books", area: "culture", cat: "literature", title: "Great Books", desc: "The stories and poems that shaped the world.",
    steps: ["epics", "shakespeare", "the-novel", "frankenstein", "charles-dickens", "alice-in-wonderland", "dracula-bram-stoker", "detective-fiction", "poetry", "dystopias", "banned-books"] },
  { id: "s-language", area: "culture", cat: "literature", title: "Words & Language", desc: "Where language came from, and how to use it well.",
    steps: ["language-origins", "writing-origins", "children-learning-language", "sign-languages", "english-language", "australian-english", "etymology", "dictionary-makers", "world-languages", "language-shapes-thought", "grammar-myths", "punctuation-history", "writing-well"] },
  { id: "s-mythology", area: "culture", cat: "beliefs", title: "Mythology", desc: "The gods, heroes and monsters that still shape our stories.",
    steps: ["why-myths", "epic-of-gilgamesh", "enuma-elish", "flood-myths", "greek-gods", "greek-heroes", "norse-myths", "irish-myths", "maui-polynesian-myths", "aboriginal-dreaming", "egyptian-myths", "aztec-gods", "yoruba-orisha"] },
  { id: "s-religions", area: "culture", cat: "beliefs", title: "World Religions", desc: "What billions of people believe, and why it matters, explained neutrally.",
    steps: ["religions-overview", "aboriginal-dreaming", "hinduism", "jainism", "judaism", "zoroastrianism", "buddhism", "daoism", "shinto", "christianity", "making-the-bible", "islam", "sikhism", "bahai-faith", "great-pilgrimages"] },

  /* ---------------- World & Society ---------------- */
  { id: "s-geography", area: "world", cat: "geography", title: "World Geography", desc: "The shape of the world, and how people live on it.",
    steps: ["continents", "antarctica", "rivers-mountains", "everest-himalaya", "caves-karst", "deserts", "lake-eyre", "uluru-kata-tjuta", "rainforests", "borders", "cities", "population"] },
  { id: "s-government", area: "world", cat: "society", title: "Government & Democracy", desc: "How power is organised, from your local MP to the United Nations.",
    steps: ["how-democracy", "social-contract", "political-ideas", "separation-of-powers", "australian-parliament", "voting-au", "gerrymandering", "sanctum-arrow", "human-rights", "geneva-conventions", "united-nations"] },
  { id: "s-wild-australia", area: "science", cat: "nature", title: "Wild Australia", desc: "The world's strangest animals, and the truth about the dangerous ones.",
    steps: ["marsupials", "megafauna", "monotremes", "australian-birds", "eucalypts", "termite-mounds", "reptiles", "crocodile-safety", "wildlife", "cane-toads", "great-barrier-reef"] },
  { id: "s-animals", area: "science", cat: "nature", title: "Amazing Animals", desc: "Minds, senses and journeys that outdo our own.",
    steps: ["animal-intelligence", "ants", "elephants", "animal-senses", "camouflage", "bioluminescence", "migration", "hibernation", "emperor-penguins", "octopus-mind", "tardigrades", "bees", "spider-silk"] },
  { id: "s-maths", area: "world", cat: "maths", title: "Everyday Maths", desc: "The number skills that make life easier and make you harder to fool.",
    steps: ["history-of-counting", "percentages", "average-speed-trap", "mental-maths", "check-digits", "metric-measurement", "big-numbers", "compound-interest", "probability", "queueing-maths", "statistics", "famous-maths", "paper-sizes-root-two"] },
  { id: "s-inventions", area: "world", cat: "explore", title: "Great Inventions", desc: "The ideas that changed everyday life.",
    steps: ["spectacles", "printing-press", "engines", "bicycle", "electric-light", "safety-elevator", "telephone-radio", "photography-invention", "birth-of-cinema", "tin-can", "refrigeration", "toilets-sewers", "flight", "shipping-container", "australian-inventions"] },
  { id: "s-aus-law-moments", area: "world", cat: "society", title: "Landmark Moments in Australian Law", desc: "The cases and votes that reshaped Australia.",
    steps: ["votes-for-women-au", "communist-party-case", "referendum-1967", "the-dismissal-1975", "lindy-chamberlain", "mabo-native-title"] },
  { id: "s-mind-bending-maths", area: "world", cat: "maths", title: "Mind-Bending Maths", desc: "Puzzles and paradoxes that make numbers fun.",
    steps: ["power-of-doubling", "average-speed-trap", "doomsday-rule", "monty-hall-problem", "pigeonhole-principle", "shuffled-deck-factorial", "seven-bridges-networks", "fair-division", "fractals-coastlines", "chaos-butterfly-effect", "benfords-law", "sanctum-godel"] },
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
  "english-language": "literature",
};
WB.LESSONS.forEach(l => { if (WB.RECAT[l.id]) l.cat = WB.RECAT[l.id]; });

WB.PATHS = WB.SUBJECTS; // older code reads WB.PATHS
