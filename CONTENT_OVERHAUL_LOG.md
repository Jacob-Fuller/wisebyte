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
- [x] brain
- [x] sleep
- [x] immune-system

**lessons-body2.js**
- [x] nutrition
- [x] exercise
- [x] stress
- [x] sun-safety

**lessons-history.js**
- [x] ancient-egypt
- [x] ww2
- [x] printing-press
- [x] renaissance

**lessons-history2.js**
- [x] ancient-rome
- [x] black-death
- [x] industrial-revolution
- [x] ww1
- [x] cold-war
- [x] first-australians

**lessons-life.js**
- [x] negotiation
- [x] scams
- [x] digital-security
- [x] first-aid

**lessons-life2.js**
- [x] public-speaking
- [x] communication
- [x] time-management

**lessons-life3.js**
- [x] cooking
- [x] home-maintenance
- [x] car-basics

**lessons-money.js**
- [x] compound-interest
- [x] stock-market
- [x] inflation
- [x] budgeting

**lessons-money2.js**
- [x] superannuation
- [x] tax-basics
- [x] credit-scores
- [x] home-loans
- [x] index-funds

**lessons-money3.js**
- [x] supply-demand

**lessons-nature.js**
- [x] octopus-mind
- [x] bees
- [x] wildlife
- [x] english-language

**lessons-psychology.js**
- [x] cognitive-biases
- [x] persuasion
- [x] conditioning
- [x] habits
- [x] procrastination

**lessons-psychology2.js**
- [x] memory-palace
- [x] mnemonics
- [x] placebo
- [x] decisions

**lessons-science.js**
- [x] evolution
- [x] water
- [x] quantum

**lessons-science2.js**
- [x] climate-change
- [x] antibiotics
- [x] dna

**lessons-space.js**
- [x] black-holes
- [x] stars
- [x] big-bang
- [x] moon

**lessons-tech.js**
- [x] internet
- [x] encryption
- [x] gps

**lessons-tech2.js**
- [x] blockchain
- [x] ai-models

**lessons-thinking.js**
- [x] correlation-causation
- [x] logical-fallacies
- [x] evidence

**lessons-thinking2.js**
- [x] probability
- [x] statistics
- [x] misinformation

**lessons-world.js**
- [x] stoicism
- [x] ethics
- [x] plate-tectonics
- [x] australia-climate

**inner-lessons-a.js**
- [x] sanctum-godel
- [x] sanctum-bayes
- [x] sanctum-arrow
- [x] sanctum-hard-problem

**inner-lessons-b.js**
- [x] sanctum-ergodicity
- [x] sanctum-fat-tails
- [x] sanctum-cooperation
- [x] sanctum-second-order

**inner-lessons-c.js**
- [x] sanctum-entropy
- [x] sanctum-fermi
- [x] sanctum-replication
- [x] sanctum-collapse

**lessons-y-ai.js**
- [x] recommendation-feeds
- [x] self-driving-cars
- [x] ai-in-medicine
- [x] moravecs-paradox
- [x] machine-translation
- [x] computer-vision
- [x] can-machines-have-minds
- [x] specification-gaming

**lessons-y-ancient.js**
- [x] pompeii-herculaneum
- [x] mongol-empire
- [x] mali-empire-mansa-musa
- [x] ancient-olympics
- [x] byzantine-empire
- [x] persian-empire
- [x] bronze-age-collapse
- [x] antikythera-mechanism

**lessons-y-arts.js**
- [x] sydney-opera-house-story
- [x] gothic-cathedrals
- [x] film-editing-invisible-art
- [x] story-of-pigments
- [x] ukiyo-e-great-wave
- [x] art-forgery
- [x] opera-explained
- [x] tuning-and-temperament

**lessons-y-beliefs.js**
- [x] sikhism
- [x] shinto
- [x] aboriginal-dreaming
- [x] epic-of-gilgamesh
- [x] flood-myths
- [x] zoroastrianism
- [x] daoism
- [x] maui-polynesian-myths

**lessons-y-body.js**
- [x] skin-largest-organ
- [x] how-breathing-works
- [x] hormones-messengers
- [x] liver-chemical-factory
- [x] kidneys-filters
- [x] gut-microbiome
- [x] why-we-age
- [x] science-of-pain

