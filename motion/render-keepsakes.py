import bpy, os
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SOURCE = os.path.join(ROOT, 'motion', 'keepsakes-source')
OUT = os.path.join(ROOT, 'output', 'keepsakes')
os.makedirs(OUT, exist_ok=True)
names = ['pure-citrus', 'reminiscence-rose', 'afterglow-sandalwood', 'soulmate-amber', 'eternal-letter']

def point_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()

for name in names:
    bpy.ops.wm.open_mainfile(filepath=os.path.join(SOURCE, name + '.blend'))
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = 960; scene.render.resolution_y = 720; scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.world.color = (.07, .045, .025)
    bpy.ops.object.camera_add(location=(0, -4.2, 5.3)); camera = bpy.context.object; point_at(camera, (0, 0, 0)); scene.camera = camera
    for location, energy, color, size in [((-4,-3,6),1500,(1,.68,.38),4), ((4,1,3),900,(1,.42,.25),3)]:
        bpy.ops.object.light_add(type='AREA', location=location); light=bpy.context.object; light.data.energy=energy; light.data.color=color; light.data.shape='DISK'; light.data.size=size; point_at(light,(0,0,0))
    bpy.ops.object.light_add(type='AREA', location=(0,3,1)); bpy.context.object.data.energy=550; bpy.context.object.data.color=(.7,.35,.18); bpy.context.object.data.size=3; point_at(bpy.context.object,(0,0,0))
    scene.render.filepath = os.path.join(OUT, name + '.png')
    bpy.ops.render.render(write_still=True)
