# Wisebyte content overhaul log

Branch: `content-overhaul` (from `main` at 90b9107). Not merged. Resume a lost session with: "Continue the Wisebyte content overhaul from CONTENT_OVERHAUL_LOG.md."

## Step 0: Discovery

### Where content lives
| Content | Location | Notes |
|---|---|---|
| Lessons (802) | `lessons-*.js`, `inner-lessons-*.js` (117 files, root) | `WB.L(id, cat, level, title, hook, [[h, key, body]…], [[s, q, options, a, explain]…], extra)`. 21 older files use `WB.LESSONS.push({…})` objects. `extra` carries `added`, `trending`, `popularity`, `related`, `audience`. 12 lessons are `audience: "inner"`. Currently 6-9 pages (avg ~800 words), 5 quiz questions each. |
| Vocabulary words (1,060) | `words.js`, `words2.js`, `words3.js`, `inner*.js` | `w`, `pos`, `ipa`, `say`, `def`, examples, `syn`/`ant`. |
| Quotes (Expression pillar, 200) | `QUOTES` inline in `index.html` + `quotes2.js` (`QUOTES_MORE`) | `{q, a, w, m}`. |
| Brain games / Cognition | `think.js`, `think2.js`, `think3.js` (GK, CLAIMS, CAPITALS, PUZZLES, SCENARIOS), `inner.js`/`inner2.js`/`inner3.js` (expert questions and riddles), `timeline.js` (EVENTS) | |
| Practical | lessons in category `life` + the `life` collection + a few extras (`isPractical` in `native/src/engine.js`) | No separate store. |
| Courses and mastery exams | `subjects.js` (`WB.SUBJECTS`: id, area, cat, title, desc, steps) | Mastery exams are built at runtime from the quizzes of the course's lessons (`startMastery`), so rewriting lesson quizzes rewrites exams. |
| Collections | `lessons.js` (`WB.COLLECTIONS`) | |
| Scroll tab | `scroll/index.html` (`FACTS`) + `scroll/more.js`, baked to `native/src/data/scroll.json` (3,000 items) | |
| Native bundle | `native/src/data/wb.json`, `scroll.json` | Rebuilt by `node native/scripts/extract-content.js`. |

Loaded by `index.html` (script tags) and cached by `sw.js`. No new lesson files were added, so `sw.js` needs no new entries.

### Code that assumed 8 pages or section indexes (native)
- `native/src/Player.js`: "N short reads" meta uses `l.sections.length` (dynamic); "Read · k of N" is dynamic; `l-refresh` uses quiz `s` as a section index; results list uses `l.sections[r.s].h`.
- `native/src/engine.js`: `lessonMins` used `words/190 + 2` with a 3 minute floor. Lesson step list is built from `l.sections` (dynamic). `qLesson` copies quiz `s`. Wrong-answer recap adds `l-refresh` for `r.s`.
- Saved progress: `state.lessons[id]` stores `box`, `due`, `learnedAt`, `best`, `attempts` only. No in-progress section index is persisted, so existing users' progress cannot point at a missing page. `best` is a quiz score out of 5; quiz length stays 5.
- The web app (`index.html`) has the same player logic and `lessonMins`; kept consistent so it doesn't break.
- Expression and Vocabulary quiz entry points: see the notes in the UI section below.

## Lesson checklist (Steps 1-3: 5 pages, quiz, push hint)

Tick = rewritten, quiz remapped, push hint written, checked against original.

**lessons-body.js**
- [ ] brain
- [ ] sleep
- [ ] immune-system

**lessons-body2.js**
- [ ] nutrition
- [ ] exercise
- [ ] stress
- [ ] sun-safety

**lessons-history.js**
- [ ] ancient-egypt
- [ ] ww2
- [ ] printing-press
- [ ] renaissance

**lessons-history2.js**
- [ ] ancient-rome
- [ ] black-death
- [ ] industrial-revolution
- [ ] ww1
- [ ] cold-war
- [ ] first-australians

