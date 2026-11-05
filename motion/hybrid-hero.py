"""Reference-faithful 2.5D hero: original art layers with fixed-camera depth motion."""
from pathlib import Path
import bpy, math
from mathutils import Vector

ROOT=Path(__file__).resolve().parent
ASSETS=ROOT.parent/'client/public/assets/editorial'
OUT=ROOT/'hybrid-hero'
OUT.mkdir(exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
s=bpy.context.scene
s.render.engine='BLENDER_EEVEE'
s.render.resolution_x=1280; s.render.resolution_y=720; s.render.resolution_percentage=100
s.render.image_settings.file_format='PNG'; s.render.fps=24; s.frame_start=1; s.frame_end=72
s.world=bpy.data.worlds.new('Warm paper world'); s.world.use_nodes=True
s.world.node_tree.nodes['Background'].inputs[0].default_value=(.42,.29,.18,1)
s.world.node_tree.nodes['Background'].inputs[1].default_value=.35

def mat(name,path):
    m=bpy.data.materials.new(name); m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF'); bs.inputs['Roughness'].default_value=.9
    tex=m.node_tree.nodes.new('ShaderNodeTexImage'); tex.image=bpy.data.images.load(str(path)); tex.image.pack()
    m.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
    emission=m.node_tree.nodes.new('ShaderNodeEmission'); emission.inputs['Strength'].default_value=.9
    m.node_tree.links.new(tex.outputs['Color'],emission.inputs['Color'])
    transparent=m.node_tree.nodes.new('ShaderNodeBsdfTransparent')
    mix=m.node_tree.nodes.new('ShaderNodeMixShader')
    m.node_tree.links.new(tex.outputs['Alpha'],mix.inputs[0])
    m.node_tree.links.new(transparent.outputs[0],mix.inputs[1])
    m.node_tree.links.new(emission.outputs[0],mix.inputs[2])
    out=m.node_tree.nodes.get('Material Output')
    m.node_tree.links.new(mix.outputs[0],out.inputs['Surface'])
    return m

def plane(name,file,z,scale,location=(0,0,0)):
    bpy.ops.mesh.primitive_plane_add(size=2,location=(location[0],location[1],z))
    o=bpy.context.object; o.name=name; o.scale=(scale[0],scale[1],1)
    o.data.materials.append(mat(name,ASSETS/file))
    return o

def flat_reference(name,path):
    m=bpy.data.materials.new(name); m.use_nodes=True
    n=m.node_tree.nodes; l=m.node_tree.links
    tex=n.new('ShaderNodeTexImage'); tex.image=bpy.data.images.load(str(path)); tex.image.pack()
    emission=n.new('ShaderNodeEmission'); emission.inputs['Strength'].default_value=1
    l.new(tex.outputs['Color'],emission.inputs['Color'])
    out=n.get('Material Output'); l.new(emission.outputs[0],out.inputs['Surface'])
    return m

def animate_float(o, loc, drift, turn, scale=None):
    if scale and len(scale)==2: scale=(*scale,1)
    o.location=loc; o.rotation_euler.z=0; o.keyframe_insert('location',frame=1); o.keyframe_insert('rotation_euler',frame=1)
    if scale: o.scale=scale; o.keyframe_insert('scale',frame=1)
    o.location=(loc[0]+drift[0],loc[1]+drift[1],loc[2]+drift[2]); o.rotation_euler.z=turn; o.keyframe_insert('location',frame=36); o.keyframe_insert('rotation_euler',frame=36)
    if scale: o.scale=(scale[0]*1.04,scale[1]*.96,1); o.keyframe_insert('scale',frame=36)
    o.location=(loc[0]-drift[0]*.65,loc[1]-drift[1]*.35,loc[2]); o.rotation_euler.z=-turn*.7; o.keyframe_insert('location',frame=72); o.keyframe_insert('rotation_euler',frame=72)
    if scale: o.scale=scale; o.keyframe_insert('scale',frame=72)

def overlay(name,file,loc,scale,drift,turn):
    o=plane(name,file,.22,scale,loc)
    animate_float(o,loc,drift,turn,scale)
    return o

# Preserve the reference composition by stacking the provided transparent editorial layers.
paper=plane('Paper texture','hero-paper.webp',0,(8,4.5))
letter=plane('Open letter','hero-letter-layer.webp',.04,(8,4.5))
botanical=plane('Botanical foliage','hero-botanical-layer.webp',.08,(8,4.5))
rose=plane('Reference rose','hero-rose-layer.webp',.13,(8,4.5))
seal=plane('Wax seal','hero-seal-layer.webp',.16,(8,4.5))
reference=plane('Reference composition','story-letter-option2.png',-.12,(8,4.5))
reference.data.materials.clear(); reference.data.materials.append(flat_reference('Reference color-preserving print',ASSETS/'story-letter-option2.png'))
for detail in [paper,letter,botanical,rose,seal]: detail.hide_render=True

# Independent overlays: the base remains unchanged, while these elements move on their own paths.
overlay('Foreground silk overlay','story-ribbon.webp',(3.25,-2.55,.22),(2.55,1.55),(.16,.12,.02),.035)
for i,(loc,scale,drift,turn) in enumerate([
    ((-2.65,-1.35,.24),(.32,.22),(.20,.10,.04),.12),
    ((-.65,-1.75,.25),(.25,.18),(.14,.15,.03),-.16),
    ((1.40,-1.15,.26),(.22,.15),(-.16,.11,.04),.19),
    ((2.65,.65,.27),(.18,.13),(-.12,.18,.02),-.14),
    ((-.15,1.55,.28),(.16,.11),(.10,-.12,.03),.21),
]):
    overlay('Drifting petal %02d'%i,'story-petal.webp',loc,scale,drift,turn)

dust_mat=bpy.data.materials.new('Warm floating dust'); dust_mat.use_nodes=True
dn=dust_mat.node_tree.nodes; dl=dust_mat.node_tree.links; out=dn.get('Material Output'); em=dn.new('ShaderNodeEmission'); em.inputs['Color'].default_value=(1.0,.72,.38,1); em.inputs['Strength'].default_value=2.0
tr=dn.new('ShaderNodeBsdfTransparent'); mix=dn.new('ShaderNodeMixShader'); mix.inputs[0].default_value=.28; dl.new(tr.outputs[0],mix.inputs[1]); dl.new(em.outputs[0],mix.inputs[2]); dl.new(mix.outputs[0],out.inputs['Surface'])
for i in range(18):
    x=-6.7+(i*1.47)%13.4; y=-3.5+((i*2.11)%7.1)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=.018+(i%4)*.009,location=(x,y,.30+(i%3)*.05))
    dust=bpy.context.object; dust.name='Dust mote %02d'%i; dust.data.materials.append(dust_mat)
    animate_float(dust,(x,y,dust.location.z),((-.10 if i%2 else .14),.16+(i%3)*.04,.02),.06)

