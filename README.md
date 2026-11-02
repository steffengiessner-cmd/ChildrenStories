# Storyburrow
A parent-facing English story studio. Choose daytime or bedtime, mood, age band, estimated reading time and a story seed. Optionally add a three-panel emoji retelling game. After reading, open “Your turn to tell it” to see the pictures. Each picture has its own hidden hint. The built-in short sample works without AI.

## Try it
Run `python3 -m http.server 8000 --bind 127.0.0.1` in this directory and open http://localhost:8000 in desktop Chrome. The static files can also be served over HTTPS, including on GitHub Pages. No dependencies, accounts or API keys are required. The first generation can download a device-local language model. Device and browser support vary. See [Chrome Prompt API requirements](https://developer.chrome.com/docs/ai/prompt-api).

Reading time is estimated at 115 words per minute. Output length varies. Stories are held in the page until you reload. Review generated text before reading together.