**lessons-y-business.js**
- [x] pricing-psychology
- [x] power-of-brands
- [x] economic-moats
- [x] kodak-disruption
- [x] ford-toyota-production
- [x] monopolies-competition
- [x] shipping-container
- [x] mcdonalds-franchising

**lessons-y-emotions.js**
- [x] grief-how-we-mourn
- [x] jealousy-and-envy
- [x] forgiveness-science
- [x] shame-and-guilt
- [x] nostalgia-science
- [x] science-of-awe
- [x] art-of-apology
- [x] siblings-science

**lessons-y-explore.js**
- [x] longitude-problem
- [x] accidental-inventions
- [x] refrigeration
- [x] toilets-sewers
- [x] burke-and-wills
- [x] ibn-battuta
- [x] photography-invention
- [x] bicycle

**lessons-y-food.js**
- [x] coffee-bean-to-cup
- [x] chocolate-cacao
- [x] tea-story
- [x] australian-bush-foods
- [x] fermentation-microbes
- [x] spice-trade
- [x] umami-msg
- [x] chilli-heat

**lessons-y-geography.js**
- [x] uluru-kata-tjuta
- [x] lightning-thunderstorms
- [x] rainforests
- [x] coastlines-beaches
- [x] tropical-cyclones
- [x] glaciers
- [x] caves-karst
- [x] jet-streams

**lessons-y-history.js**
- [x] spanish-armada
- [x] great-fire-of-london
- [x] east-india-company
- [x] meiji-japan
- [x] opium-wars
- [x] thirty-years-war
- [x] kokoda-track
- [x] chernobyl

**lessons-y-life-everyday.js**
- [x] medicare-and-finding-a-gp
- [x] mygov-and-government-services
- [x] buying-a-used-car
- [x] travelling-overseas-smoothly
- [x] making-a-will
- [x] complaints-that-get-results
- [x] building-a-better-sleep-routine
- [x] private-health-insurance-decoded

**lessons-y-life-home.js**
- [x] cleaning-science-stains
- [x] laundry-done-right
- [x] cut-power-water-bills
- [x] diy-toolkit-basics
- [x] gardening-australia-basics
- [x] moving-house-checklist
- [x] keeping-pests-out
- [x] declutter-organise

**lessons-y-life-money.js**
- [x] lodging-your-tax-return
- [x] super-housekeeping
- [x] cutting-household-bills
- [x] making-an-insurance-claim
- [x] comparing-personal-loans
- [x] getting-out-of-debt
- [x] big-purchases-bnpl
- [x] building-an-emergency-fund
- [x] income-protection-insurance

**lessons-y-life-work.js**
- [x] resume-that-gets-read
- [x] reading-your-payslip
- [x] asking-for-a-pay-rise
- [x] running-a-good-meeting
- [x] giving-and-receiving-feedback
- [x] burnout-and-disconnecting
- [x] contractor-or-employee
- [x] leaving-a-job-well

**lessons-y-literature.js**
- [x] dictionary-makers
- [x] australian-english
- [x] punctuation-history
- [x] detective-fiction
- [x] fairy-tale-origins
- [x] frankenstein
- [x] children-learning-language
- [x] hero-journey-stories

**lessons-y-maths.js**
- [x] power-of-doubling
- [x] monty-hall-problem
- [x] fractals-coastlines
- [x] seven-bridges-networks
- [x] check-digits
- [x] benfords-law
- [x] geometry-in-nature
- [x] history-of-counting

**lessons-y-money.js**
- [x] history-of-money
- [x] how-banks-create-money
- [x] hyperinflation
- [x] financial-bubbles
- [x] opportunity-cost
- [x] externalities
- [x] incentives
- [x] great-economic-debate

**lessons-y-nature.js**
- [x] tardigrades
- [x] mangroves
- [x] carnivorous-plants
- [x] camouflage
- [x] fungi
- [x] ants
- [x] eucalypts
- [x] animal-longevity

**lessons-y-philosophy.js**
- [x] trolley-problem
- [x] ship-of-theseus
- [x] descartes-doubt
- [x] epicurus-pleasure
- [x] ubuntu-philosophy
- [x] islamic-golden-age-philosophy
- [x] problem-of-induction
- [x] veil-of-ignorance

**lessons-y-psychology.js**
- [x] inattentional-blindness
- [x] cognitive-dissonance
- [x] impostor-phenomenon
- [x] spotlight-effect
- [x] deja-vu
- [x] boredom-science
- [x] choice-overload
- [x] self-control-marshmallow

