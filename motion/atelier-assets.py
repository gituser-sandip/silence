"""Build individual botanical assets and photograph the assembled correspondence set."""
from pathlib import Path
import bpy, math
from mathutils import Vector
from math import sin, cos, pi

root = Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(root / "ribbon-proof/Rose silk.blend"))
s = bpy.context.scene
out = root / "atelier-refined"
out.mkdir(exist_ok=True)

def group(name):
    c = bpy.data.collections.new(name)
    s.collection.children.link(c)
    c.asset_mark()
    return c

def paint(name, color, metal=0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bs = m.node_tree.nodes.get("Principled BSDF")
    bs.inputs["Base Color"].default_value = (*color, 1)
    bs.inputs["Metallic"].default_value = metal
    bs.inputs["Roughness"].default_value = .42
    return m

def mesh(c,name,v,f,mat):
    data=bpy.data.meshes.new(name)
    data.from_pydata(v,[],f); data.update()
    ob=bpy.data.objects.new(name,data); c.objects.link(ob)
    ob.data.materials.append(mat)
    for face in data.polygons: face.use_smooth=True
    return ob

rose=group("01 Garden rose")
leaves=group("02 Olive sprigs")
seal=group("03 House seal")
petals=[paint("Petal "+str(i),rgb) for i,rgb in enumerate([
    (.32,.079,.066),(.49,.155,.13),(.67,.285,.24),(.78,.39,.32)])]
green=paint("Olive leaf",(.136,.159,.068))
for mat in petals+[green]:
    surface=mat.node_tree.nodes.get("Principled BSDF")
    surface.inputs["Roughness"].default_value=.67
    surface.inputs["Subsurface Weight"].default_value=.08
vein=paint("Olive midrib",(.24,.205,.095))
wax=paint("Oxblood sealing wax",(.23,.034,.021))
gold=paint("Aged brass impression",(.53,.29,.085),.65)

def grid(c,name,nu,nv,point,mat):
    v=[point(i/nu,j/nv) for i in range(nu+1) for j in range(nv+1)]
    f=[(i*(nv+1)+j,(i+1)*(nv+1)+j,(i+1)*(nv+1)+j+1,i*(nv+1)+j+1)
       for i in range(nu) for j in range(nv)]
    return mesh(c,name,v,f,mat)

for ring,count in enumerate([5,7,9,11,13]):
    for n in range(count):
        a=2*pi*n/count+ring*2.40
        def petal(u,v):
            t=(u-.5)*2
            theta=a+t*(pi/count)*1.63+.19*(1-v)
            r=.03+.04*ring+v*(.07+.084*ring)*(1-.23*t*t)
            z=.24+(.45-.032*ring)*sin(v*1.78)+.12*(1-ring/4)-.095*v*t*t+.021*v*cos(3*theta)
            theta += .11*sin(n*7+ring)+.10*t*v*sin(n+ring)
            r *= 1+.12*sin(n*4.7+ring)+.055*v*cos(5*t+n)
            z += v*v*(.019*sin(3*t+n)+.008*cos(6*t-ring))+.14*r*cos(theta)
            return (-1.54+r*cos(theta),-.15+r*sin(theta),z)
        grid(rose,"Cupped petal",12,8,petal,petals[min(3,ring)])

def stem(c,name,points,r,mat):
    curve=bpy.data.curves.new(name,"CURVE"); curve.dimensions="3D"
    curve.bevel_depth=r; curve.bevel_resolution=2
    sp=curve.splines.new("POLY"); sp.points.add(len(points)-1)
    for p,co in zip(sp.points,points): p.co=(*co,1)
    ob=bpy.data.objects.new(name,curve); c.objects.link(ob); curve.materials.append(mat)

for k,angle in enumerate([2.35,1.36,3.45,-.7]):
    d=Vector((cos(angle),sin(angle),0)); side=Vector((-d.y,d.x,0))
    def branch(t): return Vector((-1.55,-.13,.18))+d*(t*1.85)+side*(.15*t*t)+Vector((0,0,.13*sin(t*pi)))
    stem(leaves,"Branch",[branch(i/16) for i in range(17)],.016,vein)
    for j in range(1,9):
        t=j/9; start=branch(t); sign=(-1)**j
        axis=(d*.48+side*sign*.85).normalized(); cross=Vector((-axis.y,axis.x,0))
        def leaf(u,v):
            w=sin(pi*u)
            length=(.52-.28*t)*(1+.24*sin(j*2.7+k))
            return start+axis*u*length+cross*((v-.5)*.16*w+.048*u*u*sin(j))+Vector((0,0,.046*w*(1-abs(2*v-1))+.074*u*sin(k+j)))
        grid(leaves,"Lanceolate leaf",10,4,leaf,green)
        stem(leaves,"Raised vein",[leaf(i/9,.5) for i in range(10)],.004,vein)

cx,cy=-2.28,-.84
profile=[(.001,.12),(.33,.12),(.355,.15),(.34,.19),(.30,.205),(.27,.175),(.001,.175)]
def rim(u,v):
    r,z=profile[round(v*(len(profile)-1))]; a=u*2*pi
    r*=1+.048*sin(5*a)+.025*cos(9*a)
    return cx+r*cos(a),cy+r*sin(a),z
grid(seal,"Pooled wax rim",96,len(profile)-1,rim,wax)
stem(seal,"Pressed border",[(cx+.244*cos(i*pi/40),cy+.244*sin(i*pi/40),.179) for i in range(81)],.009,gold)
font=bpy.data.curves.new("Monogram","FONT"); font.body="G"; font.align_x="CENTER"; font.size=.39; font.extrude=.006
ob=bpy.data.objects.new("Gilded house initial",font); seal.objects.link(ob); ob.location=(cx,cy-.13,.181); font.materials.append(gold)

s.frame_set(18)
def camera(target,scale):
    p=Vector(target); s.camera.location=p+Vector((.35,-4.3,6.8))
    s.camera.rotation_euler=(p-s.camera.location).to_track_quat("-Z","Y").to_euler()
    s.camera.data.ortho_scale=scale
for ob in s.objects:
    if ob.type=="FONT" and ob!=seal.objects.get("Gilded house initial"):
        ob.hide_render=True
silk=next(ob for ob in s.objects if ob.type=="MESH" and ob.data.shape_keys)
for key in silk.data.shape_keys.key_blocks:
    for i in range(37):
        row=[key.data[i*5+j] for j in range(5)]
        mid=row[2].co.copy()
        taper=1-.86*(i/36)**5
        for pt in row: pt.co=mid+(pt.co-mid)*taper
# Carry the same parchment grain through the tabletop and the correspondence.
texture=bpy.data.images.load(str(root.parent/"client/public/assets/editorial/hero-paper.webp"))
texture.pack()
desk=bpy.data.objects["Writing desk"]
for obj in [desk,bpy.data.objects["Letter • contact plane"]]:
    mat=obj.data.materials[0].copy()
    obj.data.materials[0]=mat
    nodes=mat.node_tree.nodes; links=mat.node_tree.links
    tex=nodes.new("ShaderNodeTexImage"); tex.image=texture
    coord=nodes.new("ShaderNodeTexCoord")
    mapping=nodes.new("ShaderNodeVectorMath"); mapping.operation="SCALE"
    mapping.inputs["Scale"].default_value=.13 if obj==desk else .27
    links.new(coord.outputs["Object"],mapping.inputs[0])
    links.new(mapping.outputs[0],tex.inputs["Vector"])
    links.new(tex.outputs["Color"],nodes.get("Principled BSDF").inputs["Base Color"])
camera((1.12,0,.05),8.7)
s.render.resolution_x=1920; s.render.resolution_y=1080; s.cycles.samples=24
s.render.image_settings.file_format="PNG"
s.render.filepath="//vintage-composition.png"
bpy.ops.wm.save_as_mainfile(filepath=str(out/"Golden correspondence.blend"))
bpy.ops.render.render(write_still=True)
for c,name,target,scale in [(rose,"rose",(-1.54,-.15,.48),1.65),(leaves,"foliage",(-1.55,.14,.22),4.8),(seal,"wax-seal",(cx,cy,.16),.92)]:
    bpy.data.libraries.write(str(out/(name+".blend")),{c},fake_user=True)
    for item in s.objects:
        if item.type not in {"LIGHT","CAMERA"}: item.hide_render=item.name not in c.objects
    camera(target,scale); s.render.film_transparent=True
    s.render.resolution_x=s.render.resolution_y=768
    s.render.filepath=str(out/(name+".png")); bpy.ops.render.render(write_still=True)
