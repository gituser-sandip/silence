"""Refine the open reference bottle in Blender and export its modeled inner vessel."""

import bmesh
import bpy
import math
from pathlib import Path
from mathutils import Vector

out_dir = Path(r'D:\websites\Perfume\silence\output\reference_bottle')
out_dir.mkdir(parents=True, exist_ok=True)
original = bpy.data.objects.get('PerfumeBottle')
if original is None or original.type != 'MESH':
    raise RuntimeError('The open scene does not contain the expected PerfumeBottle mesh')

material_names = [mat.name if mat else '' for mat in original.data.materials]
if 'Rose liquid' not in material_names:
    raise RuntimeError(f'Cannot find original liquid material in {material_names}')

# Preserve the exact open scene, including any unsaved viewport changes.
snapshot = out_dir / 'before_inner_vessel_edit.blend'
if not snapshot.exists():
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(snapshot))

# The imported GLB has one mesh with separate gold, glass and liquid faces.
# Remove only its box-shaped liquid; leave the user's outer bottle intact.
liquid_slot = material_names.index('Rose liquid')
bm = bmesh.new()
bm.from_mesh(original.data)
liquid_faces = [face for face in bm.faces if face.material_index == liquid_slot]
if not liquid_faces:
    raise RuntimeError('Could not identify the original box-shaped liquid faces')
bmesh.ops.delete(bm, geom=liquid_faces, context='FACES')
bm.to_mesh(original.data)
bm.free()
original.data.update()


def rounded_ring(half_width, half_depth, radius, z, steps=8):
    points = []
    corners = (
        (half_width - radius, half_depth - radius, 0),
        (-half_width + radius, half_depth - radius, 90),
        (-half_width + radius, -half_depth + radius, 180),
        (half_width - radius, -half_depth + radius, 270),
    )
    for cx, cy, start in corners:
        for step in range(steps + 1):
            angle = math.radians(start + step * 90 / steps)
            points.append((cx + radius * math.cos(angle), cy + radius * math.sin(angle), z))
    return points


def profiled_vessel(name, profile, mat):
    vertices = []
    for z, half_width, half_depth, radius in profile:
        vertices.extend(rounded_ring(half_width, half_depth, radius, z))
    ring_size = len(vertices) // len(profile)
    faces = [tuple(reversed(range(ring_size)))]
    for ring in range(len(profile) - 1):
        low, high = ring * ring_size, (ring + 1) * ring_size
        for point in range(ring_size):
            nxt = (point + 1) % ring_size
            faces.append((low + point, low + nxt, high + nxt, high + point))
    faces.append(tuple(range((len(profile) - 1) * ring_size, len(vertices))))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    for face in obj.data.polygons[1:-1]:
        face.use_smooth = True
    return obj


def tube(name, points, radius, mat, sides=10):
    path = [Vector(point) for point in points]
    verts = []
    faces = []
    for i, point in enumerate(path):
        tangent = ((path[min(i + 1, len(path) - 1)] - path[max(i - 1, 0)])).normalized()
        across = Vector((0, 1, 0))
        other = tangent.cross(across).normalized()
        for side in range(sides):
            angle = 2 * math.pi * side / sides
            v = point + radius * (math.cos(angle) * across + math.sin(angle) * other)
            verts.append(tuple(v))
    faces.append(tuple(reversed(range(sides))))
    for i in range(len(path) - 1):
        for side in range(sides):
            nxt = (side + 1) % sides
            faces.append((i * sides + side, i * sides + nxt, (i + 1) * sides + nxt, (i + 1) * sides + side))
    faces.append(tuple(range((len(path) - 1) * sides, len(path) * sides)))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    for face in obj.data.polygons[1:-1]:
        face.use_smooth = True
    return obj


def physical_material(name, color, metallic, roughness, transmission=0, alpha=1, ior=1.45):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    shader = material.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, alpha)
    shader.inputs['Metallic'].default_value = metallic
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Transmission Weight'].default_value = transmission
    shader.inputs['Alpha'].default_value = alpha
    shader.inputs['IOR'].default_value = ior
    material.diffuse_color = (*color, alpha)
    material.surface_render_method = 'DITHERED'
    return material


# Wide rounded shoulders taper into a narrower curved base, as in the photo.
# Coordinates are in metres; Blender's Z axis is the bottle's vertical axis.
liquid_profile = [
    (0.0090, 0.0177, 0.0165, 0.0043),
    (0.0100, 0.0190, 0.0177, 0.0045),
    (0.0130, 0.0201, 0.0184, 0.0046),
    (0.0190, 0.0207, 0.0189, 0.0046),
    (0.0290, 0.0210, 0.0195, 0.0047),
    (0.0420, 0.0221, 0.0205, 0.0048),
    (0.0540, 0.0238, 0.0215, 0.0048),
    (0.0590, 0.0244, 0.0220, 0.0047),
    (0.0600, 0.0238, 0.0216, 0.0047),
]
rose = bpy.data.materials['Rose liquid']
fill = profiled_vessel('Rose liquid - rounded fill', liquid_profile, rose)

# A delicate inner-glass contour makes the cavity legible through the outer glass.
rim = physical_material('Inner glass edge', (0.78, 0.62, 0.50), 0, 0.08, 0.55, 0.2)
left = [(-width - 0.0007, -depth - 0.001, z) for z, width, depth, _ in reversed(liquid_profile)]
bottom = [(x, -0.0175, 0.0081) for x in (-0.0182, -0.014, -0.008, 0, 0.008, 0.014, 0.0182)]
right = [(width + 0.0007, -depth - 0.001, z) for z, width, depth, _ in liquid_profile]
tube('Inner vessel front outline', left + bottom + right, 0.00018, rim)

# A real dip tube connects the atomizer to the near-bottom of the liquid.
stem_mat = bpy.data.materials['Gold']
tube('Atomizer feed', [(0, 0, 0.073), (0, 0, 0.061)], 0.00054, stem_mat)
pipe_mat = physical_material('Translucent dip tube', (0.84, 0.72, 0.62), 0, 0.18, 0.5, 0.42)
tube('Dip tube', [(0, 0, 0.061), (0, 0, 0.050), (-0.0003, 0, 0.035), (-0.0006, 0, 0.020), (-0.0007, 0, 0.012)], 0.00032, pipe_mat)

# Save an editable project and a site-ready asset; the old files remain available.
blend_path = out_dir / 'perfume_bottle_realistic.blend'
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
previous_selection = list(bpy.context.selected_objects)
bpy.ops.object.select_all(action='DESELECT')
mesh_objects = [obj for obj in bpy.data.objects if obj.type == 'MESH']
for obj in mesh_objects:
    obj.select_set(True)
bpy.context.view_layer.objects.active = original
glb_path = out_dir / 'perfume_bottle_realistic.glb'
bpy.ops.export_scene.gltf(filepath=str(glb_path), export_format='GLB', use_selection=True)
bpy.ops.object.select_all(action='DESELECT')
for obj in previous_selection:
    if obj.name in bpy.data.objects:
        obj.select_set(True)
print('REALISTIC BOTTLE COMPLETE', blend_path, glb_path, len(liquid_faces), 'old liquid faces removed')
