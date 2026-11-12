import bpy, math, os, random
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'client', 'public', 'assets', 'keepsakes'))
SOURCE = os.path.abspath(os.path.join(os.path.dirname(__file__), 'keepsakes-source'))
PAPER_TEXTURE = os.path.abspath(os.path.join(os.path.dirname(__file__), 'keepsakes-textures', 'aged-paper.webp'))
os.makedirs(ROOT, exist_ok=True)
os.makedirs(SOURCE, exist_ok=True)

def clear():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for data in (bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for item in list(data):
            data.remove(item)

def mat(name, color, metallic=0.0, rough=.42):
    m = bpy.data.materials.new(name); m.diffuse_color = (*color, 1)
    m.use_nodes = True; bs = m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value = (*color, 1); bs.inputs['Roughness'].default_value = rough; bs.inputs['Metallic'].default_value = metallic
    return m

def paper_mat():
    m = mat('Painted antique paper',(.72,.57,.39),rough=.9)
    image = bpy.data.images.load(PAPER_TEXTURE, check_existing=True)
    texture = m.node_tree.nodes.new('ShaderNodeTexImage'); texture.image = image
    m.node_tree.links.new(texture.outputs['Color'], m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
    return m

def uv(name, loc, scale, material):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, location=loc)
    o=bpy.context.object; o.name=name; o.scale=scale; bpy.ops.object.transform_apply(location=False, rotation=False, scale=True); o.data.materials.append(material); bpy.ops.object.shade_smooth(); return o

def cyl(name, loc, radius, depth, material, rot=(0,0,0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=radius, depth=depth, location=loc, rotation=rot)
    o=bpy.context.object; o.name=name; o.data.materials.append(material); bpy.ops.object.shade_smooth(); return o

def torus(name, loc, major, minor, material, rot=(0,0,0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=40, minor_segments=12, location=loc, rotation=rot)
    o=bpy.context.object; o.name=name; o.data.materials.append(material); return o

def mesh(name, vertices, faces, material):
    data=bpy.data.meshes.new(name); data.from_pydata(vertices, [], faces); data.update()
    o=bpy.data.objects.new(name,data); bpy.context.collection.objects.link(o); o.data.materials.append(material)
    for face in data.polygons: face.use_smooth=True
    return o

def line(name, a, b, radius, material):
    mid=(Vector(a)+Vector(b))/2; direction=Vector(b)-Vector(a)
    o=cyl(name,mid,radius,direction.length,material); o.rotation_euler=direction.to_track_quat('Z','Y').to_euler(); return o

def card():
    parchment=paper_mat()
    edge=mat('Warm worn edges',(.38,.24,.12),rough=.95)
    brass=mat('Antique gilt',(.5,.32,.1),metallic=.55,rough=.4)
    bpy.ops.mesh.primitive_cube_add(location=(0,0,-.17)); o=bpy.context.object; o.name='Handmade parchment card'; o.scale=(1.38,1.02,.07)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True); o.data.materials.append(parchment)
    b=o.modifiers.new('Soft irregular paper edges','BEVEL'); b.width=.06; b.segments=3
    for x in [-1.26,1.26]: line('Gilt border',(x,-.9,-.08),(x,.9,-.08),.012,brass)
    for y in [-.9,.9]: line('Gilt border',(-1.26,y,-.08),(1.26,y,-.08),.012,brass)
    random.seed(42)
    for i in range(35):
        x=random.uniform(-1.2,1.2); y=random.uniform(-.86,.86)
        uv('Paper foxing',(x,y,-.095),(.012,.009,.002),edge)
    for x in [-1.17,1.17]:
        for y in [-.8,.8]:
            torus('Engraved corner',(x,y,-.072),.045,.008,brass)
    return brass

def leaf(name, center, angle, size, green, vein):
    x,y,z=center; c=math.cos(angle); s=math.sin(angle)
    verts=[]
    for i in range(9):
        t=i/8; width=math.sin(math.pi*t)*size*.31
        for side in [-1,0,1]:
            dx=(t-.5)*size; dy=side*width
            verts.append((x+dx*c-dy*s,y+dx*s+dy*c,z+.035+math.sin(math.pi*t)*(.07 if side==0 else 0)))
    faces=[]
    for i in range(8):
        for j in range(2):
            a=i*3+j; faces.append((a,a+3,a+4,a+1))
    mesh(name,verts,faces,green)
    line('Leaf midrib',verts[1],verts[-2],.009,vein)

def flower(name, center, radius, petal, heart, green):
    x,y,z=center
    for i in range(7):
        a=i*2*math.pi/7; verts=[]
        for j in range(7):
            t=j/6; w=math.sin(math.pi*t)*radius*.36
            for side in [-1,0,1]:
                r=.08+t*radius; px=x+r*math.cos(a)-side*w*math.sin(a); py=y+r*math.sin(a)+side*w*math.cos(a)
                verts.append((px,py,z+.1+.12*math.sin(math.pi*t)+(.04 if side==0 else 0)))
        faces=[(j*3+k,(j+1)*3+k,(j+1)*3+k+1,j*3+k+1) for j in range(6) for k in range(2)]
        mesh(name+' sculpted petal',verts,faces,petal)
    uv(name+' heart',(x,y,z+.19),(.13,.13,.09),heart)
    for i in range(9):
        a=i*2*math.pi/9
        uv('Stamen',(x+.12*math.cos(a),y+.12*math.sin(a),z+.26),(.018,.018,.027),heart)
    for i in range(3):
        a=i*2*math.pi/3; leaf('Sepal',(x+.13*math.cos(a),y+.13*math.sin(a),z-.02),a,.42,green,green)

def setup(name):
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.select_all(action='DESELECT')
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.wm.save_as_mainfile(filepath=os.path.join(SOURCE, name+'.blend'))
    bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT, name+'.glb'), export_format='GLB', use_selection=False, export_draco_mesh_compression_enable=True)

