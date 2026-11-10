# DarkLib Requirements

## Scope
Build a browser-based instructional escape game from the ground up. No borrowed game engines. Three.js map shell, HTML overlay UI, serverless event reporting.

## Player Experience
- Typewriter intro (video deferred to later polish).
- Orthographic model-village campus map with a player character.
- Player moves between campus nodes along paths. Ground is flat at y=0.
- Buildings are either single-puzzle nodes or interior nodes. The Library interior is the first true interior.
- Interior navigation uses room volumes and door portal triggers with fade transitions.
- Lives system: max 3, initial 3. Penalty default false. Only puzzles marked `penalty: true` decrement lives. At 0 lives, show game-over overlay with retry; retry restores lives and reopens current puzzle, keeps solved puzzles.
- Wrong answers with no penalty show campaign-provided funny failure text.
- Staff can administer puzzles via YAML without touching engine code.

## Technical Requirements
- Mobile-first: touch and mouse input parity. Pixel ratio ≤1.5, no MSAA, textures ≤1024px, InstancedMesh for repeats, no real-time shadows initially.
- Orthographic click-picking must be verified with a minimal cube test before full map.
- Flat ground plane with box colliders around buildings. No heightmap.
- Scene transitions fade 300ms; dispose old geometries/materials/textures.
- Event reporting: client posts events to a serverless endpoint; staff dashboard polls every 10s; shared token auth; no Google login; no local server required; no admin rights required on work laptop.
- Database must not pause on inactivity. Use Turso or Neon via serverless function. Supabase only with keep-alive cron.
- Four-file contract: REQUIREMENTS, ARCHITECTURE, AESTHETIC-SPEC, CHANGESET.

## First Tranche (Vertical Slice)
- Repo scaffold.
- Typewriter intro → map load.
- Flat outdoor map with Library node and one single-puzzle building node.
- Player movement and node arrival.
- One puzzle modal with correct/wrong validation.
- Lives overlay with livesChanged event.
- RemoteReporter posting `puzzleSolved` to serverless endpoint.
- Staff dashboard polling and displaying events.