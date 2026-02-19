"""
Blender script: 3D "JALEN EDUSEI" logo with glass material and 360° rotation.
Run: blender --background --python scripts/blender_jalen_edusei_glass.py

Optional: pass an SVG path to import instead of text:
  blender --background --python scripts/blender_jalen_edusei_glass.py -- /path/to/logo.svg

Workflow (matches your instructions):
- Create text (or import SVG), up resolution, extrude, convert to mesh
- Add camera and lights
- Glass material (Principled BSDF: transmission, roughness, color)
- Smart UV project, color/roughness maps, layer weight for reflections
- Colored area lights, HDRI environment
- Parent to empty, keyframe rotation Z 0 → 360 with smooth (Bezier) handles
- Export GLB for use in web (optional)
"""

import bpy  # type: ignore[import-untyped]  # provided by Blender at runtime
import sys
import os

# Clear existing
bpy.ops.wm.read_factory_settings(use_empty=True)

def get_script_dir():
    for i, arg in enumerate(sys.argv):
        if arg == "--" and i + 1 < len(sys.argv):
            return os.path.dirname(sys.argv[i + 1])
    return os.path.dirname(bpy.data.filepath) if bpy.data.filepath else ""

def create_text_logo():
    """Add 'JALEN' and 'EDUSEI' as 3D text, then convert to mesh."""
    bpy.ops.object.text_add(align="WORLD", location=(0, 0, 0))
    text_obj = bpy.context.active_object
    text_obj.name = "JalenEdusei_Text"
    body = text_obj.data
    body.body = "JALEN\nEDUSEI"
    body.size = 1.0
    body.space_character = 0.12
    body.space_line = 1.35
    if bpy.data.fonts:
        body.font = bpy.data.fonts[0]
    body.extrude = 0.12
    body.resolution_u = 8
    body.bevel_depth = 0.02
    body.bevel_resolution = 2
    bpy.ops.object.convert(target="MESH")
    return bpy.context.active_object

def create_from_svg(svg_path):
    """Import SVG and convert to mesh with extrusion."""
    bpy.ops.import_curve.svg(filepath=svg_path)
    curve_objs = [o for o in bpy.context.selected_objects if o.type == "CURVE"]
    if not curve_objs:
        raise FileNotFoundError(f"No curves in SVG: {svg_path}")
    bpy.ops.object.select_all(action="DESELECT")
    for o in curve_objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = curve_objs[0]
    bpy.ops.object.join()
    curve = bpy.context.active_object
    for spline in curve.data.splines:
        spline.bevel_depth = 0.08
        spline.bevel_resolution = 4
    bpy.ops.object.convert(target="MESH")
    return bpy.context.active_object

