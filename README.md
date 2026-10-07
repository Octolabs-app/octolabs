# Octolabs

Octolabs makes browser games for friends and family. The homepage currently features OctoQuiz only.

## Local preview

Run `python -m http.server 8080` from the repository root and open http://localhost:8080.

## Architecture and deployment

Dependency-free static HTML, CSS, and SVG. No build step, secrets, environment variables, database, or authentication are required for this homepage.

Cloudflare Pages project `octolabs` connects to `Octolabs-app/octolabs`. Production branch: `main`. Root and output directory: repository root. Branch pushes produce previews; merging to main publishes to octolabs.app and www.octolabs.app.

Before publishing, check desktop/mobile layout, keyboard focus, local asset responses, and the OctoQuiz links. After publishing, verify the homepage and assets on the public domain. Roll back by reverting the release commit on main.

OctoQuiz is maintained separately in `Octolabs-app/octoquiz`. Its live domain is https://octoquiz.octolabs.app and is routed to the `octoquiz` Cloudflare Worker. The older Pages project exists too; it is not the current room runtime.

## Brand

The mark is a geometric number 8, replacing the octopus. Forest green #254f38, lime #d9ee88, warm paper #f5f1e8, lilac and peach accents. Use bold, clear typography and game-piece shapes. Keep the site lightweight, readable, and welcoming.

Other products are no longer promoted on this homepage. Their infrastructure and repositories have not been deleted. There were no separate public subpages in this repository to remove.

## Next game

Discuss an original French/English letters-and-numbers family game before implementation. Decide round structure, player count, room flow, dictionary rules, scoring, and host recovery. Give it an original name and visual identity. No unreleased game is advertised as playable.