**lessons-life.js**
- [ ] negotiation
- [ ] scams
- [ ] digital-security
- [ ] first-aid

**lessons-life2.js**
- [ ] public-speaking
- [ ] communication
- [ ] time-management

**lessons-life3.js**
- [ ] cooking
- [ ] home-maintenance
- [ ] car-basics

**lessons-money.js**
- [ ] compound-interest
- [ ] stock-market
- [ ] inflation
- [ ] budgeting

**lessons-money2.js**
- [ ] superannuation
- [ ] tax-basics
- [ ] credit-scores
- [ ] home-loans
- [ ] index-funds

**lessons-money3.js**
- [ ] supply-demand

**lessons-nature.js**
- [ ] octopus-mind
- [ ] bees
- [ ] wildlife
- [ ] english-language

**lessons-psychology.js**
- [ ] cognitive-biases
- [ ] persuasion
- [ ] conditioning
- [ ] habits
- [ ] procrastination

**lessons-psychology2.js**
- [ ] memory-palace
- [ ] mnemonics
- [ ] placebo
- [ ] decisions

**lessons-science.js**
- [ ] evolution
- [ ] water
- [ ] quantum

**lessons-science2.js**
- [ ] climate-change
- [ ] antibiotics
- [ ] dna

**lessons-space.js**
- [ ] black-holes
- [ ] stars
- [ ] big-bang
- [ ] moon

**lessons-tech.js**
- [ ] internet
- [ ] encryption
- [ ] gps

**lessons-tech2.js**
- [ ] blockchain
- [ ] ai-models

**lessons-thinking.js**
- [ ] correlation-causation
- [ ] logical-fallacies
- [ ] evidence

**lessons-thinking2.js**
- [ ] probability
- [ ] statistics
- [ ] misinformation

**lessons-world.js**
- [ ] stoicism
- [ ] ethics
- [ ] plate-tectonics
- [ ] australia-climate

**inner-lessons-a.js**
- [ ] sanctum-godel
- [ ] sanctum-bayes
- [ ] sanctum-arrow
- [ ] sanctum-hard-problem

**inner-lessons-b.js**
- [ ] sanctum-ergodicity
- [ ] sanctum-fat-tails
- [ ] sanctum-cooperation
- [ ] sanctum-second-order

**inner-lessons-c.js**
- [ ] sanctum-entropy
- [ ] sanctum-fermi
- [ ] sanctum-replication
- [ ] sanctum-collapse

**lessons-y-ai.js**
- [ ] recommendation-feeds
- [ ] self-driving-cars
- [ ] ai-in-medicine
- [ ] moravecs-paradox
- [ ] machine-translation
- [ ] computer-vision
- [ ] can-machines-have-minds
- [ ] specification-gaming

**lessons-y-ancient.js**
- [ ] pompeii-herculaneum
- [ ] mongol-empire
- [ ] mali-empire-mansa-musa
- [ ] ancient-olympics
- [ ] byzantine-empire
- [ ] persian-empire
- [ ] bronze-age-collapse
- [ ] antikythera-mechanism

**lessons-y-arts.js**
- [ ] sydney-opera-house-story
- [ ] gothic-cathedrals
- [ ] film-editing-invisible-art
- [ ] story-of-pigments
- [ ] ukiyo-e-great-wave
- [ ] art-forgery
- [ ] opera-explained
- [ ] tuning-and-temperament

**lessons-y-beliefs.js**
- [ ] sikhism
- [ ] shinto
- [ ] aboriginal-dreaming
- [ ] epic-of-gilgamesh
- [ ] flood-myths
- [ ] zoroastrianism
- [ ] daoism
- [ ] maui-polynesian-myths

**lessons-y-body.js**
- [ ] skin-largest-organ
- [ ] how-breathing-works
- [ ] hormones-messengers
- [ ] liver-chemical-factory
- [ ] kidneys-filters
- [ ] gut-microbiome
- [ ] why-we-age
- [ ] science-of-pain

