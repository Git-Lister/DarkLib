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