# Fixed camera: all animation is layer motion, never camera motion.
bpy.ops.object.camera_add(location=(0,0,10)); cam=bpy.context.object; cam.name='Static hero camera'; s.camera=cam
cam.data.type='ORTHO'; cam.data.ortho_scale=16; cam.rotation_euler=(0,0,0)

def gentle(o,rot=0,dx=0,dy=0):
    o.rotation_euler=(0,0,0); o.keyframe_insert('rotation_euler',frame=1)
    o.rotation_euler.z=rot; o.keyframe_insert('rotation_euler',frame=36)
    o.rotation_euler.z=0; o.keyframe_insert('rotation_euler',frame=72)
    o.location.x=0; o.keyframe_insert('location',frame=1,index=0)
    o.location.x=dx; o.keyframe_insert('location',frame=36,index=0)
    o.location.x=0; o.keyframe_insert('location',frame=72,index=0)
    o.location.y=0; o.keyframe_insert('location',frame=1,index=1)
    o.location.y=dy; o.keyframe_insert('location',frame=36,index=1)
    o.location.y=0; o.keyframe_insert('location',frame=72,index=1)

gentle(reference,.001,.006,.002)

# The paper layer remains the shared backdrop; overlays use their own alpha channel.

s.render.filepath=str(OUT/'hybrid-still.png'); s.frame_set(36)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'Hybrid reference hero.blend'))
bpy.ops.render.render(write_still=True)
s.render.filepath=str(OUT/'frames'/'hero-')
bpy.ops.render.render(animation=True)
(OUT/'render-complete.txt').write_text('Fixed-camera 2.5D reference hero rendered.\n',encoding='utf-8')