**lessons-y-business.js**
- [ ] pricing-psychology
- [ ] power-of-brands
- [ ] economic-moats
- [ ] kodak-disruption
- [ ] ford-toyota-production
- [ ] monopolies-competition
- [ ] shipping-container
- [ ] mcdonalds-franchising

**lessons-y-emotions.js**
- [ ] grief-how-we-mourn
- [ ] jealousy-and-envy
- [ ] forgiveness-science
- [ ] shame-and-guilt
- [ ] nostalgia-science
- [ ] science-of-awe
- [ ] art-of-apology
- [ ] siblings-science

**lessons-y-explore.js**
- [ ] longitude-problem
- [ ] accidental-inventions
- [ ] refrigeration
- [ ] toilets-sewers
- [ ] burke-and-wills
- [ ] ibn-battuta
- [ ] photography-invention
- [ ] bicycle

**lessons-y-food.js**
- [ ] coffee-bean-to-cup
- [ ] chocolate-cacao
- [ ] tea-story
- [ ] australian-bush-foods
- [ ] fermentation-microbes
- [ ] spice-trade
- [ ] umami-msg
- [ ] chilli-heat

**lessons-y-geography.js**
- [ ] uluru-kata-tjuta
- [ ] lightning-thunderstorms
- [ ] rainforests
- [ ] coastlines-beaches
- [ ] tropical-cyclones
- [ ] glaciers
- [ ] caves-karst
- [ ] jet-streams

**lessons-y-history.js**
- [ ] spanish-armada
- [ ] great-fire-of-london
- [ ] east-india-company
- [ ] meiji-japan
- [ ] opium-wars
- [ ] thirty-years-war
- [ ] kokoda-track
- [ ] chernobyl

**lessons-y-life-everyday.js**
- [ ] medicare-and-finding-a-gp
- [ ] mygov-and-government-services
- [ ] buying-a-used-car
- [ ] travelling-overseas-smoothly
- [ ] making-a-will
- [ ] complaints-that-get-results
- [ ] building-a-better-sleep-routine
- [ ] private-health-insurance-decoded

**lessons-y-life-home.js**
- [ ] cleaning-science-stains
- [ ] laundry-done-right
- [ ] cut-power-water-bills
- [ ] diy-toolkit-basics
- [ ] gardening-australia-basics
- [ ] moving-house-checklist
- [ ] keeping-pests-out
- [ ] declutter-organise

**lessons-y-life-money.js**
- [ ] lodging-your-tax-return
- [ ] super-housekeeping
- [ ] cutting-household-bills
- [ ] making-an-insurance-claim
- [ ] comparing-personal-loans
- [ ] getting-out-of-debt
- [ ] big-purchases-bnpl
- [ ] building-an-emergency-fund
- [ ] income-protection-insurance

**lessons-y-life-work.js**
- [ ] resume-that-gets-read
- [ ] reading-your-payslip
- [ ] asking-for-a-pay-rise
- [ ] running-a-good-meeting
- [ ] giving-and-receiving-feedback
- [ ] burnout-and-disconnecting
- [ ] contractor-or-employee
- [ ] leaving-a-job-well

**lessons-y-literature.js**
- [ ] dictionary-makers
- [ ] australian-english
- [ ] punctuation-history
- [ ] detective-fiction
- [ ] fairy-tale-origins
- [ ] frankenstein
- [ ] children-learning-language
- [ ] hero-journey-stories

**lessons-y-maths.js**
- [ ] power-of-doubling
- [ ] monty-hall-problem
- [ ] fractals-coastlines
- [ ] seven-bridges-networks
- [ ] check-digits
- [ ] benfords-law
- [ ] geometry-in-nature
- [ ] history-of-counting

**lessons-y-money.js**
- [ ] history-of-money
- [ ] how-banks-create-money
- [ ] hyperinflation
- [ ] financial-bubbles
- [ ] opportunity-cost
- [ ] externalities
- [ ] incentives
- [ ] great-economic-debate