**lessons-y-safety.js**
- [x] flood-safety
- [x] heatwave-safety
- [x] home-fire-safety
- [x] emergency-kit-plan
- [x] storms-cyclones
- [x] driving-long-distance
- [x] heart-attack-stroke-signs
- [x] lost-in-the-bush

**lessons-y-science.js**
- [x] magnetism
- [x] sound
- [x] photosynthesis
- [x] cells
- [x] radioactivity
- [x] heat-temperature
- [x] enzymes
- [x] soil

**lessons-y-society.js**
- [x] code-of-hammurabi
- [x] trial-by-jury
- [x] separation-of-powers
- [x] the-dismissal-1975
- [x] mabo-native-title
- [x] nuremberg-trials
- [x] votes-for-women-au
- [x] social-contract

**lessons-y-space.js**
- [x] auroras-space-weather
- [x] meteors-meteorites
- [x] neutron-stars-pulsars
- [x] gravitational-waves
- [x] ocean-moons
- [x] space-junk
- [x] cosmic-distance-ladder
- [x] first-nations-astronomy

**lessons-y-technology.js**
- [x] touchscreens
- [x] how-wifi-works
- [x] the-cloud
- [x] lithium-ion-batteries
- [x] undersea-cables
- [x] babbage-and-lovelace
- [x] file-compression
- [x] making-microchips

**lessons-y-thinking.js**
- [x] philosophical-razors
- [x] conspiracy-theories
- [x] cold-reading-barnum-effect
- [x] illusion-of-explanatory-depth
- [x] science-vs-pseudoscience
- [x] patterns-in-randomness
- [x] regression-to-the-mean
- [x] berksons-paradox

**lessons-x-body.js**
- [x] heart-blood
- [x] digestion
- [x] muscles-bones
- [x] senses
- [x] neurons
- [x] brain-chemicals
- [x] dreams
- [x] consciousness

**lessons-x-chemphys.js**
- [x] atoms
- [x] periodic-table
- [x] chemical-reactions
- [x] acids-bases
- [x] kitchen-chemistry
- [x] newtons-laws
- [x] gravity
- [x] energy
- [x] electricity
- [x] light
- [x] relativity

**lessons-x-explorers.js**
- [x] polynesian-navigators
- [x] marco-polo
- [x] age-of-discovery
- [x] magellan
- [x] cook
- [x] polar-explorers

**lessons-x-firstcivs.js**
- [x] mesopotamia
- [x] writing-origins
- [x] indus-valley
- [x] ancient-china
- [x] maya-aztec-inca

**lessons-x-greece.js**
- [x] greek-city-states
- [x] greek-democracy
- [x] greek-wars
- [x] greek-philosophers
- [x] alexander
- [x] greek-legacy

**lessons-x-happy.js**
- [x] happiness-science
- [x] hedonic-adaptation
- [x] gratitude
- [x] social-connection
- [x] meaning
- [x] mindfulness
- [x] attachment
- [x] love-science
- [x] conflict
- [x] boundaries
- [x] adult-friendship

**lessons-x-medieval.js**
- [x] feudalism
- [x] vikings
- [x] islamic-golden-age
- [x] crusades
- [x] magna-carta

**lessons-x-mind.js**
- [x] forgetting-curve
- [x] learning-science
- [x] focus
- [x] growth-mindset
- [x] emotions-science
- [x] emotional-regulation
- [x] empathy
- [x] resilience

**lessons-x-modern.js**
- [x] great-depression
- [x] holocaust
- [x] end-of-empires
- [x] civil-rights
- [x] first-fleet
- [x] gold-rush
- [x] federation
- [x] modern-australia

**lessons-x-psych1.js**
- [x] famous-experiments
- [x] personality
- [x] first-impressions
- [x] conformity
- [x] obedience
- [x] bystander-effect
- [x] groupthink

**lessons-x-psych2.js**
- [x] manipulation-tactics
- [x] gaslighting
- [x] dark-triad
- [x] cults
- [x] false-memories
- [x] optical-illusions
- [x] dunning-kruger
- [x] intuition

**lessons-x-revolutions.js**
- [x] scientific-revolution
- [x] american-revolution
- [x] french-revolution
- [x] abolition
- [x] russian-revolution

