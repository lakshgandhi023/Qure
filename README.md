# Qure recreation

Plain HTML, CSS and JavaScript. Open dist/index.html, or serve the dist folder using any static web server. For location and voice input use HTTPS or localhost. Deploy dist to Vercel without a build command.

Based on the six supplied screenshots. The original site was initially blocked by network restrictions, then became reachable. Its homepage, map and API portal were inspected. Original font and squiggles background are included. Exact original backend behavior could not be recovered. The original repository, backend and provider credentials were not recovered.

Included: homepage sections, responsive layout, five navigation routes, interactive Leaflet/OpenStreetMap map, Overpass hospital search with radius and geolocation, directions and available phone links, chat persistence and JSON export, voice input where browser-supported, symptom chips/history/export, emergency guidance, configurable AI endpoint and connection test.

AI: open API settings, supply your own OpenAI-compatible chat-completions endpoint and model. A server-side proxy is recommended for published sites so provider credentials stay on your server. Optional bearer tokens here are tab-session only. No AI credentials are bundled. Requests are made only after user submission. AI and maps require internet. Cloud sync and full offline service are not implemented; homepage text was preserved from the reference, while API settings explain the actual behavior.

The API endpoint must accept POST JSON {model,messages}, permit browser requests, and return choices[0].message.content, reply, or response. History is localStorage under qure-chat and qure-symptoms. No remote health-data database is included. General AI results are intentionally not automatically labelled low risk.

Validation: node --check passed. Browser visual and live map/API checks could not complete because this environment blocked local preview networking. No real API credentials were available for an end-to-end AI test.


## Local Gemini connection

1. Open .env and paste your key after GEMINI_API_KEY=; save it. Do not share this file.
2. Keep the Google AI Studio project on Free Tier with billing disabled. This app cannot verify your billing tier.
3. Double-click Start-Qure.cmd (Node.js 20+ required) and visit http://127.0.0.1:4173/#/settings.
4. Click Test Connection. Chat and symptom analysis now use the same local server.

The server serves only dist; .env is outside that directory and ignored by Git. Keys are not included in downloads. Server uses gemini-3.1-flash-lite only, caps output to 1200 tokens, and never retries with another model. Quota and service errors are shown without leaking provider response details. Free-tier Google content may be used for product improvement; use fictional examples. This local server binds to this computer only and is not a public production server.