**lessons-y-nature.js**
- [ ] tardigrades
- [ ] mangroves
- [ ] carnivorous-plants
- [ ] camouflage
- [ ] fungi
- [ ] ants
- [ ] eucalypts
- [ ] animal-longevity

**lessons-y-philosophy.js**
- [ ] trolley-problem
- [ ] ship-of-theseus
- [ ] descartes-doubt
- [ ] epicurus-pleasure
- [ ] ubuntu-philosophy
- [ ] islamic-golden-age-philosophy
- [ ] problem-of-induction
- [ ] veil-of-ignorance

**lessons-y-psychology.js**
- [ ] inattentional-blindness
- [ ] cognitive-dissonance
- [ ] impostor-phenomenon
- [ ] spotlight-effect
- [ ] deja-vu
- [ ] boredom-science
- [ ] choice-overload
- [ ] self-control-marshmallow

**lessons-y-safety.js**
- [ ] flood-safety
- [ ] heatwave-safety
- [ ] home-fire-safety
- [ ] emergency-kit-plan
- [ ] storms-cyclones
- [ ] driving-long-distance
- [ ] heart-attack-stroke-signs
- [ ] lost-in-the-bush

**lessons-y-science.js**
- [ ] magnetism
- [ ] sound
- [ ] photosynthesis
- [ ] cells
- [ ] radioactivity
- [ ] heat-temperature
- [ ] enzymes
- [ ] soil

**lessons-y-society.js**
- [ ] code-of-hammurabi
- [ ] trial-by-jury
- [ ] separation-of-powers
- [ ] the-dismissal-1975
- [ ] mabo-native-title
- [ ] nuremberg-trials
- [ ] votes-for-women-au
- [ ] social-contract

**lessons-y-space.js**
- [ ] auroras-space-weather
- [ ] meteors-meteorites
- [ ] neutron-stars-pulsars
- [ ] gravitational-waves
- [ ] ocean-moons
- [ ] space-junk
- [ ] cosmic-distance-ladder
- [ ] first-nations-astronomy

**lessons-y-technology.js**
- [ ] touchscreens
- [ ] how-wifi-works
- [ ] the-cloud
- [ ] lithium-ion-batteries
- [ ] undersea-cables
- [ ] babbage-and-lovelace
- [ ] file-compression
- [ ] making-microchips

**lessons-y-thinking.js**
- [ ] philosophical-razors
- [ ] conspiracy-theories
- [ ] cold-reading-barnum-effect
- [ ] illusion-of-explanatory-depth
- [ ] science-vs-pseudoscience
- [ ] patterns-in-randomness
- [ ] regression-to-the-mean
- [ ] berksons-paradox

**lessons-x-body.js**
- [ ] heart-blood
- [ ] digestion
- [ ] muscles-bones
- [ ] senses
- [ ] neurons
- [ ] brain-chemicals
- [ ] dreams
- [ ] consciousness

**lessons-x-chemphys.js**
- [ ] atoms
- [ ] periodic-table
- [ ] chemical-reactions
- [ ] acids-bases
- [ ] kitchen-chemistry
- [ ] newtons-laws
- [ ] gravity
- [ ] energy
- [ ] electricity
- [ ] light
- [ ] relativity

**lessons-x-explorers.js**
- [ ] polynesian-navigators
- [ ] marco-polo
- [ ] age-of-discovery
- [ ] magellan
- [ ] cook
- [ ] polar-explorers

**lessons-x-firstcivs.js**
- [ ] mesopotamia
- [ ] writing-origins
- [ ] indus-valley
- [ ] ancient-china
- [ ] maya-aztec-inca

**lessons-x-greece.js**
- [ ] greek-city-states
- [ ] greek-democracy
- [ ] greek-wars
- [ ] greek-philosophers
- [ ] alexander
- [ ] greek-legacy