**lessons-x-rome.js**
- [x] roman-republic
- [x] julius-caesar
- [x] roman-daily-life
- [x] roman-engineering
- [x] fall-of-rome

**lessons-x-stoic.js**
- [x] stoic-founders
- [x] epictetus
- [x] seneca
- [x] marcus-aurelius
- [x] stoic-practices
- [x] socratic-method
- [x] eastern-philosophy
- [x] enlightenment
- [x] free-will
- [x] existentialism

**lessons-n-ai.js**
- [x] ai-history
- [x] machine-learning
- [x] ai-images
- [x] using-ai-well
- [x] ai-risks

**lessons-n-animals.js**
- [x] marsupials
- [x] monotremes
- [x] australian-birds
- [x] reptiles
- [x] animal-intelligence
- [x] animal-senses
- [x] migration

**lessons-n-art.js**
- [x] cave-art
- [x] aboriginal-art
- [x] impressionism
- [x] modern-art
- [x] looking-at-art

**lessons-n-books.js**
- [x] epics
- [x] shakespeare
- [x] the-novel
- [x] poetry
- [x] dystopias

**lessons-n-business.js**
- [x] business-idea
- [x] business-model
- [x] marketing-basics
- [x] cash-flow
- [x] start-business-au
- [x] startup-lessons

**lessons-n-coding.js**
- [x] what-is-code
- [x] algorithms
- [x] programming-languages
- [x] how-websites
- [x] debugging

**lessons-n-decide-finance.js**
- [x] mental-models
- [x] risk
- [x] game-theory
- [x] insurance
- [x] retirement

**lessons-n-earth.js**
- [x] earth-structure
- [x] volcanoes-earthquakes
- [x] weather
- [x] ice-ages
- [x] renewable-energy

**lessons-n-econ-work.js**
- [x] gdp
- [x] interest-rates
- [x] trade
- [x] recessions
- [x] writing-emails
- [x] job-interview

**lessons-n-evolution.js**
- [x] genes-inheritance
- [x] human-evolution
- [x] extinction
- [x] gene-editing
- [x] first-life
- [x] fossils

**lessons-n-fitness-food.js**
- [x] cardio-fitness
- [x] strength-training
- [x] alcohol
- [x] knife-skills
- [x] flavour
- [x] food-safety

**lessons-n-food-safety.js**
- [x] baking-science
- [x] meal-planning
- [x] cpr
- [x] bites-stings
- [x] water-safety
- [x] bushfire-safety

**lessons-n-geography.js**
- [x] continents
- [x] rivers-mountains
- [x] deserts
- [x] borders
- [x] cities
- [x] population

**lessons-n-government.js**
- [x] how-democracy
- [x] political-ideas
- [x] australian-parliament
- [x] voting-au
- [x] human-rights
- [x] united-nations

**lessons-n-inventions.js**
- [x] engines
- [x] electric-light
- [x] telephone-radio
- [x] flight
- [x] australian-inventions

**lessons-n-investing.js**
- [x] risk-return
- [x] bonds
- [x] diversification
- [x] property-investing
- [x] investing-mistakes

**lessons-n-language.js**
- [x] language-origins
- [x] etymology
- [x] world-languages
- [x] grammar-myths
- [x] writing-well

**lessons-n-law.js**
- [x] legal-system-au
- [x] constitution-au
- [x] contracts
- [x] consumer-rights
- [x] workplace-rights

**lessons-n-maths.js**
- [x] percentages
- [x] mental-maths
- [x] big-numbers
- [x] famous-maths

**lessons-n-medicine.js**
- [x] germ-theory
- [x] vaccines
- [x] anaesthesia-surgery
- [x] pandemics
- [x] clinical-trials

**lessons-n-music.js**
- [x] how-music-works
- [x] instruments
- [x] classical-music
- [x] popular-music
- [x] music-brain

**lessons-n-myths.js**
- [x] why-myths
- [x] greek-gods
- [x] greek-heroes
- [x] norse-myths
- [x] egyptian-myths

**lessons-n-oceans.js**
- [x] ocean-zones
- [x] ocean-currents
- [x] deep-sea
- [x] sharks
- [x] whales
- [x] great-barrier-reef

**lessons-n-persuasion.js**
- [x] aristotle-rhetoric
- [x] storytelling
- [x] famous-speeches
- [x] arguing-well
- [x] body-language
- [x] renting

