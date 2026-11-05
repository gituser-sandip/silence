"""Build a portable, baked ribbon study. Run with Blender in background mode."""
import math
from pathlib import Path
import bpy
from mathutils import Vector

out = Path(__file__).resolve().parent / "ribbon-proof"
out.mkdir(exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
s = bpy.context.scene

def material(name, rgb, rough, sheen=0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bs = m.node_tree.nodes.get("Principled BSDF")
    for key, val in [("Base Color", (*rgb, 1)), ("Roughness", rough), ("Sheen Weight", sheen)]:
        bs.inputs[key].default_value = val
    noise = m.node_tree.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 190
    bump = m.node_tree.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = .15
    bump.inputs["Distance"].default_value = .012
    m.node_tree.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    m.node_tree.links.new(bump.outputs["Normal"], bs.inputs["Normal"])
    return m

def surface(name, verts, faces, mat):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    s.collection.objects.link(obj)
    obj.data.materials.append(mat)
    return obj

def paper(name, points, mat):
    obj = surface(name, points, [list(range(len(points)))], mat)
    obj.modifiers.new("Paper edge", "SOLIDIFY").thickness = .018
    return obj

cream = material("Cotton rag", (.81,.68,.49), .85)
flap = material("Buff envelope", (.63,.45,.28), .82)
paper("Writing desk", [(-30,-30,-.14),(30,-30,-.14),(30,30,-.14),(-30,30,-.14)],flap)
paper("Letter • contact plane", [(-3,-1.45,0),(3.35,-1.45,0),(3.35,1.35,0),(-3,1.35,0)],cream)
paper("Envelope", [(-3,-1,.12),(-1,-1,.12),(-1,1,.12),(-3,1,.12)],flap)
paper("Folded flap", [(-3,1,.15),(-1,1,.15),(-1.58,-.61,.15)],cream)

# Position-based cloth with stretch, shear and bending constraints.
nx, ny = 37, 5
p = [Vector((-1.18+i*.105, -.24+j*.095+.15*math.sin(i*.15),
             .058+.025*math.sin(i*.19+j*.35))) for i in range(nx) for j in range(ny)]
prev = [v.copy() for v in p]
faces = [(i*ny+j,(i+1)*ny+j,(i+1)*ny+j+1,i*ny+j+1) for i in range(nx-1) for j in range(ny-1)]
silk = surface("Dusty rose silk • pinned under flap", p, faces, material("Rose silk",(.49,.175,.145),.32,.65))
for poly in silk.data.polygons: poly.use_smooth = True
silk.shape_key_add(name="Rest")
links = []
for i in range(nx):
    for j in range(ny):
        for di,dj,k in [(1,0,1),(0,1,1),(1,1,.82),(1,-1,.82),(2,0,.24),(0,2,.3)]:
            if i+di<nx and 0<=j+dj<ny:
                a,b=i*ny+j,(i+di)*ny+j+dj
                links.append((a,b,(p[a]-p[b]).length,k))
s.frame_end=72
s.render.fps=24
keys=silk.data.shape_keys
keys.use_relative=False
for f in range(1,73):
    for step in range(3):
        t=(f-1+step/3)/24
        for a in range(ny,len(p)):
            u=a//ny/(nx-1)
            gust=math.exp(-((t-.84-.36*u)/.34)**2)
            lift=gust*(15+13*math.sin(u*6+t*3+a%ny*.27))
            v=p[a]; velocity=(v-prev[a])*.981; prev[a]=v.copy()
            v+=velocity+Vector((-.8*gust,2*gust,lift-5))/(72**2)
        for iteration in range(5):
            for a,b,length,k in links:
                delta=p[b]-p[a]
                d=delta.length
                if d and b>=ny:
                    correction=delta*((1-length/d)*k)
                    if a>=ny:
                        correction*=.5; p[a]+=correction
                    p[b]-=correction
            for v in p[ny:]: v.z=max(.014,v.z)
    key=silk.shape_key_add(name=f"Gust {f:02}")
    key.interpolation="KEY_LINEAR"
    for vert, pos in zip(key.data,p): vert.co=pos
    keys.eval_time=key.frame
    keys.keyframe_insert(data_path="eval_time",frame=f)
silk.modifiers.new("Silk smoothing","SUBSURF").levels=1
silk.modifiers.new("Selvedge","SOLIDIFY").thickness=.009
for line,txt in enumerate(["GOLDEN PERFUME HOUSE","Correspondance privee","No. 05   /   Atelier des parfums"]):
    bpy.ops.object.text_add(location=(.25,.94-line*.24,.004))
    ob=bpy.context.object
    ob.data.body=txt
    ob.data.size=.14 if line==0 else .105
    ob.data.materials.append(material(txt,(.13,.078,.05),.9))

def aim(obj,point):
    obj.rotation_euler=(Vector(point)-obj.location).to_track_quat("-Z","Y").to_euler()
bpy.ops.object.camera_add(location=(1,-5,5.6))
s.camera=bpy.context.object
aim(s.camera,(0,0,0)); s.camera.data.type="ORTHO"; s.camera.data.ortho_scale=6.9
bpy.ops.object.light_add(type="AREA",location=(-3,2,4))
light=bpy.context.object; light.data.energy=480; light.data.shape="DISK"; light.data.size=2.2; aim(light,(0,0,0))
s.world=bpy.data.worlds.new("Studio fill"); s.world.color=(.27,.24,.21)
s.render.engine="CYCLES"; s.cycles.samples=5; s.cycles.use_denoising=True
s.render.resolution_x=640; s.render.resolution_y=360; s.render.resolution_percentage=100
s.frame_set(1)
s.render.filepath="//frames/silk-"
bpy.ops.wm.save_as_mainfile(filepath=str(out/"Rose silk.blend"))
bpy.ops.render.render(animation=True)
