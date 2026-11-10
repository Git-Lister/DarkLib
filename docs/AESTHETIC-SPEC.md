# DarkLib Aesthetic Specification

## Purpose
This document is binding for all visual and technical rendering decisions. DarkLib uses modern browser technology. It does not emulate outdated hardware. The aesthetic is a deliberate visual treatment: clean low-poly geometry, flat shading, limited palette, orthographic model-village camera, and institutional 1970s/80s broadcast-drama atmosphere. No forced pixelation. No PS1-style texture warping. No PBR.

## Rendering Stack
- Three.js with WebGL2.
- Materials: `MeshToonMaterial` with a 3-step gradient map, or `MeshLambertMaterial` with `flatShading: true`. Do not use `MeshStandardMaterial` unless explicitly approved.
- Lighting: one directional light + low ambient. Interior: 2–4 point lights with muted green-yellow tint. No real-time shadows on mobile initially. Bake simple AO into vertex colours or textures if needed.
- Outline: inverted-hull outline on key buildings and props only. Use a back-side material scaled ~1.02. Do not outline every object.
- Camera: `OrthographicCamera`, tilted 15–20 degrees from top-down. Interior uses the same orthographic 3/4 view for consistency.

## Palette
- Exterior night: cold blue-grey sky, muted brown/grey concrete, nicotine-yellow lit windows.
- Interior: institutional brown carpet, off-white walls, dull green accents, flickering fluorescent yellow-green.
- UI: limited palette; monospace typewriter text; simple rectangular modal frames.

## Geometry and Textures
- Buildings: extruded footprints from campus map, flat-shaded, 500–3000 triangles per building.
- Props: 50–500 triangles. Model railway tree: 3–4 polygons, brown trunk, flat green canopy.
- Textures: 512–1024px, linear filtering by default. Do not use nearest-filter unless a specific asset is deliberately pixelated.
- Repeated geometry (windows, trees) must use `InstancedMesh` or merged static geometry.

## Animation and Post-Processing
- No expensive post-processing on mobile. Film grain optional on desktop only.
- Fade transitions: 300ms black overlay for scene swaps.
- Typewriter intro: HTML overlay, monospace, character interval, skip on click/key.

## Audio
- Web Audio API synth stings and tape hiss. Mono or narrow stereo. No external audio files required initially.

## Blender Export Preset
- No subdivision surfaces.
- Flat shading.
- Embedded textures.
- Export as `.glb`.
- Apply transforms; origin at base centre.