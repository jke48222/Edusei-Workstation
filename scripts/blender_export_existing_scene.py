"""
Blender script: Export existing scene to GLB format.
Run: blender your_scene.blend --background --python scripts/blender_export_existing_scene.py

This script exports your existing Blender scene (with camera, lights, animation) to GLB format
for use in the web app. It preserves:
- Camera settings
- Lights
- Materials
- Animations (keyframes)
- All objects in the scene
"""

import bpy  # type: ignore[import-untyped]  # provided by Blender at runtime
import sys
import os

def get_script_dir():
    """Find the script directory."""
    if "__file__" in dir():
        return os.path.dirname(os.path.abspath(__file__))
    else:
        script_dir = os.getcwd()
        for i, arg in enumerate(sys.argv):
            if arg.endswith(".py"):
                script_dir = os.path.dirname(os.path.abspath(arg))
                break
        return script_dir

def main():
    """Export the current Blender scene to GLB."""
    # Get project paths
    script_dir = get_script_dir()
    project_root = os.path.dirname(script_dir)
    out_path = os.path.join(project_root, "public", "models", "jaleneduseiwhite.glb")
    
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    
    # Ensure we're exporting everything
    scene = bpy.context.scene
    
    # Print scene info for debugging
    print(f"Scene: {scene.name}")
    print(f"Frame range: {scene.frame_start} to {scene.frame_end}")
    print(f"Objects in scene: {len(scene.objects)}")
    
    # List cameras
    cameras = [obj for obj in scene.objects if obj.type == 'CAMERA']
    print(f"Cameras found: {len(cameras)}")
    for cam in cameras:
        print(f"  - {cam.name} at {cam.location}")
    
    # List lights
    lights = [obj for obj in scene.objects if obj.type == 'LIGHT']
    print(f"Lights found: {len(lights)}")
    for light in lights:
        print(f"  - {light.name} ({light.data.type})")
    
    # Export GLB with all settings
    print(f"\nExporting to: {out_path}")
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_animations=True,  # Include all animations/keyframes
        export_cameras=True,      # Include camera
        export_lights=True,        # Include lights (if supported)
        export_draco_mesh_compression_enable=False,  # Disable Draco to avoid warnings
    )
    
    print(f"\n✓ Successfully exported GLB: {out_path}")
    print(f"  File size: {os.path.getsize(out_path) / 1024:.2f} KB")

if __name__ == "__main__":
    main()
