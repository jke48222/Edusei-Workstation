"""
Blender script: Export animation as video with transparent background.
Run: blender your_scene.blend --background --python scripts/blender_export_video.py

This script renders your animation as a video with alpha channel (transparent background).
The output will be saved as a PNG sequence or MOV file with alpha channel.
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
    """Export animation as video with transparent background."""
    scene = bpy.context.scene
    
    # Print scene info
    print(f"Scene: {scene.name}")
    print(f"Frame range: {scene.frame_start} to {scene.frame_end}")
    print(f"Total frames: {scene.frame_end - scene.frame_start + 1}")
    
    # Set render settings for transparent background
    scene.render.film_transparent = True  # Enable transparent background
    scene.render.image_settings.file_format = 'PNG'  # PNG supports alpha
    scene.render.image_settings.color_mode = 'RGBA'  # Include alpha channel
    
    # Set render engine (Cycles or Eevee)
    # You can change this to 'BLENDER_EEVEE' if you prefer
    scene.render.engine = 'CYCLES'
    
    # Cycles: reduce samples for faster rendering (default is often 1024)
    if scene.cycles:
        scene.cycles.samples = 64  # Good balance of speed vs quality for web video
        # Disable denoising (fixes OpenImageDenoiser error)
        scene.cycles.use_denoising = False
        # Disable denoising in all view layers
        for view_layer in scene.view_layers:
            if hasattr(view_layer, 'cycles'):
                view_layer.cycles.use_denoising = False
            # Also check for denoising settings in view layer
            if hasattr(view_layer, 'use_denoising'):
                view_layer.use_denoising = False
    
    # Alternative: Use Eevee if Cycles denoising causes issues
    # scene.render.engine = 'BLENDER_EEVEE'
    
    # Set output path
    script_dir = get_script_dir()
    project_root = os.path.dirname(script_dir)
    output_dir = os.path.join(project_root, "public", "videos")
    os.makedirs(output_dir, exist_ok=True)
    
    # Option 1: Export as PNG sequence (recommended for transparency)
    # Blender uses #### for frame number placeholder, not %04d
    png_output = os.path.join(output_dir, "jalenedusei_animation_####.png")
    scene.render.filepath = png_output
    
    print(f"\nRendering PNG sequence with transparent background...")
    print(f"Output: {png_output}")
    print(f"Render engine: {scene.render.engine}")
    print(f"This may take a while depending on frame count and quality settings...")
    
    # Render animation
    try:
        bpy.ops.render.render(animation=True, write_still=True)
        print(f"\n✓ PNG sequence rendered successfully!")
        print(f"  Location: {output_dir}")
        print(f"  Format: PNG with alpha channel")
        print(f"\nNext steps:")
        print(f"  1. Use ffmpeg to combine PNGs into video:")
        print(f"     cd {output_dir}")
        print(f"     ffmpeg -i jalenedusei_animation_%04d.png -c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0 jalenedusei.webm")
        print(f"  2. Or use an online tool to convert PNG sequence to video with transparency")
    except RuntimeError as e:
        if "OpenImageDenoiser" in str(e):
            print(f"\n⚠ Denoising error detected. Trying with Eevee render engine instead...")
            scene.render.engine = 'BLENDER_EEVEE'
            # Eevee settings
            if scene.eevee:
                scene.eevee.taa_render_samples = 64  # Good quality
            print(f"Rendering with Eevee...")
            try:
                bpy.ops.render.render(animation=True, write_still=True)
                print(f"\n✓ PNG sequence rendered successfully with Eevee!")
                print(f"  Location: {output_dir}")
            except Exception as e2:
                print(f"\n✗ Render failed: {e2}")
                print(f"Try rendering manually in Blender UI with Film → Transparent enabled")
        else:
            print(f"\n✗ Render failed: {e}")
            raise

if __name__ == "__main__":
    main()
