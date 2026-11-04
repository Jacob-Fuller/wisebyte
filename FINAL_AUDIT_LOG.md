# Wisebyte final audit log

Branch: `final-audit` (from `main` at eacbf59). Brief: the "Wisebyte: final complete audit" prompt (4 Nov 2026).
Resume a lost session with: "Continue the Wisebyte final audit from FINAL_AUDIT_LOG.md."

## Baseline (structure script `scripts/audit-structure.js`)
- 802 lessons, 4,010 questions (answer spread A/B/C/D 23/32/26/19%), 1,060 words, 197 quotes, 2,998 Scroll items
- Errors 0. Warnings: 122 lessons outside any course, 3 duplicate questions, 2 answers longest by far, 1 US spelling

## Plan
Phases A (facts), B (quality) and C (quizzes) are run together, one pass per lesson by 12 parallel batches, each in its own temp folder,
so each lesson is read once with all three lenses. Non-lesson content (quotes, words, Arena and Cognition banks, Inner Circle banks,
Scroll pool, Go originals) runs alongside in its own batches. Then: verification pass (fresh agents), Phase D (courses, overlap,
audio rebuild), Phase E (code), Phase F (App Store readiness), final checks.

### Batches
| Batch | Scope | Status |
|---|---|---|
| L01-L12 | lesson files (≈67 lessons each) | done |
| Q | quotes (index.html QUOTES, quotes2.js) | done |
| V1 | words.js, words2.js | done |
| V2 | words3.js | done |
| K1 | think.js, think2.js, timeline.js | done |
| K2 | think3.js | done |
| IN | inner.js, inner2.js, inner3.js | done |
| S1 | scroll/index.html | done |
| S2 | scroll/more.js | done |
| GO | go/index.html audio scripts (report only) | done |

## Phases A-C results (facts, quality, quizzes)

### Counts
| Batch | Reviewed | Facts corrected | Softened | Other notable |
|---|---|---|---|---|
| L01 | 68 lessons | 6 | 1 | 6 questions rewritten, 8 reordered |
| L02 | 68 | 4 | 2 | 14 pages trimmed, 5 rewritten + 9 rebalanced questions, 32 reordered |
| L03 | 68 | 2 | 0 | existentialism quiz re-pointed (4 of 5 pointed at wrong pages), 107 answers rebalanced |
| L04 | 68 | 1 | 2 | 8 questions fixed (incl. first-aid snoring distractor) |
| L05 | 68 | 3 | 2 | 35 rewritten so the answer isn't the longest, 47 reordered |
| L06 | 67 | 3 | 1 | 18 questions touched, 1 level changed |
| L07 | 66 | 6 | 4 | 47 rewritten (≈22 trivia → takeaway), ≈70 reordered |
| L08 | 65 | 1 | 1 | 103 questions rebalanced, 19 pages trimmed |
| L09 | 65 | 4 | 1 | 3 rewritten, 26 rebalanced, 13 reordered |
| L10 | 65 | 3 | 1 | 4 rewritten, 27 reordered |
| L11 | 67 | 4 | 2 | sleep quiz rebuilt, 51 questions touched |
| L12 | 67 | 6 | 0 | ≈50 pages trimmed, 43 reordered |
| Quotes | 197 | 7 | 2 | 29 translator/source labels added or fixed; 0 fakes found |
| Words (V1+V2) | 1,000 | 38 | 3 | IPA moved to British/Australian forms; antonyms that made wrong quiz questions fixed |
| Arena (K1+K2) | 1,233 | 5 | 4 | 2 ambiguous puzzles replaced, 1 duplicate puzzle replaced |
| Inner Circle | 238 | 6 | 3 | 2 riddles that were silently filtered out are shown again |
| Scroll | 2,998 | 8 | 2 | Lifeline added to R U OK? card |

Answer spread A/B/C/D: 23/32/26/19% before, 24/21/29/26% after.

