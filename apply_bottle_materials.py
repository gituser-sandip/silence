"""Run inside the open Blender scene to give the imported bottle reference-inspired materials."""

import bpy
from pathlib import Path

out_dir = Path(r'D:\websites\Perfume\silence\output\reference_bottle')
out_dir.mkdir(parents=True, exist_ok=True)

mesh_objects = [obj for obj in bpy.data.objects if obj.type == 'MESH']
if not mesh_objects:
    raise RuntimeError('No mesh found in the open Blender scene')

names = {mat.name for obj in mesh_objects for mat in obj.data.materials if mat}
expected = {'Gold', 'Glass', 'Rose liquid'}
if not expected.issubset(names):
    raise RuntimeError(f'Expected {expected}, found {names}')

# Save a separate untouched Blender copy before changing any materials.
before = out_dir / 'bottle_before_materials.blend'
if not before.exists():
    bpy.ops.wm.save_as_mainfile(filepath=str(before))


def srgb(hex_color):
    channels = [int(hex_color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return tuple(c / 12.92 if c < 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in channels)


def material(name, color, metallic, roughness, transmission=0, ior=1.5, alpha=1):
    mat = bpy.data.materials.get(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    output = nodes.new('ShaderNodeOutputMaterial')
    shader = nodes.new('ShaderNodeBsdfPrincipled')
    shader.location = (-250, 0)
    output.location = (100, 0)
    mat.node_tree.links.new(shader.outputs['BSDF'], output.inputs['Surface'])
    rgba = (*srgb(color), alpha)
    shader.inputs['Base Color'].default_value = rgba
    shader.inputs['Metallic'].default_value = metallic
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Transmission Weight'].default_value = transmission
    shader.inputs['IOR'].default_value = ior
    shader.inputs['Alpha'].default_value = alpha
    mat.diffuse_color = rgba
    mat.surface_render_method = 'DITHERED'
    mat.use_transparency_overlap = False
    return mat


# The source photo is a lighting reference. These PBR materials remain coherent from every angle.
material('Gold', '#C9954D', metallic=1.0, roughness=0.17)
material('Glass', '#FFF4E9', metallic=0.0, roughness=0.035, transmission=0.80, ior=1.45, alpha=0.18)
material('Rose liquid', '#E1AA94', metallic=0.0, roughness=0.16, transmission=0.18, ior=1.37, alpha=0.94)

# Set the world so the edit is legible even without a studio setup.
world = bpy.context.scene.world
if world:
    world.use_nodes = True
    background = world.node_tree.nodes.get('Background')
    if background:
        background.inputs['Color'].default_value = (0.70, 0.57, 0.49, 1)
        background.inputs['Strength'].default_value = 0.65

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.view_settings.view_transform = 'AgX'

blend_path = out_dir / 'perfume_bottle_reference.blend'
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))

# Export the bottle alone, without the default scene camera and light.
previous_selection = [obj for obj in bpy.context.selected_objects]
bpy.ops.object.select_all(action='DESELECT')
for obj in mesh_objects:
    obj.select_set(True)
bpy.context.view_layer.objects.active = mesh_objects[0]
glb_path = out_dir / 'perfume_bottle_reference.glb'
bpy.ops.export_scene.gltf(filepath=str(glb_path), export_format='GLB', use_selection=True)
bpy.ops.object.select_all(action='DESELECT')
for obj in previous_selection:
    if obj.name in bpy.data.objects:
        obj.select_set(True)

log_path = out_dir / 'materialization_log.txt'
log_path.write_text(
    f'Original scene: {before}\nEdited Blender file: {blend_path}\nExported GLB: {glb_path}\n'
    f'Meshes: {[obj.name for obj in mesh_objects]}\n'
    f'Materials: {sorted(names)}\n',
    encoding='utf-8',
)
print('BOTTLE MATERIALS COMPLETE', blend_path, glb_path)