**lessons-x-happy.js**
- [ ] happiness-science
- [ ] hedonic-adaptation
- [ ] gratitude
- [ ] social-connection
- [ ] meaning
- [ ] mindfulness
- [ ] attachment
- [ ] love-science
- [ ] conflict
- [ ] boundaries
- [ ] adult-friendship

**lessons-x-medieval.js**
- [ ] feudalism
- [ ] vikings
- [ ] islamic-golden-age
- [ ] crusades
- [ ] magna-carta

**lessons-x-mind.js**
- [ ] forgetting-curve
- [ ] learning-science
- [ ] focus
- [ ] growth-mindset
- [ ] emotions-science
- [ ] emotional-regulation
- [ ] empathy
- [ ] resilience

**lessons-x-modern.js**
- [ ] great-depression
- [ ] holocaust
- [ ] end-of-empires
- [ ] civil-rights
- [ ] first-fleet
- [ ] gold-rush
- [ ] federation
- [ ] modern-australia

**lessons-x-psych1.js**
- [ ] famous-experiments
- [ ] personality
- [ ] first-impressions
- [ ] conformity
- [ ] obedience
- [ ] bystander-effect
- [ ] groupthink

**lessons-x-psych2.js**
- [ ] manipulation-tactics
- [ ] gaslighting
- [ ] dark-triad
- [ ] cults
- [ ] false-memories
- [ ] optical-illusions
- [ ] dunning-kruger
- [ ] intuition

**lessons-x-revolutions.js**
- [ ] scientific-revolution
- [ ] american-revolution
- [ ] french-revolution
- [ ] abolition
- [ ] russian-revolution

**lessons-x-rome.js**
- [ ] roman-republic
- [ ] julius-caesar
- [ ] roman-daily-life
- [ ] roman-engineering
- [ ] fall-of-rome

**lessons-x-stoic.js**
- [ ] stoic-founders
- [ ] epictetus
- [ ] seneca
- [ ] marcus-aurelius
- [ ] stoic-practices
- [ ] socratic-method
- [ ] eastern-philosophy
- [ ] enlightenment
- [ ] free-will
- [ ] existentialism

**lessons-n-ai.js**
- [ ] ai-history
- [ ] machine-learning
- [ ] ai-images
- [ ] using-ai-well
- [ ] ai-risks

**lessons-n-animals.js**
- [ ] marsupials
- [ ] monotremes
- [ ] australian-birds
- [ ] reptiles
- [ ] animal-intelligence
- [ ] animal-senses
- [ ] migration

**lessons-n-art.js**
- [ ] cave-art
- [ ] aboriginal-art
- [ ] impressionism
- [ ] modern-art
- [ ] looking-at-art

**lessons-n-books.js**
- [ ] epics
- [ ] shakespeare
- [ ] the-novel
- [ ] poetry
- [ ] dystopias

**lessons-n-business.js**
- [ ] business-idea
- [ ] business-model
- [ ] marketing-basics
- [ ] cash-flow
- [ ] start-business-au
- [ ] startup-lessons

**lessons-n-coding.js**
- [ ] what-is-code
- [ ] algorithms
- [ ] programming-languages
- [ ] how-websites
- [ ] debugging

**lessons-n-decide-finance.js**
- [ ] mental-models
- [ ] risk
- [ ] game-theory
- [ ] insurance
- [ ] retirement

**lessons-n-earth.js**
- [ ] earth-structure
- [ ] volcanoes-earthquakes
- [ ] weather
- [ ] ice-ages
- [ ] renewable-energy

**lessons-n-econ-work.js**
- [ ] gdp
- [ ] interest-rates
- [ ] trade
- [ ] recessions
- [ ] writing-emails
- [ ] job-interview

**lessons-n-evolution.js**
- [ ] genes-inheritance
- [ ] human-evolution
- [ ] extinction
- [ ] gene-editing
- [ ] first-life
- [ ] fossils