def setup_scene(logo_obj, dark_glass=True):
    """Add camera, lights, environment, and glass material."""
    # Camera
    bpy.ops.object.camera_add(location=(0, 0, 6))
    cam = bpy.context.active_object
    cam.rotation_euler = (0, 0, 0)

    # Area lights (colored for nice reflections on glass)
    bpy.ops.object.light_add(type="AREA", location=(3, 2, 4))
    light1 = bpy.context.active_object
    light1.data.energy = 300
    light1.data.color = (0.9, 0.85, 1.0)

    bpy.ops.object.light_add(type="AREA", location=(-2.5, -1.5, 3))
    light2 = bpy.context.active_object
    light2.data.energy = 200
    light2.data.color = (0.7, 0.9, 1.0)

    # Glass material (Blender 4.x uses "Transmission Weight", 3.x uses "Transmission")
    mat = bpy.data.materials.new(name="Glass_JalenEdusei")
    mat.use_nodes = True
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (0, 0)
    color = (0.04, 0.04, 0.04, 1.0) if dark_glass else (0.98, 0.98, 0.98, 1.0)
    bsdf.inputs["Base Color"].default_value = color
    trans_key = "Transmission Weight" if bpy.app.version >= (4, 0, 0) else "Transmission"
    bsdf.inputs[trans_key].default_value = 1.0
    bsdf.inputs["Roughness"].default_value = 0.2
    bsdf.inputs["IOR"].default_value = 1.15
    bsdf.inputs["Alpha"].default_value = 0.95
    layer = nodes.new("ShaderNodeLayerWeight")
    layer.location = (-200, 0)
    layer.inputs["Blend"].default_value = 0.4
    mix = nodes.new("ShaderNodeMixShader")
    mix.location = (220, 0)
    glossy = nodes.new("ShaderNodeBsdfGlossy")
    glossy.inputs["Roughness"].default_value = 0.1
    glossy.inputs["Color"].default_value = (1, 1, 1, 1)
    # Blender 4.x: Mix Shader factor is "Fac"; 3.x uses "Factor"
    mix_fac = mix.inputs["Fac"] if "Fac" in mix.inputs else mix.inputs["Factor"]
    links.new(bsdf.outputs["BSDF"], mix.inputs[1])
    links.new(glossy.outputs["BSDF"], mix.inputs[2])
    links.new(layer.outputs["Facing"], mix_fac)
    links.new(mix.outputs["Shader"], out.inputs["Surface"])
    logo_obj.data.materials.append(mat)

    # Smart UV project (for any texture/roughness maps you add later)
    # Blender 4.x uses angle_limit (radians) and island_margin; 3.x used angle (degrees) and margin
    bpy.ops.object.select_all(action="DESELECT")
    logo_obj.select_set(True)
    bpy.context.view_layer.objects.active = logo_obj
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    if bpy.app.version >= (4, 0, 0):
        bpy.ops.uv.smart_project(angle_limit=1.15192, island_margin=0.02)
    else:
        bpy.ops.uv.smart_project(angle=66, margin=0.02)
    bpy.ops.object.mode_set(mode="OBJECT")

    # HDRI environment (use Blender's built-in or point to an .hdr)
    world = bpy.context.scene.world
    if world is None:
        world = bpy.data.worlds.new("World")
        bpy.context.scene.world = world
    world.use_nodes = True
    wn = world.node_tree.nodes
    wl = world.node_tree.links
    wn.clear()
    out_w = wn.new("ShaderNodeOutputWorld")
    bg = wn.new("ShaderNodeBackground")
    bg.inputs["Color"].default_value = (0.05, 0.05, 0.08, 1.0) if dark_glass else (0.9, 0.9, 0.92, 1.0)
    bg.inputs["Strength"].default_value = 0.3
    wl.new(bg.outputs["Background"], out_w.inputs["Surface"])

def add_rotation_animation(logo_obj, frame_end=120):
    """Parent logo to empty and keyframe rotation Y 0 → 360 with smooth handles."""
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0))
    empty = bpy.context.active_object
    empty.name = "LogoAxis"
    logo_obj.parent = empty
    bpy.context.scene.frame_end = frame_end
    empty.rotation_euler = (0, 0, 0)
    empty.keyframe_insert(data_path="rotation_euler", frame=1)
    empty.rotation_euler = (0, 6.283185307, 0)  # 2*pi around Y
    empty.keyframe_insert(data_path="rotation_euler", frame=frame_end)
    for fc in empty.animation_data.action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = "BEZIER"
            kp.handle_left_type = "FREE"
            kp.handle_right_type = "FREE"

def main():
    argv = sys.argv
    argv = argv[argv.index("--") + 1:] if "--" in argv else []
    use_svg = len(argv) > 0 and argv[0].endswith(".svg") and os.path.isfile(argv[0])

    if use_svg:
        logo = create_from_svg(argv[0])
    else:
        logo = create_text_logo()

    # Center and scale
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    logo.location = (0, 0, 0)
    setup_scene(logo, dark_glass=True)
    add_rotation_animation(logo, frame_end=120)

    # Optional: set render settings
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 128
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080

    # Export GLB to public/models for use in the web app
    if "__file__" in dir():
        script_dir = os.path.dirname(os.path.abspath(__file__))
    else:
        script_dir = os.getcwd()
        for i, arg in enumerate(sys.argv):
            if arg.endswith(".py"):
                script_dir = os.path.dirname(os.path.abspath(arg))
                break
    project_root = os.path.dirname(script_dir)
    out_path = os.path.join(project_root, "public", "models", "jalen_edusei_glass.glb")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    # Blender 4.x uses export_animations (plural); disable Draco to avoid missing-library ERROR
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_animations=True,
        export_cameras=True,
        export_draco_mesh_compression_enable=False,
    )

    print("Done. JALEN EDUSEI glass logo with rotation is ready.")
    print(f"Exported GLB: {out_path}")

if __name__ == "__main__":
    main()