def citrus():
    clear(); card(); cream=mat('Ivory jasmine',(.92,.82,.61),rough=.7); gold=mat('Citrus heart',(.8,.49,.13)); green=mat('Olive foliage',(.22,.27,.12),rough=.78); vein=mat('Leaf veins',(.48,.39,.17))
    uv('Cut bergamot',(-.65,-.48,.1),(.43,.36,.18),gold)
    torus('Fruit rind',(-.65,-.48,.25),.32,.045,cream)
    for i in range(8):
        a=i*math.pi/4; line('Citrus radial',(-.65,-.48,.26),(-.65+.31*math.cos(a),-.48+.31*math.sin(a),.26),.011,cream)
    for i in range(5):
        a=i*.72; x=.22+math.cos(a)*.5; y=.12+math.sin(a)*.36
        leaf('Layered bergamot leaf',(x,y,-.02),a+.6,.8,green,vein)
    flower('Jasmine blossom',(.16,.2,.05),.43,cream,gold,green)
    flower('Jasmine blossom',(.74,-.3,.06),.29,cream,gold,green)
    for x,y in [(-.8,.43),(.9,.42),(-.22,.55)]: uv('Unopened jasmine bud',(x,y,.08),(.07,.15,.08),cream)
    setup('pure-citrus')

def rose():
    clear(); card(); pink=mat('Antique blush petals',(.58,.25,.2),rough=.72); pale=mat('Petal highlights',(.78,.46,.35),rough=.72); dark=mat('Rose center',(.35,.1,.09)); green=mat('Olive foliage',(.21,.26,.12),rough=.8)
    line('Curved rose stem',(-.3,-.8,-.03),(.1,.18,.04),.035,green)
    for a in [0.1,1.5,2.7,4.1,5.4]:
        leaf('Rose leaf',(.3*math.cos(a),-.35+.3*math.sin(a),-.02),a,.65,green,green)
    for ring in range(4):
        n=9+ring*3
        for i in range(n):
            a=2*math.pi*i/n+ring*.17; r=.13+ring*.13
            x=.1+r*math.cos(a); y=.2+r*math.sin(a)
            o=uv('Curled rose petal',(x,y,.06+ring*.025),(.23+ring*.03,.12,.08),pink if i%3 else pale); o.rotation_euler[2]=a
    uv('Tight rose heart',(.1,.2,.2),(.19,.19,.18),dark)
    for x,y in [(-.7,.35),(.67,-.55),(-.48,-.5)]: uv('Fallen rose petal',(x,y,.02),(.19,.12,.035),pale)
    setup('reminiscence-rose')

