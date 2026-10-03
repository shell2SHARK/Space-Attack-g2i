# Space Attack

A standalone browser arcade shooter with procedural neon ships, a starfield, enemy waves, and hull health. No packages, downloaded assets, or network connection are required.

Open `index.html` directly in a modern desktop browser. Alternatively, run `python -m http.server 8765` in this folder and open http://localhost:8765.

- **A/D / Left and Right arrows:** move horizontally along the bottom. Vertical keys have no effect.
- **Hold Space:** fire (one shot every 0.15 seconds).
- **Enter:** start, resume, or restart. The visible button performs the same action.
- **P:** pause/resume. Leaving the window automatically pauses and clears input.
- **M / SOUND ON-OFF button:** mute or enable effects. The setting survives restart.

Destroy enemies for 100 points each. Enemy shots and ship contact cause 20 hull damage, followed by 1.1 seconds of invulnerability. Five separated hits end the mission. Clearing a stage restores hull health to 100% when the next stage begins; score is preserved. Survivor returns and pause/resume do not refill hull, and game over cannot trigger a pending refill. Destroy every enemy to clear a stage. The upper fleet waits in formation and launches individual sine-wave dives after 1.3 seconds, then at 0.85-second intervals with at most three active divers. Every surviving slot receives turns in round-robin order. Divers fire aimed straight projectiles and return to their original formation slot if they survive the descent; returns give no score and never clear a stage. Dive speed is 100 + 12 × stage pixels/second, increasing every stage without a cap. Enemy count increases from 9 to 24; base firing interval decreases from 1.61 to 0.45 seconds. Restart resets the mission to wave 1, zero points, and 100% hull.

Desktop keyboard play is supported. There is no touch interface. Short procedural effects distinguish player shots, hull damage, enemy shots, and enemy destruction. Sound unlocks on a start/resume/restart or sound-toggle gesture; unsupported or blocked audio leaves gameplay working silently. Pause, mute and game over immediately stop active effects (including the lethal hit). No music or external audio assets are used. The game uses one animation loop, caps frame deltas at 40ms, removes spent entities, and caps rendering pixel density at 2×.


