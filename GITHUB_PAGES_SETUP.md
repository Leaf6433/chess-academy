# Publish Chess Academy through GitHub Pages

The website files and a deployment workflow are committed to the main branch. The only manual GitHub step is to **enable Pages with GitHub Actions** (the connected GitHub integration cannot change Pages settings).

1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Open **Actions → Publish Chess Academy**, and choose **Run workflow** if a deployment has not started automatically. It may be necessary to retry the initial run after enabling Pages.
4. Once the deployment is successful, open **https://leaf6433.github.io/chess-academy/**.

The site is static and uses the **Lite** Stockfish.js WebAssembly worker, which works on GitHub Pages without cross-origin isolation headers. The more demanding Full engine requires a host that supports COOP/COEP headers and is intentionally not part of this Pages deployment.

## Verify publication

- The main menu loads, without browser-console 404 errors for the scripts or styles.
- Open **Play Stockfish** or **Analyze games** and check that Stockfish initializes and returns a legal move.
- Complete a lesson and refresh the page to confirm local progress is retained.
- Back up progress in **Settings → Export progress**. Cloud sync/accounts are not configured.

GitHub Pages may take a few minutes to make an updated deployment visible after Actions reports success. The published site and local ZIP share the same learning data.

## Re-publishing after enabling Pages

Any new commit to `main` starts the `Publish Chess Academy` workflow. In **Actions**, open the newest run to confirm that its **Publish** step succeeds. If GitHub reports a Pages configuration or permissions problem, review **Settings → Pages** and the workflow run logs before retrying.
