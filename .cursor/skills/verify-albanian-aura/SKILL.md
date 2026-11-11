# Verify AlbanianAura
Albania Tourist Map - mission-control styled interactive map experience.
## Launch
Static; serve repo root over HTTP.
## Doctor
`python3 .cursor/skills/verify-albanian-aura/verify.py`
## Drive
Runs `npx vitest run` (37 unit tests) then the playwright e2e specs on the chromium project (mission control simulation, user journey). Dev server port overridable via PW_PORT/PW_BASE_URL; skill uses 8181.
## Evidence
`.cursor/skills/verify-albanian-aura/evidence.json`
## Cleanup
Playwright manages its webServer.
## Known boundaries
firefox/webkit projects are configured but need their browsers installed; only chromium is exercised here.
