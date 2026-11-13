# Chess Academy 2.0 — Mastery Course

## Official Neo piece assets

With the site owner's confirmation of permission to use the Chess.com Neo artwork, the board renderer uses Chess.com's **original Neo PNG assets** at `https://assets-themes.chess.com/image/ejgfv/150/{piece}.png`, with filenames `wk,wq,wr,wb,wn,wp,bk,bq,br,bb,bn,bp`. These apply to **all interactive boards** and the course/continuation previews.

- The primary pieces are loaded from Chess.com's asset CDN while online; this means the exact Neo artwork currently has an **external network dependency**. If the image URL is unavailable, an alternative Chess.com image endpoint is attempted and then the Academy's cached vector fallback is shown.
- The old `assets/pieces.svg` remains solely as the offline/unavailable-CDN fallback; it is not the official Neo artwork.
- The chess rules, board layout, accounts, and existing browser progress data are unchanged.
- Test that `wk.png` and `bk.png` appear correctly in a browser after the latest GitHub Pages deployment. Headless DOM tests verify URL wiring, but cannot guarantee third-party CDN accessibility in each browser.

## Full-length lessons and independent mastery — November 13, 2026

All **40 lessons** now feature three expanded theory sections (120 new teaching sections), three reflective practice prompts with revealable answers, a lesson-specific common mistake, two interactive board demonstrations (the original model and a distinct new position), and an estimated **25-minute suggested study route**: 5 minutes for the core explanation, 9 for deeper instruction, 6 for the boards and 5 for recall/guided practice. This is a **suggested pace**, not a timer or a guarantee of exact reading duration.

- Existing **121 guided practice exercises** remain available with hints and feedback.
- Each lesson now has a **different five-item mastery check**: four new scenario questions and one new interactive board challenge. A learner must get at least four correct **and** solve the board challenge to pass. The 200 mastery items use distinct IDs and are not copied from guided practice; the 40 move challenges are legal and separately validated.
- The optional placement assessment keeps its original questions and scope.
- The Stockfish evaluation bar appears in lesson study, opening exploration and game review, but remains hidden during mastery checks, placement, puzzles and recall drills.
- Automated regression checks visit all 40 lessons, verify the extended content and both board examples, answer all 40 independent mastery assessments, and check results and evaluation privacy. Separate account and Stockfish integration tests remain.

## Release polish — November 13, 2026

This release focuses on learning continuity and reliability:

- **Learn → Practice → Master:** Every lesson has a guided example board, key takeaways, a quick notation guide, a clearly presented practice plan, and links into its own exercises. After each solved position, a learner can proceed to the next unsolved question or return to the lesson overview. When a lesson's practice is finished, the mastery check is the natural next step.
- **New board pieces:** Chess Academy uses the official Chess.com Neo artwork, with a cached custom SVG fallback if the external official PNG cannot be loaded.
- **Accounts:** Auth uses the configured Supabase project. A device may resume automatic sync after its owner has explicitly selected a progress copy once and the local data matches the last known sync. Local or cloud divergence requires an explicit choice; local data is never silently discarded.
- **Better user-facing status:** Header, footer, and settings describe account sync accurately, rather than claiming there is no cloud functionality.
- **Offline updates:** HTML, JavaScript, and CSS load from the network first when available, falling back to the cached copy while offline. Assets and service worker are release-versioned.
- **Regression gates:** Website smoke tests, account lifecycle and persistent account sync must succeed before GitHub Pages publishes. Stockfish UCI is tested independently and reported but does not block deployment if the command-line environment has a problem. The first three can also be simulated without a browser; live browser and GitHub Pages health are still independent checks.

**Launch verification:** GitHub Actions must show a green **Publish Chess Academy** run. Afterward reload the published site, confirm the revised pieces, open a lesson and complete a practice question, test Stockfish from Settings, and verify signed-in cloud progress with a backup. Do not clear browser site data.

An offline-capable chess-learning website with a dark-green interface, 40 lessons, 121 practice exercises, placement assessment, strict lesson mastery, spaced reviews, 10 opening examples and recall drills, PGN game import, mistake journal, Stockfish analysis, and computer play.