**lessons-n-fitness-food.js**
- [ ] cardio-fitness
- [ ] strength-training
- [ ] alcohol
- [ ] knife-skills
- [ ] flavour
- [ ] food-safety

**lessons-n-food-safety.js**
- [ ] baking-science
- [ ] meal-planning
- [ ] cpr
- [ ] bites-stings
- [ ] water-safety
- [ ] bushfire-safety

**lessons-n-geography.js**
- [ ] continents
- [ ] rivers-mountains
- [ ] deserts
- [ ] borders
- [ ] cities
- [ ] population

**lessons-n-government.js**
- [ ] how-democracy
- [ ] political-ideas
- [ ] australian-parliament
- [ ] voting-au
- [ ] human-rights
- [ ] united-nations

**lessons-n-inventions.js**
- [ ] engines
- [ ] electric-light
- [ ] telephone-radio
- [ ] flight
- [ ] australian-inventions

**lessons-n-investing.js**
- [ ] risk-return
- [ ] bonds
- [ ] diversification
- [ ] property-investing
- [ ] investing-mistakes

**lessons-n-language.js**
- [ ] language-origins
- [ ] etymology
- [ ] world-languages
- [ ] grammar-myths
- [ ] writing-well

**lessons-n-law.js**
- [ ] legal-system-au
- [ ] constitution-au
- [ ] contracts
- [ ] consumer-rights
- [ ] workplace-rights

**lessons-n-maths.js**
- [ ] percentages
- [ ] mental-maths
- [ ] big-numbers
- [ ] famous-maths

**lessons-n-medicine.js**
- [ ] germ-theory
- [ ] vaccines
- [ ] anaesthesia-surgery
- [ ] pandemics
- [ ] clinical-trials

**lessons-n-music.js**
- [ ] how-music-works
- [ ] instruments
- [ ] classical-music
- [ ] popular-music
- [ ] music-brain

**lessons-n-myths.js**
- [ ] why-myths
- [ ] greek-gods
- [ ] greek-heroes
- [ ] norse-myths
- [ ] egyptian-myths

**lessons-n-oceans.js**
- [ ] ocean-zones
- [ ] ocean-currents
- [ ] deep-sea
- [ ] sharks
- [ ] whales
- [ ] great-barrier-reef

**lessons-n-persuasion.js**
- [ ] aristotle-rhetoric
- [ ] storytelling
- [ ] famous-speeches
- [ ] arguing-well
- [ ] body-language
- [ ] renting

**lessons-n-prehistory-universe.js**
- [ ] dinosaurs
- [ ] dino-extinction
- [ ] megafauna
- [ ] solar-system
- [ ] galaxies
- [ ] exoplanets

**lessons-n-religions.js**
- [ ] religions-overview
- [ ] hinduism
- [ ] judaism
- [ ] buddhism
- [ ] christianity
- [ ] islam

**lessons-n-spaceflight.js**
- [ ] rockets
- [ ] space-race
- [ ] moon-landing
- [ ] iss
- [ ] telescopes
- [ ] mars

**lessons-n-tech-cyber.js**
- [ ] computers-work
- [ ] binary
- [ ] smartphones
- [ ] passwords
- [ ] phishing
- [ ] privacy
- [ ] hacking

**lessons-z-ai.js**
- [ ] mechanical-turk
- [ ] robot-origins
- [ ] automation-and-jobs
- [ ] spam-filters
- [ ] shortcut-learning
- [ ] speech-recognition
- [ ] gradient-descent
- [ ] word-embeddings
- [ ] expert-systems
- [ ] bitter-lesson

**lessons-z-ancient.js**
- [ ] rosetta-stone
- [ ] norman-conquest-1066
- [ ] cleopatra
- [ ] medieval-knights
- [ ] tutankhamun-tomb
- [ ] hannibal-punic-wars
- [ ] joan-of-arc
- [ ] hadrians-wall
- [ ] medieval-myths
- [ ] library-of-alexandria

