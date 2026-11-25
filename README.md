# Grimoire Years: multiplayer server

A tiny server (no installs needed, just Node.js 16+) that serves the game and lets players in
different places find each other. Everyone opens the same web address and plays.

## Option 1: Free hosting (best for long-distance friends)
Any host that runs Node works. With Render (render.com, free):
1. Put these four files in a GitHub repo: `server.js`, `index.html`, `package.json`, `README.md`.
2. On Render: New > Web Service > pick the repo. Runtime: Node. Build command: (leave empty).
   Start command: `node server.js`. Pick the free plan.
3. Render gives you a link like `https://something.onrender.com`. Send that link to your friends.
   (Free plans fall asleep when idle: the first load can take about a minute.)

## Option 2: Run it on your own computer
1. Install Node.js (nodejs.org).
2. In this folder run: `node server.js`
3. Open http://localhost:3000. To let friends in, share it with a tunnel such as
   `cloudflared tunnel --url http://localhost:3000` or `ngrok http 3000`, and send them that link.

## Playing
- Everyone opens the link and taps **Multiplayer** on the slots screen.
- The host names a room; friends pick it from the list. Choose "New game together" or "Meet".
- Saves stay in each person's own browser (use the same device/browser to continue).
- The server keeps nothing; if it restarts, players just reopen the room.