## Start on Windows

1. Extract **the entire ZIP**, keeping the `engine` folder with the app.
2. Install Python 3 if it isn't already installed (`python.org/downloads`).
3. Double-click `start-server.bat` in the extracted folder.
4. Open **http://localhost:8765** in Chrome, Edge, or Firefox. Keep the command window running while using the app. Exit with Ctrl+C.

## Start on macOS / Linux

From this folder run `python3 server.py`, then open **http://localhost:8765**. Or run `./start-server.sh`.

Opening `index.html` directly with a `file://` URL will often block WebAssembly engine workers. Start with the local server instead. If port 8765 is already in use, set `PORT` to another port and then use that port in the URL.

## Website hosting

Serve all the files over HTTPS. **Lite Stockfish** runs without special isolation headers. To use **Full Stockfish**, configure `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` (plus correct `application/wasm` MIME type). Included `_headers` and `netlify.toml` support hosts that accept those formats. GitHub Pages doesn't support custom headers, so use Lite there.

## Learning workflow

1. Start with the optional **27-question placement assessment**. This is a diagnostic, not an Elo rating.
2. Open **Curriculum**. Study the model position and explanations, then practice the lesson.
3. Pass the **unassisted mastery check** (at least 80%, and any board-move questions must all be correct) to unlock the next lesson. You can review completed lessons freely.
4. Train **Due Reviews** or specific tactical/opening/endgame topics.
5. In **Opening laboratory**, compare lines, shortlist candidates, and use **Practice from memory** for an unguided replay. Computer replies in recall drills follow the selected model line; they are not Stockfish's independent choice.
6. In **Analyze games**, paste or upload a standard PGN, play through it, and use **Review game** to identify substantial engine-evaluation drops (the first 40 half-moves in this version). Save positions into your mistake journal and revisit them in Practice.
7. Use **Play Stockfish** for practice against the Lite engine. Shallow search settings vary difficulty, but are not calibrated Elo ratings.

## Progress and privacy

Progress is first stored in this browser's localStorage. Optional Supabase account sync is available after signing in and explicitly choosing which progress copy to use; the system detects conflicting local and cloud changes before replacing data. You can export a JSON backup in Settings. Clearing browser data may erase unsynced progress, so keep a backup even if you use cloud sync.

## About Stockfish

- The **Lite single-threaded** engine is approximately 1.8 MB and is the default for lessons, quick analysis, and practice games.
- The **Full multithreaded** engine is approximately 99 MB and is optional for deep analysis; it uses substantially more memory/CPU. On modest hardware use Lite.
- Stockfish itself outputs chess evaluations and variations, **not reliable natural-language coaching**. The site's short explanations are authored or heuristic and should be treated as learning aids; evaluate critical conclusions against the displayed line.
- Analysis quality and move labels depend on the requested depth/time. They are approximations, not objective labels for a player's ability.

## What's included and not included

**Included:** functional move-legality engine, progression and retry tests, opening practice, PGN mainline importer, local engine connection, sourced course content, backup/export tools, coursebook PDF and source notices. **Not yet included:** additional cloud login/synchronization, personalized natural-language AI tutor, all-variations PGN support, a complete real-time opening statistics database, or an unlimited auto-generated curriculum.

## Visual teaching and placement progress (November 2026 update)

- Placement questions that include a legal numbered opening sequence now display a replayable board. Use **Start**, **Back**, **Next**, **End**, or click a move to inspect the supplied position without revealing the answer. Board-action questions retain their interactive answer board and provide a collapsed setup replay where available.
- Lesson demonstrations support **Back / Next move / Restart**, clickable move-history replay, and destination highlighting. Explanations for the next guided move appear alongside the board. This is step-based playback, not timed animation or an arrow-drawing interface.
- Placement credit and lesson progress are different: credit acknowledges existing knowledge; **Studied** means the learner advanced into practice; **Completed** means every practice question was solved; **Mastered** means the unassisted mastery check was passed. Credited lessons remain accessible for review.
- Existing local backups load without throwing away placement results. Legacy versions recorded opening a lesson as `studied`; this update migrates those old timestamps into `opened` rather than claiming practice occurred.
- Browser-local progress still needs regular export. Accounts and cross-device synchronization are **not implemented**, and the website does not ask you for credentials.