**lessons-n-prehistory-universe.js**
- [x] dinosaurs
- [x] dino-extinction
- [x] megafauna
- [x] solar-system
- [x] galaxies
- [x] exoplanets

**lessons-n-religions.js**
- [x] religions-overview
- [x] hinduism
- [x] judaism
- [x] buddhism
- [x] christianity
- [x] islam

**lessons-n-spaceflight.js**
- [x] rockets
- [x] space-race
- [x] moon-landing
- [x] iss
- [x] telescopes
- [x] mars

**lessons-n-tech-cyber.js**
- [x] computers-work
- [x] binary
- [x] smartphones
- [x] passwords
- [x] phishing
- [x] privacy
- [x] hacking

**lessons-z-ai.js**
- [x] mechanical-turk
- [x] robot-origins
- [x] automation-and-jobs
- [x] spam-filters
- [x] shortcut-learning
- [x] speech-recognition
- [x] gradient-descent
- [x] word-embeddings
- [x] expert-systems
- [x] bitter-lesson

**lessons-z-ancient.js**
- [x] rosetta-stone
- [x] norman-conquest-1066
- [x] cleopatra
- [x] medieval-knights
- [x] tutankhamun-tomb
- [x] hannibal-punic-wars
- [x] joan-of-arc
- [x] hadrians-wall
- [x] medieval-myths
- [x] library-of-alexandria

**lessons-z-arts.js**
- [x] mona-lisa-theft
- [x] bayeux-tapestry
- [x] birth-of-cinema
- [x] frida-kahlo
- [x] sistine-chapel-ceiling
- [x] stradivarius-violins
- [x] rite-of-spring-premiere
- [x] bauhaus-design-school
- [x] how-music-was-written-down
- [x] vermeer-light

**lessons-z-beliefs.js**
- [x] jainism
- [x] irish-myths
- [x] king-arthur-legend
- [x] great-pilgrimages
- [x] dia-de-muertos
- [x] bahai-faith
- [x] enuma-elish
- [x] aztec-gods
- [x] yoruba-orisha
- [x] making-the-bible

**lessons-z-body.js**
- [x] blood-types-explained
- [x] how-wounds-heal
- [x] teeth-enamel-decay
- [x] how-your-voice-works
- [x] water-and-thirst
- [x] fever-explained
- [x] reflexes-spinal-cord
- [x] lymphatic-system
- [x] vestigial-body-parts
- [x] what-cancer-is

**lessons-z-business.js**
- [x] new-coke-1985
- [x] tylenol-crisis-1982
- [x] double-entry-bookkeeping
- [x] post-it-note-story
- [x] ikea-flat-pack
- [x] pareto-principle
- [x] psychological-safety
- [x] unit-economics
- [x] tupperware-brownie-wise
- [x] valuing-a-business

**lessons-z-emotions.js**
- [x] anger-and-venting
- [x] why-we-cry
- [x] laughter-science
- [x] self-compassion
- [x] love-languages
- [x] regret-science
- [x] fear-science
- [x] power-of-touch
- [x] emotional-contagion
- [x] emotional-labour

**lessons-z-explore.js**
- [x] shackleton-endurance
- [x] safety-elevator
- [x] tin-can
- [x] spectacles
- [x] matthew-flinders
- [x] zheng-he
- [x] standard-time
- [x] lewis-and-clark
- [x] challenger-deep
- [x] scurvy-vitamin-c

**lessons-z-food.js**
- [x] salt-white-gold
- [x] banana-clone-fruit
- [x] potato-andes-world
- [x] rice-staple-grain
- [x] cookware-pans-guide
- [x] sugar-bitter-history
- [x] escoffier-modern-kitchen
- [x] kitchen-myths-busted
- [x] aussie-food-icons
- [x] sous-vide-precision

**lessons-z-geography.js**
- [x] year-without-summer
- [x] cloud-types
- [x] tornadoes
- [x] antarctica
- [x] everest-himalaya
- [x] lake-eyre
- [x] supervolcanoes
- [x] green-sahara
- [x] monsoons
- [x] ice-cores

**lessons-z-history.js**
- [x] irish-great-famine
- [x] christmas-truce-1914
- [x] titanic-sinking
- [x] dunkirk-evacuation
- [x] panama-canal
- [x] bismarck-german-unification
- [x] revolutions-of-1848
- [x] vietnam-war-australia
- [x] apartheid-south-africa
- [x] maos-china