def sandalwood():
    clear(); card(); wood=mat('Sandalwood heartwood',(.43,.24,.11),rough=.82); light=mat('Cut grain',(.69,.45,.23),rough=.85); grain=mat('Dark etched grain',(.25,.13,.06),rough=.9)
    for i in range(7):
        y=-.53+i*.17; a=math.radians(67+i*3)
        line('Hand split sandalwood',(-.72,y,-.02),(.78,y+.13,.12),.075,wood)
        for j in range(3):
            line('Carved wood grain',(-.5+j*.3,y+.015,.095),(-.25+j*.3,y+.035,.105),.005,light)
    for i in range(14):
        a=i*2.4; x=.78*math.cos(a); y=.61*math.sin(a)
        uv('Wood shaving',(x,y,.12),(.17,.025,.018),light).rotation_euler[2]=a
    torus('Curled shaving',(.5,-.56,.14),.19,.018,grain)
    setup('afterglow-sandalwood')

def amber():
    clear(); card(); gold=mat('Honey amber facets',(.66,.31,.06),metallic=.2,rough=.19); dark=mat('Deep amber',(.36,.14,.025),metallic=.12,rough=.24); green=mat('Pressed olive leaves',(.24,.28,.13)); vein=mat('Gilded veins',(.5,.4,.2),metallic=.35)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=.55,location=(-.2,.05,.33)); o=bpy.context.object; o.name='Faceted amber'; o.scale=(1.14,.85,.63); o.data.materials.append(gold)
    for x,y,r in [(.53,-.49,.24),(.73,-.25,.17),(-.74,-.44,.13)]:
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=r,location=(x,y,.04)); bpy.context.object.data.materials.append(dark)
    line('Botanical branch',(.2,-.66,.01),(.91,.65,.06),.018,green)
    for i in range(6):
        y=-.5+i*.19; leaf('Layered olive leaf',(.52,y,.06),.65 if i%2 else 2.5,.39,green,vein)
    setup('soulmate-amber')

def letter():
    clear(); card(); paper=mat('Folded letter',(.79,.64,.43),rough=.88); ribbon=mat('Faded rose silk',(.53,.26,.24),rough=.58); light=mat('Ribbon edge',(.74,.46,.39),rough=.53); wax=mat('Oxblood seal',(.35,.07,.045),rough=.5)
    bpy.ops.mesh.primitive_cube_add(location=(0,.04,.02)); o=bpy.context.object; o.name='Folded correspondence'; o.scale=(.95,.64,.035); o.data.materials.append(paper); b=o.modifiers.new('Creased edges','BEVEL'); b.width=.04; b.segments=2
    for x in [-.15,.1]: line('Silk wrap',(x,-.63,.085),(x,.68,.085),.055,ribbon)
    line('Crossed silk',(-.95,0,.09),(.95,0,.09),.055,ribbon)
    for i in range(2):
        a=(-1 if i else 1); verts=[(a*.05,0,.16),(a*.28,.19,.24),(a*.55,.26,.15),(a*.5,.07,.08)]
        mesh('Folded ribbon bow',verts,[(0,1,2,3)],light)
    for i in range(2):
        a=(-1 if i else 1); mesh('Flowing ribbon tail',[(0,-.02,.13),(a*.14,-.18,.17),(a*.43,-.65,.08),(a*.28,-.74,.03)],[(0,1,2,3)],ribbon)
    uv('Wax seal',(0,0,.18),(.15,.15,.055),wax)
    green=mat('Pressed botanical',(.24,.29,.14)); flower('Pressed blossom',(.55,.38,.07),.2,paper,wax,green)
    setup('eternal-letter')

for build in (citrus, rose, sandalwood, amber, letter): build()
