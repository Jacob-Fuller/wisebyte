/* =========================================================
   WISEBYTE — THINK & TEST CONTENT
   ---------------------------------------------------------
   GK         general-knowledge question bank
              { cat, q, o: [options], a: right index, e: explanation, k: 1 = also for kids }
   CLAIMS     "Fact or Fiction?" claims { c, t: true/false, e, k }
   CAPITALS   [country, capital]
   PUZZLES    problem-solving questions { q, o, a, e, k }
   SCENARIOS  critical-thinking scenarios { topic, q, o, a, e }
   Brain-training games (maths, patterns, memory, logic, colour
   clash, spatial) are generated in the app, so they never repeat.
   ========================================================= */
window.WB = window.WB || {};

WB.GK_CATS = {
  geography: "Geography", history: "History", science: "Science", technology: "Technology", space: "Space",
  animals: "Animals", body: "Human Body", culture: "Culture", economics: "Economics", australia: "Australia",
  sport: "Sport", art: "Art", literature: "Literature",
};

WB.GK = [
  // Geography
  { cat: "geography", k: 1, q: "Which country has the longest coastline in the world?", o: ["Australia", "Russia", "Canada", "Indonesia"], a: 2, e: "Canada's coastline runs over 200,000 km, thanks to its tens of thousands of Arctic islands." },
  { cat: "geography", q: "What is the largest lake in Africa?", o: ["Lake Tanganyika", "Lake Victoria", "Lake Chad", "Lake Malawi"], a: 1, e: "Shared by Uganda, Kenya and Tanzania, it's the world's largest tropical lake and a main source of the White Nile." },
  { cat: "geography", q: "Which African country has the largest population?", o: ["Egypt", "Ethiopia", "Nigeria", "South Africa"], a: 2, e: "Nigeria has more than 220 million people, and Lagos is one of the biggest cities in Africa." },
  { cat: "geography", q: "What is the capital of Canada?", o: ["Toronto", "Vancouver", "Ottawa", "Montreal"], a: 2, e: "Ottawa, in Ontario, is Canada's capital." },
  { cat: "geography", q: "What is the smallest country in the world by area?", o: ["Monaco", "Vatican City", "San Marino", "Malta"], a: 1, e: "Vatican City covers less than half a square kilometre." },
  { cat: "geography", q: "What is Africa's highest mountain?", o: ["Mount Kenya", "Mount Kilimanjaro", "Mount Stanley", "Ras Dashen"], a: 1, e: "Kilimanjaro, a dormant volcano in Tanzania, rises about 5,895 metres, and you can walk to the top without climbing gear." },
  { cat: "geography", k: 1, q: "What is the largest hot desert in the world?", o: ["Gobi", "Sahara", "Kalahari", "Great Victoria"], a: 1, e: "The Sahara covers much of North Africa." },
  // History
  { cat: "history", k: 1, q: "Who was the first person to walk on the Moon?", o: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "John Glenn"], a: 2, e: "Neil Armstrong stepped onto the Moon on 20 July 1969 (21 July in Australia)." },
  { cat: "history", q: "In 1868, the Meiji Restoration ended centuries of rule by shoguns in which country?", o: ["China", "Korea", "Japan", "Thailand"], a: 2, e: "Power returned to the emperor, and Japan industrialised at astonishing speed over the following decades." },
  { cat: "history", q: "Who was the first emperor of Rome?", o: ["Julius Caesar", "Augustus", "Nero", "Constantine"], a: 1, e: "Augustus became the first emperor in 27 BC. Julius Caesar was never emperor." },
  { cat: "history", q: "In which year did the Titanic sink?", o: ["1905", "1912", "1918", "1923"], a: 1, e: "It sank on its first voyage in April 1912." },
  { cat: "history", q: "Which English king was executed in 1649, after losing a civil war to Parliament?", o: ["Henry VIII", "Charles I", "Richard III", "James II"], a: 1, e: "After his trial and beheading, England was briefly a republic, until the monarchy returned in 1660." },
  { cat: "history", q: "Which civilisation built Machu Picchu?", o: ["Aztec", "Maya", "Inca", "Olmec"], a: 2, e: "The Inca built it in the 15th century in the Andes of Peru." },
  { cat: "history", q: "Which of the Seven Wonders of the Ancient World is still standing?", o: ["Colossus of Rhodes", "Hanging Gardens of Babylon", "Great Pyramid of Giza", "Lighthouse of Alexandria"], a: 2, e: "The Great Pyramid is the only one left." },
  // Science
  { cat: "science", q: "What is the chemical symbol for gold?", o: ["Go", "Gd", "Au", "Ag"], a: 2, e: "Au, from the Latin aurum. Ag is silver." },
  { cat: "science", q: "On the Celsius scale, roughly what is absolute zero, the coldest possible temperature?", o: ["−100°C", "−273°C", "−459°C", "−1,000°C"], a: 1, e: "It is −273.15°C, or 0 kelvin. It can be approached but never quite reached. (−459°F is the same point in Fahrenheit.)" },
  { cat: "science", q: "Which gas makes up most of Earth's atmosphere?", o: ["Oxygen", "Nitrogen", "Carbon dioxide", "Argon"], a: 1, e: "Nitrogen is about 78%; oxygen about 21%." },
  { cat: "science", q: "Which part of a cell releases energy from food?", o: ["Nucleus", "Mitochondria", "Ribosome", "Cell wall"], a: 1, e: "Mitochondria are often called the cell's powerhouse." },
  { cat: "science", q: "What is the pH of pure water at 25°C?", o: ["0", "5", "7", "14"], a: 2, e: "Pure water is neutral, pH 7." },
  { cat: "science", k: 1, q: "What is the hardest natural substance?", o: ["Gold", "Iron", "Diamond", "Quartz"], a: 2, e: "Diamond, a form of carbon, is the hardest natural material." },
  { cat: "science", k: 1, q: "What force keeps the planets in orbit around the Sun?", o: ["Magnetism", "Gravity", "Friction", "Wind"], a: 1, e: "The Sun's gravity holds the planets in their orbits." },
  // Technology
  { cat: "technology", q: "What does CPU stand for?", o: ["Central Processing Unit", "Computer Power Unit", "Core Program Utility", "Central Print Unit"], a: 0, e: "The CPU is the chip that carries out a computer's instructions." },
  { cat: "technology", q: "Who co-founded Apple with Steve Wozniak?", o: ["Bill Gates", "Steve Jobs", "Larry Page", "Mark Zuckerberg"], a: 1, e: "Steve Jobs and Steve Wozniak founded Apple in 1976, with Ronald Wayne." },
  { cat: "technology", q: "What does the 'HTTP' in web addresses stand for?", o: ["HyperText Transfer Protocol", "High Tech Transfer Process", "Home Tool Transfer Page", "HyperText Terminal Program"], a: 0, e: "It's the protocol browsers use to fetch web pages." },
  { cat: "technology", k: 1, q: "Which two digits does binary code use?", o: ["1 and 2", "0 and 1", "0 and 9", "1 and 10"], a: 1, e: "Binary uses only 0 and 1." },
  { cat: "technology", q: "In which year was the first iPhone released?", o: ["2004", "2007", "2010", "2012"], a: 1, e: "Apple released the first iPhone in 2007." },
  { cat: "technology", q: "Which company owns the Android operating system?", o: ["Apple", "Microsoft", "Google", "Samsung"], a: 2, e: "Google bought Android Inc. in 2005." },
  // Space
  { cat: "space", k: 1, q: "Which planet is closest to the Sun?", o: ["Venus", "Mercury", "Mars", "Earth"], a: 1, e: "Mercury is the closest planet to the Sun." },
  { cat: "space", k: 1, q: "What is the largest planet in our solar system?", o: ["Saturn", "Neptune", "Jupiter", "Earth"], a: 2, e: "Jupiter is more than twice as massive as all the other planets combined." },
  { cat: "space", k: 1, q: "Which planet is known as the Red Planet?", o: ["Mars", "Venus", "Jupiter", "Mercury"], a: 0, e: "Iron oxide (rust) in its soil makes Mars look red." },
  { cat: "space", q: "Which is the only planet in our solar system not named after a Greek or Roman god?", o: ["Mars", "Earth", "Neptune", "Uranus"], a: 1, e: "'Earth' comes from Old English eorþe, meaning ground or soil. Uranus is named after the Greek sky god." },
  { cat: "space", q: "Which planet has the shortest day?", o: ["Mercury", "Earth", "Jupiter", "Neptune"], a: 2, e: "Jupiter spins once in just under 10 hours, even though it is the largest planet." },
  { cat: "space", k: 1, q: "What is the name of our galaxy?", o: ["Andromeda", "The Milky Way", "The Whirlpool", "Orion"], a: 1, e: "We live in the Milky Way." },
  // Animals
  { cat: "animals", k: 1, q: "Which bird lays the largest egg?", o: ["Emu", "Ostrich", "Albatross", "Cassowary"], a: 1, e: "An ostrich egg weighs about 1.4 kg, as much as roughly two dozen chicken eggs." },
  { cat: "animals", k: 1, q: "What is the fastest land animal?", o: ["Lion", "Cheetah", "Pronghorn", "Greyhound"], a: 1, e: "Cheetahs can sprint at around 100 km/h." },
  { cat: "animals", q: "What is a group of crows called?", o: ["A pride", "A murder", "A parliament", "A gaggle"], a: 1, e: "A murder of crows. The phrase appears in English lists of animal group names from the 1400s." },
  { cat: "animals", k: 1, q: "How many legs does a spider have?", o: ["6", "8", "10", "12"], a: 1, e: "Spiders are arachnids, with eight legs." },
  { cat: "animals", k: 1, q: "Which of these mammals lays eggs?", o: ["Koala", "Platypus", "Wombat", "Kangaroo"], a: 1, e: "Platypuses and echidnas are monotremes: egg-laying mammals." },
  { cat: "animals", k: 1, q: "What is a baby kangaroo called?", o: ["A cub", "A kit", "A joey", "A pup"], a: 2, e: "Baby kangaroos (and other marsupials) are called joeys." },
  { cat: "animals", q: "Which bird can fly backwards?", o: ["Hummingbird", "Kookaburra", "Eagle", "Pelican"], a: 0, e: "Hummingbirds can hover and fly backwards." },
  // Human body
  { cat: "body", k: 1, q: "What is the largest organ of the human body?", o: ["Liver", "Brain", "Skin", "Lungs"], a: 2, e: "Your skin is your largest organ." },
  { cat: "body", q: "Which part of your body gets most of its oxygen straight from the air rather than from blood?", o: ["The cornea", "The lens", "The tongue", "The eardrum"], a: 0, e: "The cornea has no blood vessels, which keeps it clear. It absorbs oxygen dissolved in your tears." },
  { cat: "body", q: "Which blood type is the universal red-cell donor?", o: ["A positive", "AB positive", "O negative", "B negative"], a: 2, e: "O negative red cells can be given to almost anyone." },
  { cat: "body", q: "Where is the smallest bone in your body?", o: ["Your finger", "Your ear", "Your toe", "Your nose"], a: 1, e: "The stapes, in the middle ear, is about 3 millimetres long." },
  { cat: "body", k: 1, q: "How many chambers does the human heart have?", o: ["2", "3", "4", "6"], a: 2, e: "Two atria and two ventricles." },
  { cat: "body", q: "Which vitamin does your blood need in order to clot?", o: ["Vitamin A", "Vitamin C", "Vitamin E", "Vitamin K"], a: 3, e: "The K comes from 'Koagulation', the German spelling of coagulation. Leafy greens are a good source." },
  // Culture
  { cat: "culture", q: "Which country has the most Portuguese speakers?", o: ["Portugal", "Brazil", "Angola", "Mozambique"], a: 1, e: "Brazil has over 200 million people, about 20 times Portugal's population." },
  { cat: "culture", q: "Día de los Muertos, the Day of the Dead, is a famous celebration from which country?", o: ["Spain", "Mexico", "Brazil", "Peru"], a: 1, e: "Around 1–2 November, families build altars with marigolds, photos and favourite foods to welcome back the spirits of loved ones." },
  { cat: "culture", k: 1, q: "How many strings does a standard guitar have?", o: ["4", "5", "6", "8"], a: 2, e: "A standard guitar has six strings." },
  { cat: "culture", k: 1, q: "Origami, the art of paper folding, is most associated with which country?", o: ["China", "Japan", "Korea", "Thailand"], a: 1, e: "The word origami is Japanese: ori 'folding', kami 'paper'." },
  { cat: "culture", k: 1, q: "In which city is the Colosseum?", o: ["Athens", "Rome", "Istanbul", "Paris"], a: 1, e: "Rome's Colosseum was completed in 80 AD." },
  { cat: "culture", q: "What is the currency of Japan?", o: ["Yuan", "Won", "Yen", "Baht"], a: 2, e: "The yen." },
  // Economics
  { cat: "economics", q: "What does GDP stand for?", o: ["Gross Domestic Product", "General Debt Position", "Global Development Plan", "Gross Dividend Payment"], a: 0, e: "GDP is the total value of goods and services produced in a country." },
  { cat: "economics", q: "What is Australia's central bank?", o: ["Commonwealth Bank", "Reserve Bank of Australia", "Australian Treasury", "ASX"], a: 1, e: "The Reserve Bank of Australia sets the cash rate." },
  { cat: "economics", q: "What is it called when prices fall across the economy?", o: ["Inflation", "Deflation", "Recession", "Stagflation"], a: 1, e: "Deflation is a general fall in prices." },
  { cat: "economics", q: "If supply of a product falls but demand stays the same, what usually happens to its price?", o: ["It rises", "It falls", "It stays the same", "It drops to zero"], a: 0, e: "Scarcer goods with steady demand get more expensive." },
  { cat: "economics", q: "In a 'bear market', share prices are generally...", o: ["Rising", "Falling", "Frozen", "Doubling"], a: 1, e: "A bear market is a sustained fall, usually 20% or more." },
  { cat: "economics", q: "What is the currency of most European Union countries?", o: ["Pound", "Franc", "Euro", "Mark"], a: 2, e: "21 of the 27 EU countries use the euro; Bulgaria became the latest in January 2026." },
  // Australia
  { cat: "australia", k: 1, q: "What is the capital of Australia?", o: ["Sydney", "Melbourne", "Canberra", "Brisbane"], a: 2, e: "Canberra was chosen as a compromise between Sydney and Melbourne." },
  { cat: "australia", k: 1, q: "How many states does Australia have?", o: ["5", "6", "7", "8"], a: 1, e: "Six states, plus territories including the ACT and NT." },
  { cat: "australia", q: "The Twelve Apostles rock stacks stand off the coast of which state?", o: ["New South Wales", "Victoria", "Tasmania", "South Australia"], a: 1, e: "They line the Great Ocean Road. Despite the name there were never twelve, and waves have toppled some of them." },
  { cat: "australia", q: "Where is Uluru?", o: ["Queensland", "South Australia", "Northern Territory", "Western Australia"], a: 2, e: "Uluru is in the Northern Territory." },
  { cat: "australia", q: "After Sydney, which is Australia's oldest capital city?", o: ["Melbourne", "Hobart", "Brisbane", "Perth"], a: 1, e: "Hobart was founded in 1804, the year after a first settlement at nearby Risdon Cove." },
  { cat: "australia", q: "Who is the longest-serving Prime Minister in Australian history?", o: ["John Howard", "Robert Menzies", "Bob Hawke", "Malcolm Fraser"], a: 1, e: "Menzies led the country for over 18 years in total, from 1939 to 1941 and again from 1949 to 1966." },
  { cat: "australia", k: 1, q: "What is the largest marsupial?", o: ["Koala", "Wombat", "Red kangaroo", "Tasmanian devil"], a: 2, e: "Male red kangaroos can stand about 1.8 metres tall." },
  { cat: "australia", k: 1, q: "What is the world's largest sand island, off Queensland, now officially called?", o: ["Minjerribah", "K'gari", "Mulgumpin", "Hinchinbrook"], a: 1, e: "Formerly Fraser Island, it officially took back its Butchulla name, K'gari, meaning 'paradise', in 2023." },
  // Sport
  { cat: "sport", k: 1, q: "How many players does a soccer team have on the field?", o: ["9", "10", "11", "12"], a: 2, e: "Eleven, including the goalkeeper." },
  { cat: "sport", q: "In which sport do Australia and England contest the Ashes?", o: ["Rugby", "Cricket", "Tennis", "Netball"], a: 1, e: "The Ashes is a cricket Test series." },
  { cat: "sport", k: 1, q: "How often are the Summer Olympics held?", o: ["Every 2 years", "Every 4 years", "Every 5 years", "Every year"], a: 1, e: "Every four years." },
  { cat: "sport", q: "Which city hosted the 2000 Summer Olympics?", o: ["Melbourne", "Sydney", "Athens", "Atlanta"], a: 1, e: "Sydney hosted in 2000." },
  { cat: "sport", q: "In tennis, what is a score of zero called?", o: ["Nil", "Duck", "Love", "Zip"], a: 2, e: "Zero is 'love' in tennis." },
  { cat: "sport", q: "Which country had won the most men's Rugby World Cups as of 2023?", o: ["New Zealand", "South Africa", "Australia", "England"], a: 1, e: "South Africa's 2023 win was its fourth title." },
  { cat: "sport", k: 1, q: "What kind of race is the Melbourne Cup?", o: ["Car race", "Horse race", "Boat race", "Running race"], a: 1, e: "A horse race held on the first Tuesday of November." },
  // Art
  { cat: "art", k: 1, q: "Who painted the Mona Lisa?", o: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Rembrandt"], a: 1, e: "Leonardo da Vinci, in the early 1500s." },
  { cat: "art", q: "Who painted The Scream?", o: ["Edvard Munch", "Gustav Klimt", "Egon Schiele", "Wassily Kandinsky"], a: 0, e: "The Norwegian artist made several versions from 1893. One sold for about US$120 million in 2012." },
  { cat: "art", q: "Who painted The Birth of Venus?", o: ["Titian", "Sandro Botticelli", "Caravaggio", "Raphael"], a: 1, e: "Botticelli painted it in Florence in the 1480s. It hangs in the city's Uffizi Gallery." },
  { cat: "art", k: 1, q: "What are the three primary colours in traditional painting?", o: ["Red, yellow, blue", "Red, green, blue", "Orange, green, purple", "Black, white, grey"], a: 0, e: "Red, yellow and blue. (Screens use red, green and blue light.)" },
  { cat: "art", q: "Salvador Dalí is best known for which art movement?", o: ["Impressionism", "Cubism", "Surrealism", "Pop art"], a: 2, e: "Surrealism, with dreamlike images like melting clocks." },
  { cat: "art", q: "Who designed the Sydney Opera House?", o: ["Frank Gehry", "Jørn Utzon", "Zaha Hadid", "Le Corbusier"], a: 1, e: "Danish architect Jørn Utzon." },
  // Literature
  { cat: "literature", q: "Who wrote Romeo and Juliet?", o: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Geoffrey Chaucer"], a: 1, e: "Shakespeare, in the 1590s." },
  { cat: "literature", q: "Who wrote the novel 1984?", o: ["Aldous Huxley", "George Orwell", "Ray Bradbury", "H. G. Wells"], a: 1, e: "George Orwell published it in 1949." },
  { cat: "literature", q: "Which novel opens with 'It was the best of times, it was the worst of times'?", o: ["Great Expectations", "A Tale of Two Cities", "Wuthering Heights", "Middlemarch"], a: 1, e: "Charles Dickens's 1859 novel is set in London and Paris during the French Revolution." },
  { cat: "literature", q: "Which novel opens with the line 'Call me Ishmael'?", o: ["Treasure Island", "Moby-Dick", "The Old Man and the Sea", "Robinson Crusoe"], a: 1, e: "Herman Melville's Moby-Dick (1851)." },
  { cat: "literature", k: 1, q: "Who wrote the Harry Potter books?", o: ["Roald Dahl", "J. K. Rowling", "C. S. Lewis", "Enid Blyton"], a: 1, e: "J. K. Rowling." },
  { cat: "literature", q: "Who wrote War and Peace?", o: ["Fyodor Dostoevsky", "Leo Tolstoy", "Anton Chekhov", "Alexander Pushkin"], a: 1, e: "Published in the 1860s, it follows several aristocratic families through Napoleon's invasion of Russia." },
  { cat: "literature", q: "Which Australian author has won the Booker Prize twice?", o: ["Tim Winton", "Peter Carey", "Richard Flanagan", "Thomas Keneally"], a: 1, e: "He won in 1988 for Oscar and Lucinda and in 2001 for True History of the Kelly Gang. (J. M. Coetzee, now an Australian citizen, has also won twice.)" },
];

WB.CLAIMS = [
  { c: "Humans only use 10% of their brains.", t: false, e: "Brain scans show activity across virtually the whole brain over a day." },
  { k: 1, c: "If you touch a baby bird, its parents will reject it.", t: false, e: "Most birds have a weak sense of smell and won't abandon a chick because a human handled it. If it's uninjured, pop it back in the nest." },
  { k: 1, c: "You can see the Great Wall of China from space with the naked eye.", t: false, e: "It's very long but only a few metres wide. Astronauts say it's extremely hard, if not impossible, to spot unaided from orbit." },
  { c: "Lightning never strikes the same place twice.", t: false, e: "Tall structures get hit again and again. The Empire State Building is struck around 20 times a year." },
  { k: 1, c: "Porcupines can shoot their quills at attackers.", t: false, e: "They can't. The quills detach easily when something touches them, then their barbed tips work their way into the skin." },
  { k: 1, c: "Venus takes longer to spin once on its axis than to orbit the Sun.", t: true, e: "Venus spins once every 243 Earth days but orbits the Sun in 225." },
  { k: 1, c: "Sea otters hold hands while they sleep.", t: true, e: "Resting sea otters often link paws, or wrap themselves in kelp, so they don't drift apart." },
  { c: "Honey can stay edible for thousands of years.", t: true, e: "Its low water content and acidity stop microbes growing. Edible honey has been found in ancient Egyptian tombs." },
  { k: 1, c: "Bananas are berries, but strawberries aren't.", t: true, e: "Botanically, a berry grows from one flower's ovary with seeds inside. Bananas fit; strawberries don't." },
  { c: "Napoleon was unusually short.", t: false, e: "He was about 1.69 m, average for a Frenchman of his time. Old French inches and British cartoons fed the myth." },
  { c: "Cracking your knuckles causes arthritis.", t: false, e: "Studies have found no link. The pop is gas bubbles in the joint fluid." },
  { k: 1, c: "People swallow about eight spiders a year in their sleep.", t: false, e: "There's no evidence for this. Spiders avoid breathing, snoring humans." },
  { c: "A living tree is older than the Great Pyramid of Giza.", t: true, e: "'Methuselah', a bristlecone pine in California, is about 4,800 years old. The Great Pyramid was finished around 4,500 years ago." },
  { k: 1, c: "Ancient Greek marble statues were originally plain white.", t: false, e: "Traces of pigment show many were brightly painted, with coloured skin, clothing and eyes. The paint wore away over the centuries." },
  { c: "Chameleons change colour mainly to blend in with their background.", t: false, e: "They change colour mostly to signal mood and to control their temperature." },
  { c: "Sugar makes children hyperactive.", t: false, e: "Double-blind studies found no effect on behaviour. Parents who think their child had sugar rate them as more hyperactive." },
  { c: "Oxford University is older than the Aztec Empire.", t: true, e: "Teaching at Oxford existed by 1096. The Aztec capital, Tenochtitlan, was founded in 1325." },
  { c: "You can drive across the Amazon River on a bridge.", t: false, e: "No bridge crosses the main Amazon. It runs mostly through thinly populated rainforest with soft, flood-prone banks, so ferries do the job." },
  { k: 1, c: "A group of flamingos is called a flamboyance.", t: true, e: "Yes, really. Flamingos often rest standing on one leg, which scientists think helps them save energy." },
  { c: "Water swirls down the drain the opposite way in the Southern Hemisphere.", t: false, e: "The Coriolis effect is far too weak at sink size. The shape of the basin and how the water was poured matter more." },
  { c: "A coin dropped from a skyscraper could kill someone.", t: false, e: "A small flat coin tumbles and hits a low top speed. It would sting, not kill." },
  { k: 1, c: "Platypuses glow under ultraviolet light.", t: true, e: "Scientists reported in 2020 that platypus fur absorbs UV light and gives off a blue-green glow. Why it happens is still a mystery." },
  { c: "Hair and fingernails keep growing after death.", t: false, e: "The skin dries and pulls back, which makes them look longer." },
  { c: "Einstein failed maths at school.", t: false, e: "He excelled at maths and had mastered calculus by about 15." },
  { c: "There are more trees on Earth than stars in the Milky Way.", t: true, e: "Earth has about 3 trillion trees; the Milky Way has roughly 100 to 400 billion stars." },
  { c: "The shortest war in recorded history lasted less than an hour.", t: true, e: "The Anglo-Zanzibar War of 1896 lasted roughly 40 minutes before the sultan's forces gave up." },
  { k: 1, c: "Daddy long-legs spiders are highly venomous, but their fangs are too weak to bite us.", t: false, e: "Their venom is weak against humans, and they can bite, but it barely affects us. The claim is an old internet myth." },
  { c: "A stiff drink warms you up in the cold.", t: false, e: "Alcohol makes you feel warm by widening blood vessels near the skin, but that actually lowers your core temperature." },
  { k: 1, c: "Eating carrots gives you night vision.", t: false, e: "Carrots are healthy, but the myth was spread by British propaganda in World War II to hide radar technology." },
  { c: "Swallowed chewing gum stays in your stomach for seven years.", t: false, e: "Your body can't digest gum base, but it passes through your gut and out within a few days, like other things you can't digest." },
];

WB.CAPITALS = [
  ["Australia", "Canberra"], ["Canada", "Ottawa"], ["New Zealand", "Wellington"], ["Japan", "Tokyo"], ["France", "Paris"],
  ["Germany", "Berlin"], ["Italy", "Rome"], ["Spain", "Madrid"], ["Brazil", "Brasília"], ["Argentina", "Buenos Aires"],
  ["Egypt", "Cairo"], ["Kenya", "Nairobi"], ["Turkey", "Ankara"], ["Switzerland", "Bern"], ["India", "New Delhi"],
  ["China", "Beijing"], ["South Korea", "Seoul"], ["Thailand", "Bangkok"], ["Vietnam", "Hanoi"], ["Philippines", "Manila"],
  ["Norway", "Oslo"], ["Sweden", "Stockholm"], ["Finland", "Helsinki"], ["Denmark", "Copenhagen"], ["Poland", "Warsaw"],
  ["Greece", "Athens"], ["Portugal", "Lisbon"], ["Ireland", "Dublin"], ["Mexico", "Mexico City"], ["Chile", "Santiago"],
  ["Peru", "Lima"], ["Nigeria", "Abuja"], ["Morocco", "Rabat"], ["Pakistan", "Islamabad"], ["Iceland", "Reykjavík"],
  ["Fiji", "Suva"], ["Papua New Guinea", "Port Moresby"], ["United States", "Washington, D.C."], ["Austria", "Vienna"],
  ["Hungary", "Budapest"], ["Czechia", "Prague"], ["Colombia", "Bogotá"], ["Russia", "Moscow"], ["Netherlands", "Amsterdam"],
];

WB.PUZZLES = [
  { q: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?", o: ["10 cents", "5 cents", "1 cent", "55 cents"], a: 1,
    e: "If the ball is 5c, the bat is $1.05, and together they're $1.10. The quick answer, 10c, would make the total $1.20." },
  { q: "If 5 machines take 5 minutes to make 5 widgets, how long would 100 machines take to make 100 widgets?", o: ["100 minutes", "20 minutes", "5 minutes", "1 minute"], a: 2,
    e: "Each machine makes one widget in 5 minutes, so 100 machines make 100 widgets in the same 5 minutes." },
  { q: "A patch of lily pads doubles in size every day. It takes 48 days to cover the whole lake. How long does it take to cover half?", o: ["24 days", "36 days", "46 days", "47 days"], a: 3,
    e: "It doubles daily, so the day before it's full, it was half: day 47." },
  { k: 1, q: "In a race, you overtake the person in second place. What place are you in now?", o: ["First", "Second", "Third"], a: 1, e: "You've taken their spot, so you're second." },
  { k: 1, q: "A farmer has 17 sheep. All but 9 run away. How many are left?", o: ["8", "9", "17", "0"], a: 1, e: "'All but 9' means 9 stay behind." },
  { q: "How many times can you subtract 5 from 25?", o: ["5 times", "Once", "4 times", "As many as you like"], a: 1, e: "Once. After that you're subtracting 5 from 20, not 25." },
  { k: 1, q: "Mary's father has five daughters: Nana, Nene, Nini and Nono. What is the fifth daughter's name?", o: ["Nunu", "Mary", "Nina"], a: 1, e: "It's Mary: she's one of her father's daughters." },
  { q: "A clock shows 3:15. What is the angle between the hour and minute hands?", o: ["0°", "7.5°", "15°", "90°"], a: 1,
    e: "The minute hand is on the 3. The hour hand has moved a quarter of the way from 3 to 4, which is a quarter of 30°: 7.5°." },
  { q: "You have a 3-litre jug and a 5-litre jug and a tap. Can you measure exactly 4 litres?", o: ["Yes", "No"], a: 0,
    e: "Fill the 5, pour into the 3 (2 left). Empty the 3, pour the 2 in. Fill the 5 again and top up the 3 (needs 1). You're left with 4." },
  { k: 1, q: "Some months have 31 days. How many have 28 days?", o: ["1", "2", "All 12"], a: 2, e: "Every month has at least 28 days." },
  { q: "Two fathers and two sons go fishing. Each catches one fish, but they only bring home three. Nothing was lost. How?", o: ["One fish was eaten", "They're a grandfather, father and son", "One person didn't fish", "It's impossible"], a: 1,
    e: "Three people: the father is also a son, so there are two fathers and two sons." },
  { q: "A shop cuts a price by 20%, then raises the new price by 20%. Compared with the original price, it's now...", o: ["The same", "4% lower", "4% higher", "2% lower"], a: 1,
    e: "0.8 × 1.2 = 0.96, so it's 4% below the original." },
  { q: "What comes next: 2, 6, 12, 20, 30, ?", o: ["36", "40", "42", "44"], a: 2, e: "The gaps grow by 2 each time (4, 6, 8, 10, 12), so the next is 42." },
  { k: 1, q: "What gets wetter the more it dries?", o: ["A sponge", "A towel", "The sun"], a: 1, e: "A towel gets wetter as it dries you." },
];

WB.SCENARIOS = [
  { topic: "Correlation vs causation", q: "Towns that sell more ice cream have more drownings. What's the best explanation?", o: ["Ice cream causes drowning", "Hot weather drives both", "Drowning makes people buy ice cream", "It's pure coincidence"], a: 1,
    e: "A third factor, hot weather, increases both swimming and ice-cream sales. That's a confounding variable." },
  { topic: "Correlation vs causation", q: "A study finds that people who drink coffee live longer. What can you actually conclude?", o: ["Coffee makes you live longer", "There's an association, but other factors could explain it", "Coffee is harmful", "Nothing at all"], a: 1,
    e: "An observational study shows a link, not a cause. Coffee drinkers might differ in income, health or habits." },
  { topic: "Evidence quality", q: "A new supplement worked for 4 out of 5 people in a trial. How convincing is that?", o: ["Very convincing: 80% success", "Not very: the sample is far too small", "It proves it works for 80% of people", "It proves it doesn't work"], a: 1,
    e: "With only five people, chance and placebo effects can easily explain the result." },
  { topic: "Probability", q: "Linda is 31, outspoken and studied philosophy, with a passion for social justice. Which is more likely?", o: ["Linda is a bank teller", "Linda is a bank teller and active in the feminist movement", "Both are equally likely", "There's no way to compare them"], a: 0, e: "Two things both being true can never be more likely than one of them alone. The detailed version just feels more fitting. That's the conjunction fallacy." },
  { topic: "Logical fallacies", q: "\"You can't trust his argument about tax. He failed maths at school.\" Which fallacy is this?", o: ["Ad hominem", "Straw man", "Slippery slope", "False dilemma"], a: 0,
    e: "Ad hominem attacks the person instead of the argument." },
  { topic: "Logical fallacies", q: "\"You can't tell me to quit smoking. You smoked for 20 years!\" What's wrong with this reply?", o: ["Nothing, it's a fair point", "It's tu quoque: advice isn't wrong just because the person giving it was a hypocrite", "It's a straw man", "It's a slippery slope"], a: 1, e: "Pointing out hypocrisy dodges the argument. Smoking is just as harmful whoever warns you about it." },
  { topic: "Logical fallacies", q: "\"If we lower the speed limit to 40, next they'll ban cars altogether.\" Which fallacy?", o: ["Slippery slope", "Ad hominem", "Red herring", "False cause"], a: 0, e: "It leaps to an extreme outcome without showing why each step would follow. Every link in a chain like that needs evidence." },
  { topic: "Logical fallacies", q: "\"Either you support this policy, or you don't care about children.\" Which fallacy?", o: ["Straw man", "False dilemma", "Appeal to emotion", "Hasty generalisation"], a: 1,
    e: "A false dilemma presents only two options when more exist." },
  { topic: "Logical fallacies", q: "\"Millions of people use this remedy, so it must work.\" What's wrong with this reasoning?", o: ["Nothing, popularity proves it", "It's an appeal to popularity", "It's a straw man", "It's circular"], a: 1,
    e: "Popularity isn't evidence. Many popular beliefs have been wrong." },
  { topic: "Bias", q: "\"Every successful founder I've read about dropped out of uni, so dropping out helps you succeed.\" What's the flaw?", o: ["No flaw", "Survivorship bias: you don't hear about dropouts who failed", "Confirmation bias about unis", "Anchoring on famous names"], a: 1,
    e: "Survivorship bias looks only at the winners. Most dropouts who failed never get written about." },
  { topic: "Evidence quality", q: "Which is the strongest evidence that a medicine works?", o: ["A celebrity recommending it", "One patient's success story", "A large randomised controlled trial", "The company's press release"], a: 2,
    e: "Randomised controlled trials compare similar groups and reduce bias. Anecdotes and marketing don't." },
  { topic: "Evidence quality", q: "\"My grandad smoked every day and lived to 95, so smoking isn't that bad.\" What's the problem?", o: ["It's anecdotal: one case doesn't outweigh data from millions", "Nothing, it's real evidence", "Grandad was probably lying", "It's an appeal to authority"], a: 0,
    e: "Individual exceptions exist, but large studies show smoking greatly raises the risk of disease and early death." },
  { topic: "Statistics", q: "After a terrible game, the coach yelled at the team. Next game they played much better. What's the most likely explanation?", o: ["Yelling works", "Performance tends to return to average after an extreme result", "The other team was weaker", "The players were scared"], a: 1,
    e: "Regression to the mean: an unusually bad result is usually followed by a more typical one, with or without yelling." },
  { topic: "Statistics", q: "The schools with the very best average results in a league table are mostly small schools. Should parents conclude small schools teach better?", o: ["Yes, small schools clearly teach better", "Not necessarily: small schools also fill the bottom of the table, because small groups vary more", "Only if they are private", "Yes, averages never lie"], a: 1, e: "With fewer students, a few very strong or weak ones swing the average. Small schools turn up at both extremes." },
  { topic: "Probability", q: "You roll two dice and add them. Which total comes up most often?", o: ["12", "7", "All totals are equally likely", "2"], a: 1, e: "Six combinations make 7 (1 and 6, 2 and 5, 3 and 4, each either way round), more than any other total. 2 and 12 can each be made only one way." },
];