**lessons-z-arts.js**
- [ ] mona-lisa-theft
- [ ] bayeux-tapestry
- [ ] birth-of-cinema
- [ ] frida-kahlo
- [ ] sistine-chapel-ceiling
- [ ] stradivarius-violins
- [ ] rite-of-spring-premiere
- [ ] bauhaus-design-school
- [ ] how-music-was-written-down
- [ ] vermeer-light

**lessons-z-beliefs.js**
- [ ] jainism
- [ ] irish-myths
- [ ] king-arthur-legend
- [ ] great-pilgrimages
- [ ] dia-de-muertos
- [ ] bahai-faith
- [ ] enuma-elish
- [ ] aztec-gods
- [ ] yoruba-orisha
- [ ] making-the-bible

**lessons-z-body.js**
- [ ] blood-types-explained
- [ ] how-wounds-heal
- [ ] teeth-enamel-decay
- [ ] how-your-voice-works
- [ ] water-and-thirst
- [ ] fever-explained
- [ ] reflexes-spinal-cord
- [ ] lymphatic-system
- [ ] vestigial-body-parts
- [ ] what-cancer-is

**lessons-z-business.js**
- [ ] new-coke-1985
- [ ] tylenol-crisis-1982
- [ ] double-entry-bookkeeping
- [ ] post-it-note-story
- [ ] ikea-flat-pack
- [ ] pareto-principle
- [ ] psychological-safety
- [ ] unit-economics
- [ ] tupperware-brownie-wise
- [ ] valuing-a-business

**lessons-z-emotions.js**
- [ ] anger-and-venting
- [ ] why-we-cry
- [ ] laughter-science
- [ ] self-compassion
- [ ] love-languages
- [ ] regret-science
- [ ] fear-science
- [ ] power-of-touch
- [ ] emotional-contagion
- [ ] emotional-labour

**lessons-z-explore.js**
- [ ] shackleton-endurance
- [ ] safety-elevator
- [ ] tin-can
- [ ] spectacles
- [ ] matthew-flinders
- [ ] zheng-he
- [ ] standard-time
- [ ] lewis-and-clark
- [ ] challenger-deep
- [ ] scurvy-vitamin-c

**lessons-z-food.js**
- [ ] salt-white-gold
- [ ] banana-clone-fruit
- [ ] potato-andes-world
- [ ] rice-staple-grain
- [ ] cookware-pans-guide
- [ ] sugar-bitter-history
- [ ] escoffier-modern-kitchen
- [ ] kitchen-myths-busted
- [ ] aussie-food-icons
- [ ] sous-vide-precision

**lessons-z-geography.js**
- [ ] year-without-summer
- [ ] cloud-types
- [ ] tornadoes
- [ ] antarctica
- [ ] everest-himalaya
- [ ] lake-eyre
- [ ] supervolcanoes
- [ ] green-sahara
- [ ] monsoons
- [ ] ice-cores

**lessons-z-history.js**
- [ ] irish-great-famine
- [ ] christmas-truce-1914
- [ ] titanic-sinking
- [ ] dunkirk-evacuation
- [ ] panama-canal
- [ ] bismarck-german-unification
- [ ] revolutions-of-1848
- [ ] vietnam-war-australia
- [ ] apartheid-south-africa
- [ ] maos-china

**lessons-z-life.js**
- [ ] backing-up-your-files
- [ ] useful-knots
- [ ] mending-clothes
- [ ] emergency-department-explained
- [ ] making-small-talk
- [ ] jump-start-and-flat-tyre
- [ ] map-and-compass
- [ ] hiring-a-tradie
- [ ] after-someone-dies
- [ ] buying-a-home-step-by-step

**lessons-z-literature.js**
- [ ] alice-in-wonderland
- [ ] ern-malley-hoax
- [ ] pen-names
- [ ] dracula-bram-stoker
- [ ] charles-dickens
- [ ] invented-languages
- [ ] sign-languages
- [ ] how-reading-works
- [ ] banned-books
- [ ] language-shapes-thought