**lessons-z-life.js**
- [x] backing-up-your-files
- [x] useful-knots
- [x] mending-clothes
- [x] emergency-department-explained
- [x] making-small-talk
- [x] jump-start-and-flat-tyre
- [x] map-and-compass
- [x] hiring-a-tradie
- [x] after-someone-dies
- [x] buying-a-home-step-by-step

**lessons-z-literature.js**
- [x] alice-in-wonderland
- [x] ern-malley-hoax
- [x] pen-names
- [x] dracula-bram-stoker
- [x] charles-dickens
- [x] invented-languages
- [x] sign-languages
- [x] how-reading-works
- [x] banned-books
- [x] language-shapes-thought

**lessons-z-maths.js**
- [x] pigeonhole-principle
- [x] paper-sizes-root-two
- [x] shuffled-deck-factorial
- [x] average-speed-trap
- [x] doomsday-rule
- [x] napier-logarithms
- [x] ramanujan
- [x] fair-division
- [x] queueing-maths
- [x] calculus-without-fear

**lessons-z-money.js**
- [x] decimal-currency-1966
- [x] exchange-rates-aussie-dollar
- [x] bank-runs
- [x] medici-bank
- [x] behavioural-economics-money
- [x] gold-standard-bretton-woods
- [x] global-financial-crisis
- [x] market-for-lemons
- [x] measuring-inequality
- [x] quantitative-easing

**lessons-z-nature.js**
- [x] cane-toads
- [x] bioluminescence
- [x] elephants
- [x] emperor-penguins
- [x] hibernation
- [x] yellowstone-wolves
- [x] spider-silk
- [x] termite-mounds
- [x] island-evolution
- [x] symbiosis

**lessons-z-philosophy.js**
- [x] ring-of-gyges
- [x] diogenes-the-cynic
- [x] drowning-child
- [x] experience-machine
- [x] zeno-paradoxes
- [x] pascals-wager
- [x] gettier-problem
- [x] machiavelli-prince
- [x] nietzsche-misunderstood
- [x] sorites-paradox

**lessons-z-psychology.js**
- [x] phineas-gage
- [x] patient-hm
- [x] split-brain
- [x] learned-helplessness
- [x] earworms
- [x] sleep-paralysis
- [x] time-perception
- [x] cant-tickle-yourself
- [x] phantom-limbs
- [x] stockholm-syndrome

**lessons-z-safety.js**
- [x] choking-first-aid
- [x] severe-bleeding
- [x] seizure-first-aid
- [x] electrical-safety
- [x] poisons-and-button-batteries
- [x] carbon-monoxide
- [x] crocodile-safety
- [x] cold-water-hypothermia
- [x] crash-scene-first-aid
- [x] disaster-psychology

**lessons-z-science.js**
- [x] states-of-matter
- [x] air-pressure
- [x] viruses
- [x] why-things-float
- [x] static-electricity
- [x] plastics-polymers
- [x] metric-measurement
- [x] chaos-butterfly-effect
- [x] carbon-element
- [x] antimatter

**lessons-z-society.js**
- [x] snail-in-the-bottle
- [x] habeas-corpus
- [x] referendum-1967
- [x] gerrymandering
- [x] diplomatic-immunity
- [x] geneva-conventions
- [x] lindy-chamberlain
- [x] marbury-v-madison
- [x] common-law-civil-law
- [x] communist-party-case

**lessons-z-space.js**
- [x] eclipses
- [x] comets
- [x] voyager-probes
- [x] venus
- [x] pluto-dwarf-planets
- [x] jupiter-saturn
- [x] planetary-defence
- [x] australia-in-space
- [x] spectroscopy-starlight
- [x] dark-matter-energy

**lessons-z-technology.js**
- [x] barcodes-qr-codes
- [x] y2k-bug
- [x] search-engines
- [x] mobile-networks
- [x] how-screens-work
- [x] transistor-story
- [x] phone-cameras
- [x] text-encoding
- [x] open-source
- [x] halting-problem

**lessons-z-thinking.js**
- [x] illusory-truth-effect
- [x] wason-confirmation-bias
- [x] outcome-bias
- [x] n-rays-blondlot
- [x] deduction-induction-abduction
- [x] framing-effect
- [x] wisdom-of-crowds
- [x] law-of-small-numbers
- [x] piltdown-man-hoax
- [x] lady-tasting-tea