### Factual corrections (with sources)
- superannuation: Division 296 tax on earnings above $3m from 1 July 2026 (https://www.csc.gov.au/advisers/news/2026-05-better-targeted-super-concessions)
- tax-basics: CGT discount replaced by indexation for gains from 1 July 2027; $1,000 standard work-expense deduction from 2026-27 (https://treasury.gov.au/policy-topics/taxation/budget2026-27, https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/deductions-you-can-claim/work-related-deductions/standard-deduction-for-work-related-expenses)
- reading-your-payslip: super guarantee 12%; Payday Super from 1 July 2026 (https://www.fairwork.gov.au/newsroom/news/payday-super-new-rules-starting-1-july-2026)
- stock-market: insider trading maximum 15 years, not 10 (https://asic.gov.au/about-asic/news-centre/find-a-media-release/2025-releases/25-163mr-charges-laid-in-platinum-asset-management-insider-trading-case/)
- retirement: intend to retire ~65, retirees as a whole stopped ~57 (https://www.abs.gov.au/statistics/labour/employment-and-unemployment/retirement-and-retirement-intentions-australia/2022-23)
- home-fire-safety: Queensland interconnected photoelectric alarms required from 1 Jan 2027 (https://www.qld.gov.au/emergency/safety/smoke-alarms)
- sleep: glymphatic clearance now presented as debated after a 2024 study (https://www.nature.com/articles/s41593-024-01638-y.pdf)
- wildlife: horses 74 deaths vs all venomous creatures 64 (2000-2013); bees/wasps = snakes (https://pursuit.unimelb.edu.au/articles/venomous-stings-and-bites-lie-close-to-home)
- renewable-energy: Snowy 2.0 more than $20 billion (https://thenightly.com.au/australia/snowy-hydro-20-cost-could-blows-out-to-25-billion-more-than-12-times-original-cost-of-2-billion-c-23060598)
- science-of-pain: one in five aged 45+ (https://www.aihw.gov.au/reports/chronic-disease/chronic-pain-in-australia/summary)
- heart-blood and Scroll: "100,000 km of blood vessels" debunked; capillaries ≈9,000-19,000 km (https://www.uniladtech.com/news/video-debunks-oldest-lie-on-the-internet-950228-20241030)
- bahai-faith: more than 200 executed or killed since 1979 (https://www.internationalaffairs.org.au/australianoutlook/unpacking-the-bahai-question-46-years-of-institutionalised-state-sponsored-persecution-against-the-bahais-in-iran/)
- manipulation-tactics: Tasmania's Family Violence Act 2004 offences; SA coercive control law passed (https://www.legislation.tas.gov.au/view/whole/html/asmade/act-2004-067, https://dhs.sa.gov.au/news/2025/sa-passes-coercive-control-laws)
- toilets-sewers: more than 3 billion lack safely managed sanitation (WHO/UNICEF)
- rockets: WRESAT made Australia the third nation to launch from its own territory (https://en.wikipedia.org/wiki/WRESAT)
- titanic-sinking: Carpathia about 100 km away (https://www.britannica.com/topic/Carpathia)
- kodak-disruption: peak workforce more than 140,000 (https://rbj.net/2012/01/27/rise-and-decline-an-eastman-kodak-chronology/)
- sun-safety: solariums banned 2015 (WA 2016) (https://www.cancer.org.au/about-us/policy-and-advocacy/prevention/uv-radiation/related-resources/solariums)
- population: fertility ~1.5 in 2024 (ABS 1.481)
- constitution-au: 1967 referendum wording aligned with referendum-1967
- the-dismissal-1975: Albert Field correctly described (https://en.wikipedia.org/wiki/Albert_Field)
- art-forgery: Gant and Siddique acquitted 2017 (https://www.supremecourt.vic.gov.au/news/judgment-handed-down-in-gant-and-siddique-v-the-queen)
- periodic-table: about half of heavy elements made slowly in giant stars (s-process)
- greek-heroes: Argos recognised Odysseus first, not only
- bayeux-tapestry: 2026-27 loan to the British Museum (https://www.gov.uk/government/news/bayeux-tapestry-to-go-on-display-at-the-british-museum-in-2026)
- power-of-doubling: chessboard arithmetic fixed
- patient-hm, gold-rush, telescopes, piltdown, nietzsche, language-origins, code-of-hammurabi: detail corrections (sources in batch reports)
- Quotes: Gandhi "Strength does not come from physical capacity" sourced to Young India 1920; Leonardo "Iron rusts" sourced to Codex Atlanticus; Stoic translators labelled (Hays, Long, Gummere, Basore, Oldfather, Higginson); Epicurus PD 27 restored to Hicks; Emerson, Gretzky, Sun Tzu re-attributed or labelled
- Arena: Equatorial Guinea capital → Ciudad de la Paz (Jan 2026 decree, https://www.africanews.com/2026/01/05/equatorial-guinea-relocates-capital/); Eiffel Tower height-in-heat claim corrected; Armstrong date for Australia
- Words: citation, scrappy (Australian senses), usury, watchdog, secular examples; 12 IPA vowels; fickle, fraught, combative, rift etymologies
- Scroll: Pisa lean date, Dhammapada wording, Maldives height, Longyearbyen polar night, NZ suffrage petition

### Human-verification list from CONTENT_OVERHAUL_LOG (closed)
- Equatorial Guinea capital: updated (see above). Bolivia: "Sucre" (bracket gave the answer away).
- Gandhi and Leonardo quotes: genuine, sources added. Stoic translator wording: labelled per translator.
- Super Guarantee (12%), AUSTRAC crypto-ATM $5,000 cap, property-investing tax rules, Artemis II (flew April 2026), Mars Sample Return (funding ended Jan 2026), UN city figures: checked, updated where needed.
- Wills (marriage revokes a will), cooling-off periods, smoke alarms (Qld 2027): checked, updated.
- First aid against ANZCOR: CPR, DRSABCD, choking (back blows then chest thrusts), burns, snakebite, FAST: consistent.
- Study attributions in the Practical and Facts Scroll sets: checked (2 by web, rest by reference knowledge); no errors found.

### Disclaimer mapping (added to engine.js)
LAW +14, MONEY +11, HEALTH +20, MIND +7, new SAFETY list +18 (from the batch reports).

## Verification pass
Six fresh verifiers re-checked 100% of changed lesson items (all reorders confirmed to point at the same correct option) and every factual change against sources.
Fixes: Tasmania 2004 Act wording, hiring-a-tradie option length, how-democracy Rome sentence restored, population "third billion around 1960" restored, climate-change renewables "more than 40%", bank-runs wording, earth-structure solar-wind definition restored, tax-basics distractor, cells stray comma.

## Audio needing re-recording (Wisebyte Go originals)
These four are withheld from the app until re-recorded; corrected scripts are in audio-kit/scripts/:
1. empires: Rapa Nui / Greenland sections were out of order; "James C. Scott" split mid-sentence; Carthage wording.
2. focus: Killingsworth & Gilbert finding misstated (pleasant daydreams made people no happier, not less happy).
3. aussie: "bottle shop is two syllables" (it's three); First Fleet "large number of Irish" (Irish transports began 1791).
4. fallacies: the word "whataboutism" dates from 1974-93, not the Cold War; the tactic is associated with it.
Optional: drift unit 146 ("a path that the word very has already travelled").
The narration splitter no longer breaks sentences at initials (the cause of the "James C." split).
Non-lesson verifier (quotes, words, Arena, Inner Circle, Scroll): ≈70 factual changes re-checked. Fixes: Marcus Aurelius "Be one" relabelled Staniforth; Epictetus Enchiridion 1 relabelled Elizabeth Carter, "No man is free" relabelled George Long; Zeno "two ears" marked adapted from Hicks; Gandhi "The weak can never forgive" sourced to Young India 2 Apr 1931; blood-vessel figure traced to August Krogh's 1920s estimate. Equatorial Guinea decree (2 Jan 2026) confirmed; constitution names no capital, so the decree stands. Inner Circle keep-list now matches all 12 riddles (the structure script now errors if it ever doesn't).

## Phase D results (courses, overlap, audio)
- Courses: order fixed in 5 courses (revolutions, explorers, disasters, evolution, investing); economics description fixed.
- 5 new courses from coherent groups of loose lessons: Empires, Trade and Nations; Plants, Soil and Ecosystems; Life Admin; AI in Everyday Life; Food That Shaped the World.
- 117 of 122 loose lessons placed in courses where they fit. Left out on purpose: film-editing-invisible-art, first-nations-astronomy, dia-de-muertos, napier-logarithms, calculus-without-fear.
- Duplicate questions fixed: optical-illusions q4, mental-models q2, investing-mistakes q0.
- Overlaps differentiated: brain p3 (now brain-training myth; Lumosity FTC 2016), power-of-doubling p2, ethics p4 (PhilPapers 2020), famous-experiments p2 (Robbers Cave), index-funds p3 (ETFs vs managed funds), sound p1, business-model p3, islamic-golden-age-philosophy p0 (the mihna), consumer-rights p4 (unsolicited sales rules), percentages p4, animal-intelligence p0 (Morgan's Canon).
- Audio: episodes regrouped (235). Psychology episode 2 now includes Cognitive dissonance, so its old recording was withdrawn automatically; it needs re-recording. Psychology episode 1 still matches and stays live.
- Narration: units and symbols (%, °C, km/h, km, kg, ×, =, +) now read in words; sentences no longer split at initials.

## Phase E results (code)
Independent code review of the native app, then fixes:
- Wisebyte Go settings, positions, downloads and history were read before device storage loaded, so they reset every launch: now loaded in init().
- Queued trips could stop with the phone locked: the audio session now stays active between episodes (keepAudioSessionActive) and the player is only paused when playing.
- The player could play or credit the wrong episode while another loaded: playback, seeking and progress now only act when the loaded file is the current episode in the current voice.
- Seeking before a file was ready (possible crash) is deferred until it loads; narrator preview waits for its file.
- Closing the player mid-load no longer starts audio; lock-screen controls activate once (repeated activation stacked headphone/car handlers so play/pause cancelled itself).
- Duplicate simultaneous downloads of one file are merged; files of the playing episode are never deleted under it.
- Replay after finishing starts from the beginning and clears "Finished".
- Episodes missing one narrator's timings no longer crash the transcript or chapters.
- Live updates pause while the app is in the background; progress saves every 5 seconds.
- Audio now stored in Caches (not iCloud-backed-up Documents), per Apple's storage guidelines; missing files are detected at launch.
- Toasts show over the full-screen player.
- Inner Circle lessons heard on audio now appear in Review.
- Scroll drops a covered lesson's teaching-point cards immediately, not just on the next deck refill.
- Daily hint refresh runs one at a time (no duplicate notifications) and re-runs after cloud sync or reset.
- Known, left as is: on two devices, each may plan a different lesson of the day for the same date (minor); "Reset all progress" is undone by the next cloud sync when signed in (merge only adds; pre-existing behaviour).
Build: iOS JavaScript bundle exports cleanly; web copy screenshots checked for every main screen.

## Phase F results (App Store readiness)
- Privacy policy: adds audio downloads (file host sees IP address only), on-device listening history, locally scheduled notifications; account deletion path updated to the top-right account menu. Dated 4 November 2026.
- Terms: progress backup wording and account deletion path updated. Support: progress backup and offline listening answers.
- Paywall lists Wisebyte Go and Scroll; terms, privacy and restore links present; no content counts.
- expo-audio microphone permission removed; background audio mode declared (UIBackgroundModes audio) for Wisebyte Go.
- Disclaimers now cover 70 more money, law, health, mind and safety lessons, including audio episodes (the player shows the first matching disclaimer).
- Note: the policy pages are served from wisebyte.app; publish the updated privacy.html, terms.html and support.html there.

## Final checks
- Structure script: 0 errors. Warnings (6), all deliberate: 5 lessons left outside courses (listed in Phase D); 1 "color" inside the dictionary-makers lesson, a deliberate example of Webster's American spelling.
- All content files pass `node --check`; extract-content.js and build-audio.js run cleanly; the iOS bundle exports.

## Decisions for Jacob
1. Equatorial Guinea's capital is now Ciudad de la Paz (2 Jan 2026 decree; the constitution names no capital). Revert to Malabo if you'd rather wait until the move is finished.
2. Re-record: Wisebyte Go "How to Argue Well" and "Why Empires Fall" (corrected scripts ready; both held back until then) and Psychology episode 2 (regrouped). Focus and Aussie English were re-recorded today.
3. Some courses are now long (Safety 23, Universe 21, Human Body 20). Safety could split into "First Aid" and "Staying Safe".
4. Tax, super and property lessons now reflect the 2026 laws; they need a yearly check each July.
5. Publish the updated privacy, terms and support pages to wisebyte.app.
6. Optional: drop the 37 easy children's riddles that are filtered out of the Inner Circle; swap the classic gotcha puzzles (Mary's father, 17 sheep) for pure-reasoning ones; one Seneca line uses a popular modern rendering ("an opportunity for a kindness") instead of a standard translation.
