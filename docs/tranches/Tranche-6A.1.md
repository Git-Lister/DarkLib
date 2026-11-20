# TRANCHE 6A.1 — MCP Setup & Code-Driven Asset Baseline

## Goal
Establish the automated asset pipeline. Configure OpenCode to use the Blender MCP server, and integrate a parametric Python script that generates `.glb` assets headlessly via the command line. Finally, update the game engine to load and render these `.glb` assets instead of primitive geometries.

## Read first
- `docs/ARCHITECTURE.md`
- `docs/AESTHETIC-SPEC.md`
- `docs/WORKFLOW.md`

## 1. MCP Configuration
- Create an `opencode.json` file in the project root.
- Configure it to launch the `uvx blender-mcp` server. 
- Example configuration:
  ```json
  {
    "$schema": "https://opencode.ai/config.json",
    "mcp": {
      "blender": {
        "type": "local",
        "command": ["uvx", "blender-mcp"],
        "enabled": true
      }
    }
  }
2. The Asset Generation Scripts (PROVIDED)
DO NOT rewrite these scripts from scratch. Use the exact implementations below.

tools/generate_assets.py
python
import bpy
import sys
import os
import math

# Get the output directory from command line arguments (after the --)
argv = sys.argv
argv = argv[argv.index("--") + 1:] if "--" in argv else []
output_dir = argv[0] if argv else "public/assets/blender"

# Ensure absolute path
output_dir = os.path.abspath(output_dir)
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

def clear_scene():
    """Clears the default Blender scene."""
    bpy.ops.wm.read_factory_settings(use_empty=True)

def apply_flat_shading(obj):
    """Applies flat shading to the object."""
    for poly in obj.data.polygons:
        poly.use_smooth = False

def create_tree():
    """Creates a low-poly Model Railway Tree."""
    # Trunk
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.1, depth=1.0, location=(0, 0, 0.5))
    trunk = bpy.context.active_object
    trunk.name = "Tree_Trunk"
    
    # Canopy
    bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.6, radius2=0.0, depth=1.5, location=(0, 0, 1.75))
    canopy = bpy.context.active_object
    canopy.name = "Tree_Canopy"
    
    # Join them
    bpy.ops.object.select_all(action='DESELECT')
    trunk.select_set(True)
    canopy.select_set(True)
    bpy.context.view_layer.objects.active = trunk
    bpy.ops.object.join()
    
    tree = bpy.context.active_object
    tree.name = "Tree"
    apply_flat_shading(tree)
    
    # Export
    export_path = os.path.join(output_dir, "tree.glb")
    bpy.ops.export_scene.gltf(filepath=export_path, export_format='GLB')
    print(f"Exported: {export_path}")

def create_library():
    """Creates a low-poly Library Building."""
    # Main block
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 1.5))
    main_block = bpy.context.active_object
    main_block.scale = (4.0, 6.0, 3.0)
    main_block.name = "Library_Main"
    
    # Roof (Prism)
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=4.0, radius2=0.0, depth=1.5, location=(0, 0, 3.75))
    roof = bpy.context.active_object
    roof.scale = (1.0, 1.5, 1.0)
    roof.rotation_euler[2] = math.radians(45) # rotate to align with square base
    roof.name = "Library_Roof"
    
    # Join them
    bpy.ops.object.select_all(action='DESELECT')
    main_block.select_set(True)
    roof.select_set(True)
    bpy.context.view_layer.objects.active = main_block
    bpy.ops.object.join()
    
    lib = bpy.context.active_object
    lib.name = "Library"
    apply_flat_shading(lib)
    
    # Export
    export_path = os.path.join(output_dir, "library.glb")
    bpy.ops.export_scene.gltf(filepath=export_path, export_format='GLB')
    print(f"Exported: {export_path}")

if __name__ == "__main__":
    print("Starting headless asset generation...")
    clear_scene()
    create_tree()
    create_library()
    print("Asset generation complete.")
tools/generate_assets.js
javascript
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const outputDir = path.join(projectRoot, 'public', 'assets', 'blender');

let blenderCmd = 'blender'; // Default for native Linux/Mac

if (process.platform === 'win32' || process.env.WSL_DISTRO_NAME) {
    const possiblePaths = [
        'C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe',
        'C:\\Program Files\\Blender Foundation\\Blender 4.1\\blender.exe',
        'C:\\Program Files\\Blender Foundation\\Blender 4.0\\blender.exe',
        '/mnt/c/Program Files/Blender Foundation/Blender 4.2/blender.exe',
        '/mnt/c/Program Files/Blender Foundation/Blender 4.1/blender.exe',
        '/mnt/c/Program Files/Blender Foundation/Blender 4.0/blender.exe'
    ];

    let found = false;
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            blenderCmd = `"${p}"`;
            found = true;
            break;
        }
    }

    if (!found) {
        console.warn("⚠️ Could not find Blender.exe automatically. Falling back to 'blender'.");
    }
}

const pythonScript = path.join(__dirname, 'generate_assets.py');
const command = `${blenderCmd} -b -P "${pythonScript}" -- "${outputDir}"`;

console.log(`Running Blender from: ${blenderCmd}`);
console.log(`Executing: ${command}\n`);

try {
    execSync(command, { stdio: 'inherit' });
    console.log('\n✅ Asset generation successful.');
} catch (error) {
    console.error('\n❌ Asset generation failed.');
    process.exit(1);
}
package.json Update
Add the script to package.json:

json
"scripts": {
  "generate-assets": "node tools/generate_assets.js"
}
3. Game Engine Integration (YOUR TASK)
Now that the assets can be generated, update the game code to use them instead of primitives.

src/engine/map/AssetLoader.js:

Implement a GLTFLoader instance.

Create an async loadAsset(path) function that returns a Promise resolving to the loaded gltf.scene.

Implement a caching mechanism (a Map or object) so if we request tree.glb multiple times, it clones the cached scene rather than refetching.

src/engine/map/MapAssets.js:

Change createTreeMesh() to be async. Call AssetLoader.loadAsset('/assets/blender/tree.glb'). Scale it if necessary.

Change createBuildingMesh(color) to accept an assetPath parameter. If provided, load the model. If not, fall back to BoxGeometry.

src/engine/map/MapScene.js:

Change init() to async init(). Use await when creating trees and the library building.

Traverse the loaded .glb meshes and override their materials with the flat-shaded MeshLambertMaterial to ensure they match the aesthetic.

Ensure SceneManager properly waits for MapScene.init() to resolve.

4. Testing & Verification
OpenCode MUST run npm run test and npm run lint and append the verbatim output to docs/CHANGESET.md.

The user will manually run npm run generate-assets to create the .glb files.

The user will manually run npm run dev to visually verify the new 3D models appear in the game.

Out of Scope
No Toon shading or outlines yet (Tranche 6B).

No post-processing or audio (Tranche 6C).