**lessons-z-maths.js**
- [ ] pigeonhole-principle
- [ ] paper-sizes-root-two
- [ ] shuffled-deck-factorial
- [ ] average-speed-trap
- [ ] doomsday-rule
- [ ] napier-logarithms
- [ ] ramanujan
- [ ] fair-division
- [ ] queueing-maths
- [ ] calculus-without-fear

**lessons-z-money.js**
- [ ] decimal-currency-1966
- [ ] exchange-rates-aussie-dollar
- [ ] bank-runs
- [ ] medici-bank
- [ ] behavioural-economics-money
- [ ] gold-standard-bretton-woods
- [ ] global-financial-crisis
- [ ] market-for-lemons
- [ ] measuring-inequality
- [ ] quantitative-easing

**lessons-z-nature.js**
- [ ] cane-toads
- [ ] bioluminescence
- [ ] elephants
- [ ] emperor-penguins
- [ ] hibernation
- [ ] yellowstone-wolves
- [ ] spider-silk
- [ ] termite-mounds
- [ ] island-evolution
- [ ] symbiosis

**lessons-z-philosophy.js**
- [ ] ring-of-gyges
- [ ] diogenes-the-cynic
- [ ] drowning-child
- [ ] experience-machine
- [ ] zeno-paradoxes
- [ ] pascals-wager
- [ ] gettier-problem
- [ ] machiavelli-prince
- [ ] nietzsche-misunderstood
- [ ] sorites-paradox

**lessons-z-psychology.js**
- [ ] phineas-gage
- [ ] patient-hm
- [ ] split-brain
- [ ] learned-helplessness
- [ ] earworms
- [ ] sleep-paralysis
- [ ] time-perception
- [ ] cant-tickle-yourself
- [ ] phantom-limbs
- [ ] stockholm-syndrome

**lessons-z-safety.js**
- [ ] choking-first-aid
- [ ] severe-bleeding
- [ ] seizure-first-aid
- [ ] electrical-safety
- [ ] poisons-and-button-batteries
- [ ] carbon-monoxide
- [ ] crocodile-safety
- [ ] cold-water-hypothermia
- [ ] crash-scene-first-aid
- [ ] disaster-psychology

**lessons-z-science.js**
- [ ] states-of-matter
- [ ] air-pressure
- [ ] viruses
- [ ] why-things-float
- [ ] static-electricity
- [ ] plastics-polymers
- [ ] metric-measurement
- [ ] chaos-butterfly-effect
- [ ] carbon-element
- [ ] antimatter

**lessons-z-society.js**
- [ ] snail-in-the-bottle
- [ ] habeas-corpus
- [ ] referendum-1967
- [ ] gerrymandering
- [ ] diplomatic-immunity
- [ ] geneva-conventions
- [ ] lindy-chamberlain
- [ ] marbury-v-madison
- [ ] common-law-civil-law
- [ ] communist-party-case

**lessons-z-space.js**
- [ ] eclipses
- [ ] comets
- [ ] voyager-probes
- [ ] venus
- [ ] pluto-dwarf-planets
- [ ] jupiter-saturn
- [ ] planetary-defence
- [ ] australia-in-space
- [ ] spectroscopy-starlight
- [ ] dark-matter-energy

**lessons-z-technology.js**
- [ ] barcodes-qr-codes
- [ ] y2k-bug
- [ ] search-engines
- [ ] mobile-networks
- [ ] how-screens-work
- [ ] transistor-story
- [ ] phone-cameras
- [ ] text-encoding
- [ ] open-source
- [ ] halting-problem

**lessons-z-thinking.js**
- [ ] illusory-truth-effect
- [ ] wason-confirmation-bias
- [ ] outcome-bias
- [ ] n-rays-blondlot
- [ ] deduction-induction-abduction
- [ ] framing-effect
- [ ] wisdom-of-crowds
- [ ] law-of-small-numbers
- [ ] piltdown-man-hoax
- [ ] lady-tasting-tea