The GitHub Pages deployment workflow now runs the headless website smoke test and the Stockfish UCI-wrapper integration test before publishing. These tests cannot substitute for live browser testing of WebAssembly, interactions, mobile layout, or persistence.

## Foundation-first update and modern chess pieces — November 12, 2026

- Added a **Foundation Training** panel on the dashboard and a dedicated practice filter. It contains **14 original beginner drills**, including playable positions reconstructed from anonymized game records. Topics include avoiding queen blunders, checking king captures, king safety, and passed pawn threats.
- Foundation practice is **additional reinforcement**, not a replacement for the 40 original lessons or the 121 authored course exercises. It does not automatically award mastery.
- The course now recommends the **first lesson not passed for mastery**, even if placement awarded credit, for learners who want to reinforce fundamentals.
- The progress screen and dashboard now distinguish passed mastery checks from placement credit.
- All chessboards use a consistent set of **12 original vector-piece symbols** in `assets/pieces.svg`, with classic Staunton-inspired silhouettes, modern rounded shapes, cream white pieces, and dark black pieces. The design takes broad visual inspiration from modern web chess boards but **does not copy Chess.com's proprietary artwork**.
- The offline service-worker cache includes the new SVG asset and foundation exercise file.

**Accounts:** Browser account UI, Supabase Auth calls, local/cloud progress selection, sync conflict detection, schema, RLS policies, and tests are committed. **Not activated:** Supabase is not connected/configured; no real signup, signin, or online sync can succeed until a real project is provisioned and the public configuration is added. Local progress remains available. See [`supabase/README.md`](supabase/README.md) for setup, database ownership tests, and go-live checklist.

## Important limitations

- The course currently contains **40 authored lessons and 121 exercises** in seven domains. It is substantial but not a complete replacement for years of chess study; more content can be added to the `course-data-v2.js` catalogue.
- The placement assessment offers limited early-lesson credit, not a fully adaptive rearrangement of all modules.
- Unassisted lesson quizzes use the existing question bank (with answer order shuffled); reviewing them alone does not prove live-game transfer. Use unfamiliar games, opening recall, and spaced reviews as well.
- Game review currently evaluates up to 40 half-moves per import, rather than all game moves.

## Developer testing

`node tests/smoke.cjs` checks state, navigation, mastery, PGN import and opening drills.
`node tests/uci-wrapper.cjs` verifies the engine-service interface against the real Lite UCI engine. Full Stockfish was separately tested through its Node UCI CLI. Browser-specific testing is still recommended on your own device.

## License

See `THIRD_PARTY_NOTICES.md` and `LICENSE-GPL-3.0.txt` for Stockfish licensing.

## Lite package note
This ZIP intentionally excludes the 99 MB Full Stockfish engine. For full-mode engine analysis, use the separately provided **Full Stockfish** package instead. The Lite version includes all lessons and features, including analysis and game review; it only uses the smaller engine.

## Troubleshooting: old website after GitHub Pages deployment

If **Settings** still shows the old text “Cross-device sync can be added after hosting and account setup” without a **Chess Academy account** panel, the browser is loading an older cached version or the latest deployment did not succeed.

1. In GitHub **Actions → Publish Chess Academy**, confirm the latest run is green. Failed tests prevent deployment.
2. Reload the published page with `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (macOS).
3. If still stale in Chrome: DevTools (F12) → Application → Service Workers → **Unregister**, then reload the page. The new service worker uses network-first HTML/JS/CSS, and will automatically re-register.
4. **Do not click “Clear site data” or clear cookies/local storage.** Your original progress is stored in localStorage until cloud sync has been confirmed.
5. If needed, export a progress JSON backup from Settings first.

