"""Reference-led, independently editable botanical correspondence assets."""
from pathlib import Path
import math, random, traceback
import bpy
from mathutils import Vector
from math import sin, cos, pi

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'correspondence-study'
OUT.mkdir(exist_ok=True)
random.seed(17)
bpy.ops.wm.read_factory_settings(use_empty=True)
s=bpy.context.scene
CAMERA_POSITION=Vector((.6,-7.6,10.4))
CAMERA_TARGET=Vector((-.05,.25,.15))
CAMERA_WIDTH=9.6
FRAME_ASPECT=1488/1058
camera_rotation=(CAMERA_TARGET-CAMERA_POSITION).to_track_quat('-Z','Y')
camera_right=camera_rotation@Vector((1,0,0))
camera_up=camera_rotation@Vector((0,1,0))
camera_forward=(CAMERA_TARGET-CAMERA_POSITION).normalized()

def screen_world(x,y,z):
    origin=CAMERA_POSITION+camera_right*(x-.5)*CAMERA_WIDTH+camera_up*(.5-y)*CAMERA_WIDTH/FRAME_ASPECT
    return origin+camera_forward*((z-origin.z)/camera_forward.z)

def screen_point(p):
    delta=p-CAMERA_POSITION
    return Vector((.5+delta.dot(camera_right)/CAMERA_WIDTH,.5-delta.dot(camera_up)/CAMERA_WIDTH*FRAME_ASPECT))

def inside_letter(p):
    p=screen_point(p)
    corners=[Vector(v) for v in [(.085,.555),(.40,.86),(.708,.505),(.415,.315)]]
    crosses=[]
    for a,b in zip(corners,corners[1:]+corners[:1]):
        d=b-a; q=p-a; crosses.append(d.x*q.y-d.y*q.x)
    return all(v<=0 for v in crosses) or all(v>=0 for v in crosses)

for x,y,z in [(0,0,0),(.5,.5,.4),(1,1,1)]:
    assert (screen_point(screen_world(x,y,z))-Vector((x,y))).length<1e-6

def collection(name):
    c=bpy.data.collections.new(name); s.collection.children.link(c); c.asset_mark(); return c

paper=collection('01 • Folded correspondence')
rose=collection('02 • Heritage garden rose')
foliage=collection('03 • Serrated foliage')
flowers=collection('04 • Ivory blossom sprays')
ribbon=collection('05 • Woven silk bow and tails')
seal=collection('06 • Botanical wax seal')
setcol=collection('07 • Set and scattered petals')

def material(name,color,rough=.55,metal=0,grain=70):
    m=bpy.data.materials.new(name); m.use_nodes=True
    n=m.node_tree.nodes; l=m.node_tree.links; p=n.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Roughness'].default_value=rough; p.inputs['Metallic'].default_value=metal
    noise=n.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value=grain; noise.inputs['Detail'].default_value=3
    ramp=n.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].position=.16; ramp.color_ramp.elements[0].color=(*(v*.65 for v in color),1)
    ramp.color_ramp.elements[1].position=.84; ramp.color_ramp.elements[1].color=(*color,1)
    l.new(noise.outputs['Fac'],ramp.inputs[0]); l.new(ramp.outputs[0],p.inputs['Base Color'])
    bump=n.new('ShaderNodeBump'); bump.inputs['Strength'].default_value=.19; bump.inputs['Distance'].default_value=.013
    l.new(noise.outputs['Fac'],bump.inputs['Height']); l.new(bump.outputs[0],p.inputs['Normal'])
    return m

rag=material('Warm ivory cotton fibres',(.72,.52,.29),.88,grain=140)
olive=material('Muted olive botanical leaf',(.12,.15,.042),.68,grain=95)
stemmat=material('Fine ochre stems',(.22,.13,.034),.75)
ivory=material('Porcelain ivory blossom',(.94,.78,.47),.62)
gold=material('Aged embossed bronze',(.43,.23,.058),.37,.72)
wax=material('Dark antique honey wax',(.20,.09,.026),.48)
ink=material('Faded sepia ink',(.10,.047,.018),.95)
silk=material('Dusty copper silk weave',(.51,.20,.125),.38,grain=220)
silk.node_tree.nodes.get('Principled BSDF').inputs['Sheen Weight'].default_value=.55
petalmats=[material('Rose petal tone %02d'%i,c,.61,grain=115) for i,c in enumerate([(.27,.055,.026),(.44,.12,.066),(.63,.24,.15),(.76,.37,.24)])]
for m in petalmats+[ivory,olive]: m.node_tree.nodes.get('Principled BSDF').inputs['Subsurface Weight'].default_value=.065

atlas=bpy.data.images.load(str(OUT/'material-atlas.png')); atlas.pack()
def texture_material(mat,x,y,strength=.12):
    n=mat.node_tree.nodes; l=mat.node_tree.links; p=n.get('Principled BSDF')
    uv=n.new('ShaderNodeTexCoord'); mapping=n.new('ShaderNodeMapping')
    mapping.inputs['Scale'].default_value=(.492,.492,1)
    mapping.inputs['Location'].default_value=(x+.004,y+.004,0)
    tex=n.new('ShaderNodeTexImage'); tex.image=atlas
    l.new(uv.outputs['UV'],mapping.inputs[0]); l.new(mapping.outputs[0],tex.inputs[0])
    l.new(tex.outputs['Color'],p.inputs['Base Color'])
    if mat==olive:
        tint=n.new('ShaderNodeMixRGB'); tint.blend_type='MULTIPLY'; tint.inputs[0].default_value=1
        tint.inputs[2].default_value=(.40,.58,.34,1)
        l.new(tex.outputs['Color'],tint.inputs[1]); l.new(tint.outputs[0],p.inputs['Base Color'])
    bump=n.new('ShaderNodeBump'); bump.inputs['Strength'].default_value=strength; bump.inputs['Distance'].default_value=.018
    l.new(tex.outputs['Color'],bump.inputs['Height']); l.new(bump.outputs[0],p.inputs['Normal'])
    if mat in petalmats:
        color=n.new('ShaderNodeHueSaturation'); color.inputs['Saturation'].default_value=.63; color.inputs['Value'].default_value=1.20
        l.new(tex.outputs['Color'],color.inputs['Color'])
        separate=n.new('ShaderNodeSeparateXYZ'); l.new(uv.outputs['UV'],separate.inputs[0])
        edge=n.new('ShaderNodeMapRange'); edge.inputs['From Min'].default_value=.94; edge.inputs['From Max'].default_value=1
        l.new(separate.outputs['Y'],edge.inputs['Value'])
        mix=n.new('ShaderNodeMixRGB'); mix.inputs[2].default_value=(.90,.62,.39,1)
        l.new(edge.outputs[0],mix.inputs[0]); l.new(color.outputs[0],mix.inputs[1]); l.new(mix.outputs[0],p.inputs['Base Color'])
for m in petalmats: texture_material(m,0,.5,.21)
texture_material(olive,.5,.5,.25)
texture_material(silk,0,0,.12)
texture_material(rag,.5,0,.28)

def mesh(c,name,verts,faces,mat):
    d=bpy.data.meshes.new(name); d.from_pydata(verts,[],faces); d.update()
    o=bpy.data.objects.new(name,d); c.objects.link(o); d.materials.append(mat)
    for p in d.polygons: p.use_smooth=True
    return o

def grid(c,name,nu,nv,fn,mat):
    ob=mesh(c,name,[fn(i/nu,j/nv) for i in range(nu+1) for j in range(nv+1)],
        [(i*(nv+1)+j,(i+1)*(nv+1)+j,(i+1)*(nv+1)+j+1,i*(nv+1)+j+1) for i in range(nu) for j in range(nv)],mat)
    uv=ob.data.uv_layers.new(name='Material surface')
    for loop in ob.data.loops:
        i,j=divmod(loop.vertex_index,nv+1)
        uv.data[loop.index].uv=(j/nv,i/nu) if c==foliage else (i/nu,j/nv)
    if c in [rose,foliage,flowers,ribbon]:
        ob['attachment_vertices']=[i*(nv+1) for i in range(nu+1)] if c==rose else list(range(nv+1))
    if c==rose:
        solid=ob.modifiers.new('Petal thickness','SOLIDIFY'); solid.thickness=.007; solid.offset=-.25
        bevel=ob.modifiers.new('Soft petal edge','BEVEL'); bevel.width=.009; bevel.segments=2
    return ob

def line(c,name,pts,r,mat):
    d=bpy.data.curves.new(name,'CURVE'); d.dimensions='3D'; d.bevel_depth=r; d.bevel_resolution=2
    sp=d.splines.new('POLY'); sp.points.add(len(pts)-1)
    for p,v in zip(sp.points,pts): p.co=(*v,1)
    o=bpy.data.objects.new(name,d); c.objects.link(o); d.materials.append(mat); return o

def orb(c,name,p,r,mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=10,ring_count=6,radius=r,location=p)
    o=bpy.context.object; o.name=name
    for old in list(o.users_collection): old.objects.unlink(o)
    c.objects.link(o); o.data.materials.append(mat)
    for poly in o.data.polygons: poly.use_smooth=True
    return o

def sheet(name,corners):
    o=mesh(paper,name,corners,[(0,1,2,3)],rag); o.modifiers.new('Cotton paper edge','SOLIDIFY').thickness=.012
    return o

backdrop=material('Soft aged parchment backdrop',(.74,.59,.39),.9)
bgtex=backdrop.node_tree.nodes.new('ShaderNodeTexImage')
bgtex.image=bpy.data.images.load(str(ROOT.parent/'client/public/assets/editorial/hero-paper.webp')); bgtex.image.pack()
backdrop.node_tree.links.new(bgtex.outputs['Color'],backdrop.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
grid(setcol,'Warm parchment tabletop',1,1,lambda u,v: (-20+40*u,-20+40*v,-.14),backdrop)
sheet('Envelope back',[screen_world(.075,.50,.04),screen_world(.438,.57,.04),screen_world(.456,.28,.04),screen_world(.104,.28,.04)])
mesh(paper,'Open triangular envelope flap',[screen_world(.104,.28,.05),screen_world(.456,.28,.05),screen_world(.303,.04,1.10)],[(0,1,2)],rag)
mesh(paper,'Envelope folded sides',[screen_world(.075,.50,.07),screen_world(.438,.57,.07),screen_world(.29,.40,.10),screen_world(.104,.28,.08),screen_world(.456,.28,.08)],[(0,1,2),(0,2,3),(1,4,2)],rag)

def page(u,v):
    bottom=Vector((.085,.555)).lerp(Vector((.40,.86)),u)
    top=Vector((.415,.315)).lerp(Vector((.708,.505)),u)
    p=bottom.lerp(top,v)
    z=.16+.15*u*u+.23*(2*v-1)**8+.018*sin(u*27+v*16)
    # Deckle is geometry, so the ragged silhouette remains visible in close-up.
    p.x+=.0016*sin(v*105)*(abs(2*u-1)**18)
    p.y+=.0016*sin(u*87)*(abs(2*v-1)**18)
    return screen_world(p.x,p.y,z)

letter=grid(paper,'Curled deckle-edge handwritten letter',100,80,page,rag)
letter.modifiers.new('Rag paper thickness','SOLIDIFY').thickness=.013
fontpath='C:/Windows/Fonts/VIVALDII.TTF'
font=bpy.data.fonts.load(fontpath)
lines=['My dearest,','Some moments never truly leave us.', 'They linger in the warmth of a familiar embrace,',
       'in a garden after rain, in a letter kept for years.', 'A fragrance carries what words cannot hold.',
       'The quiet beauty of a memory, a feeling, a soul.', 'May this little treasure bring you back',
       'to the places and people you love.', 'Always, with love.']
for i,body in enumerate(lines):
    d=bpy.data.curves.new('Handwritten line','FONT'); d.body=body; d.font=font; d.size=.18; d.space_character=1.05
    o=bpy.data.objects.new('Sepia letter %02d'%i,d); paper.objects.link(o); d.materials.append(ink)
    o.location=page(.13,.83-i*.075)+Vector((0,0,.016)); o.rotation_euler.z=-.25
    bpy.context.view_layer.objects.active=o; o.select_set(True)
    bpy.ops.object.convert(target='MESH'); o=bpy.context.object
    for vertex in o.data.vertices:
        p=vertex.co.copy()
        world=page(.13+p.x/4.1,.83-i*.075+p.y/3.2)+Vector((0,0,.005))
        vertex.co=o.matrix_world.inverted()@world
    o.select_set(False)

# Planar UVs for the folded envelope pieces, independent of their depth.
for ob in paper.objects:
    if ob.type=='MESH' and not ob.data.uv_layers:
        uv=ob.data.uv_layers.new(name='Cotton paper UV')
        bounds=[screen_point(v.co) for v in ob.data.vertices]
        min_x,min_y=min(p.x for p in bounds),min(p.y for p in bounds)
        span_x=max(p.x for p in bounds)-min_x; span_y=max(p.y for p in bounds)-min_y
        for loop in ob.data.loops:
            p=bounds[loop.vertex_index]
            uv.data[loop.index].uv=((p.x-min_x)/max(span_x,.001),1-(p.y-min_y)/max(span_y,.001))

# Individual cupped petals grow outward from a compact spiral heart.
center=Vector((-2.0,-.25,.48))
flower_rotation=Vector((.55,-.7,.53)).to_track_quat('Z','Y').to_matrix()
for ring,count in enumerate([3,4,5,6,7,8,9,10]):
    for j in range(count):
        a=2*pi*j/count+ring*2.399+random.uniform(-.10,.10)
        jitter=random.uniform(-.045,.045); spread=random.uniform(.88,1.10); height=random.uniform(.92,1.08)
        def petal(u,v):
            t=2*u-1; theta=a+t*pi/count*1.92+.24*(1-v)+.035*sin(t*4+j)*v
            r=(.018+ring*.025+sin(v*pi*.56)*(.045+ring*.080)*(1-.12*t*t))*spread
            z=.08+height*(.64-ring*.015)*sin(v*pi*.52)-.045*t*t*v
            z+=v**7*(.007*sin(t*9+j)+.003*sin(t*21+j)+jitter)
            r+=v**9*.014*cos(t*8+j)
            p=Vector((r*cos(theta),r*sin(theta),z))
            # Tilt the flower face toward the camera rather than looking straight up.
            return center+flower_rotation@p
        grid(rose,'Rose %02d • petal %02d'%(ring,j),40,24,petal,petalmats[min(3,ring//3)])

for j in range(5):
    def outer_petal(u,v):
        t=2*u-1; a=j*2*pi/5+t*.82
        r=.84*sin(v*1.40)*(1-.08*t*t)
        z=-.25+.76*(1-cos(v*1.65))-.04*t*t*v+.009*sin(t*15+j)*v**7
        return center+flower_rotation@Vector((r*cos(a),r*sin(a),z))
    grid(rose,'Broad outer guard petal %02d'%j,40,26,outer_petal,petalmats[3])

# Break the procedural regularity with a second, tilted guard layer and a compact cupped heart.
for j in range(7):
    a=2*pi*j/7+.22
    def guard(u,v):
        t=2*u-1; r=.48*sin(v*pi*.58)*(1-.18*t*t); z=-.16+.48*sin(v*pi*.65)-.10*t*t*v
        r*=1+.10*sin(j*4.2); z+=.035*sin(t*5+j)*v**4
        p=Vector((r*cos(a+t*.55),r*sin(a+t*.55),z))
        return center+flower_rotation@p
    grid(rose,'Cupped guard petal %02d'%j,34,22,guard,petalmats[2])

for j in range(9):
    a=2*pi*j/9+.1
    def heart(u,v):
        t=2*u-1; r=.07+.24*sin(v*pi*.62)*(1-.3*t*t); z=.03+.30*sin(v*pi*.72)-.13*t*t*v
        p=Vector((r*cos(a+t*.72),r*sin(a+t*.72),z))
        return center+flower_rotation@p
    grid(rose,'Tightly curled heart petal %02d'%j,28,20,heart,petalmats[1])

rose_bounds=[screen_point(v.co) for ob in rose.objects for v in ob.data.vertices]
lo=Vector((min(p.x for p in rose_bounds),min(p.y for p in rose_bounds)))
hi=Vector((max(p.x for p in rose_bounds),max(p.y for p in rose_bounds)))
old_anchor=screen_world(*((lo+hi)/2),.6)
new_anchor=screen_world(.287,.46,.6)
rose_scale=.18/(hi.x-lo.x)
for ob in rose.objects:
    for vertex in ob.data.vertices: vertex.co=new_anchor+(vertex.co-old_anchor)*rose_scale

def leaf(start,direction,length,idx):
    d=Vector(direction).normalized(); cross=Vector((-d.y,d.x,0)).normalized()
    def shape(u,v):
        width=sin(pi*u)**.8*(1+.075*sin(u*90))
        return start+d*u*length+cross*(v-.5)*length*.49*width+Vector((0,0,.085*sin(pi*u)*(1-abs(2*v-1))+.10*u*u*sin(idx)+.018*sin(u*28)*(2*v-1)**2))
    o=grid(foliage,'Serrated leaf %03d'%idx,32,8,shape,olive)
    line(foliage,'Leaf central vein',[shape(t/20,.5)+Vector((0,0,.003)) for t in range(21)],.003,stemmat)
    return o

for b,(endx,endy) in enumerate([(.02,.08),(.13,.03),(.35,.06),(.52,.10),(.60,.30),(.03,.60),(.24,.79),(.59,.70)]):
    start=screen_world(.27,.45,.26); end=screen_world(endx,endy,.30)
    d=end-start
    stem_points=[]
    for i in range(31):
        t=i/30; p=start+d*t
        p.z=-.08 if t<.72 else -.08+.38*(t-.72)/.28
        if inside_letter(p):
            sp=screen_point(p); p=screen_world(sp.x,sp.y,-.07)
        stem_points.append(p)
    line(foliage,'Curved botanical stem',stem_points,.012,stemmat)
    cross=Vector((-d.y,d.x,0)).normalized()
    for k in range(2,7):
        t=k/7; p=start+d*t+Vector((0,0,.12*sin(pi*t)))
        if inside_letter(p): continue
        leaf(p,d.normalized()*.48+cross*((-1)**k)*.8,(.40+random.random()*.23)*(1.4 if b<2 else 1),b*10+k)

for b in range(40):
    angle=b*2.399; dist=random.uniform(.85,1.10)
    base=screen_world(.26,.43,.04)
    end=screen_world(.25+cos(angle)*.35*dist,.44+sin(angle)*.40*dist,.18+random.random()*.28)
    hidden_base=base.copy(); hidden_base.z=-.09
    hidden_mid=base.lerp(end,.72); hidden_mid.z=-.09
    if inside_letter(end):
        sp=screen_point(end); end=screen_world(sp.x,sp.y,-.06)
    line(flowers,'Blossom spray stem',[hidden_base,hidden_mid,end],.008,stemmat)
    for k in range(5):
        p=base.lerp(end,.58+k*.105)+Vector((random.uniform(-.17,.17),random.uniform(-.16,.16),.055))
        sp=screen_point(p)
        if inside_letter(p):
            continue
        if (sp.x-.108)**2+(sp.y-.70)**2<.075**2:
            continue
        pedicel=base.lerp(end,.50+k*.105); pedicel.z=-.07
        line(flowers,'Fine flower pedicel',[pedicel,p],.004,stemmat)
        orb(flowers,'Golden pollen centre',p,.026,gold)
        for j in range(5):
            a=2*pi*j/5+b
            def blossom(u,v):
                t=(v-.5)*2; r=.018+.092*u
                return p+Vector((cos(a)*r-sin(a)*t*.043*sin(pi*u),sin(a)*r+cos(a)*t*.043*sin(pi*u),.035*sin(pi*u)+.016*t*t))
            grid(flowers,'Ivory flower petal',7,5,blossom,ivory)
        if k%2==0: orb(flowers,'Unopened flower bud',p+Vector((.11,.05,.04)),.031,ivory)

# Botanical engraving follows the raised flap, so it does not float above it.
for branch in range(3):
    start=Vector((-2.12,2.18,0)); end=Vector((-2.12+(branch-1)*.38,2.88-abs(branch-1)*.2,0))
    def on_flap(p): return screen_world(.303+(p.x+2.1)*.134,.28-(p.y-2.1)*.20,.05+(p.y-2.1)*1.05/1.2+.003)
    line(paper,'Printed botanical stem',[on_flap(start.lerp(end,i/20)) for i in range(21)],.003,stemmat)
    for k in range(1,6):
        at=start.lerp(end,k/6); sign=(-1)**k
        def printed_leaf(u,v):
            return on_flap(at+Vector((sign*u*.15,(v-.5)*.065*sin(pi*u)+u*.07,0)))
        grid(paper,'Printed botanical leaf',10,5,printed_leaf,olive)

def strip(name,fn,width):
    def point(u,v):
        c=Vector(fn(u)); tangent=(Vector(fn(min(1,u+.001)))-Vector(fn(max(0,u-.001)))).normalized()
        side=Vector((-tangent.y,tangent.x,0)).normalized()
        normal=tangent.cross(side).normalized(); twist=.85*sin(u*8)+.25*sin(u*17)
        side=side*cos(twist)+normal*sin(twist)
        w=width(u) if callable(width) else width
        return c+side*(v-.5)*w+normal*(.016*sin(v*5*pi+u*22)+.007*sin(v*13*pi+u*9))
    o=grid(ribbon,name,160,12,point,silk)
    o.modifiers.new('Silk selvedge thickness','SOLIDIFY').thickness=.004
    for v in [.015,.985]: line(ribbon,'Woven selvedge',[point(i/160,v) for i in range(161)],.0025,silk)
    return o

# Both loops meet at the knot; the long tail starts behind the envelope.
knot=screen_world(.075,.40,.46)
strip('Bow • left folded loop',lambda t:knot+Vector((-.70*sin(pi*t),.38*sin(2*pi*t),.37*sin(pi*t))),.29)
strip('Bow • right folded loop',lambda t:knot+Vector((.62*sin(pi*t),.40*sin(2*pi*t),.32*sin(pi*t))),.29)
knot_obj=orb(ribbon,'Bow • gathered silk knot',knot,.16,silk); knot_obj.scale=(.8,1,.8)
knot_obj.modifiers.new('Smooth gathered knot','SUBSURF').levels=2
def ribbon_path(points):
    points=[screen_world(*p) for p in points]
    def at(t):
        q=min(t*(len(points)-1),len(points)-1-.000001); i=int(q); f=q-i
        a=points[max(0,i-1)]; b=points[i]; c=points[i+1]; d=points[min(len(points)-1,i+2)]
        return .5*((2*b)+(-a+c)*f+(2*a-5*b+4*c-d)*f*f+(-a+3*b-3*c+d)*f*f*f)
    return at
strip('Silk tail • from behind envelope',ribbon_path([(.426,.295,.03),(.42,.16,.65),(.47,.155,.85),(.51,.20,.90),(.50,.29,.55),(.54,.36,.5),(.61,.43,.27),(.65,.64,.15)]),.43)
strip('Silk tail • foreground loose curl',ribbon_path([(.65,.64,.15),(.72,.65,.50),(.78,.73,.85),(.77,.84,.18),(.83,.85,.10),(.91,.74,.65),(1.02,.68,1.10)]),lambda t:.54+.18*sin(pi*t/2))
strip('Silk tail • lower loose fold',ribbon_path([(.075,.40,.46),(.04,.47,.2),(.035,.55,.18),(.07,.60,.10)]),.33)

seal_anchor=screen_world(.108,.70,.17); cx,cy=seal_anchor.x,seal_anchor.y
profile=[(.001,.13),(.39,.13),(.43,.17),(.42,.23),(.36,.26),(.32,.21),(.001,.21)]
grid(seal,'Irregular pooled wax',120,6,lambda u,v:(cx+profile[round(v*6)][0]*(1+.035*sin(u*2*pi*7))*cos(u*2*pi),cy+profile[round(v*6)][0]*(1+.035*sin(u*2*pi*7))*sin(u*2*pi),profile[round(v*6)][1]),wax)
for r in [.315,.36]: line(seal,'Embossed circular rim',[(cx+r*cos(i*2*pi/100),cy+r*sin(i*2*pi/100),.237) for i in range(101)],.009,gold)
for j in range(5):
    end=Vector((cx+(j-2)*.102,cy+.20-abs(j-2)*.055,.23)); base=Vector((cx,cy-.22,.23))
    line(seal,'Pressed botanical stem',[base,base.lerp(end,.5),end],.007,gold)
    for t in [.45,.7,.93]:
        p=base.lerp(end,t)
        orb(seal,'Embossed seed',p,.018,gold)
        for side in [-1,1]:
            def seal_leaf(u,v):
                return p+Vector((side*u*.06,(v-.5)*.035*sin(pi*u)+u*.025,.005+.008*sin(pi*u)))
            grid(seal,'Embossed botanical leaf',8,5,seal_leaf,gold)

for ob in seal.objects:
    ob.location=seal_anchor+(ob.location-seal_anchor)*1.45
    ob.scale*=1.45

for j in range(7):
    p=Vector((random.uniform(-3.3,2),random.uniform(-2.5,1),.025))
    grid(setcol,'Fallen rose petal',18,12,lambda u,v:p+Vector(((u-.5)*.33,(v-.5)*.27*sin(pi*u),.06*sin(pi*u)+.04*sin(pi*u)*(2*v-1)**2)),petalmats[2])

for j,p in enumerate([Vector((1.15,.40,1.1)),Vector((2.1,1.8,.72)),Vector((-.2,-2.3,.55))]):
    grid(setcol,'Suspended rose petal %02d'%j,28,18,lambda u,v:p+Vector(((u-.5)*.43,(v-.5)*.33*sin(pi*u),.11*sin(pi*u)+.08*sin(pi*u)*(2*v-1)**2+.03*u*u)),petalmats[3])

bpy.ops.object.camera_add(location=CAMERA_POSITION); cam=bpy.context.object; s.camera=cam
cam.rotation_euler=camera_rotation.to_euler(); cam.data.type='ORTHO'; cam.data.ortho_scale=CAMERA_WIDTH
bpy.ops.object.light_add(type='AREA',location=(2.8,3.5,5.5)); lamp=bpy.context.object; lamp.data.energy=1000; lamp.data.size=1.4; lamp.data.color=(1,.77,.48)
lamp.rotation_euler=(Vector((-1,0,0))-lamp.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.light_add(type='AREA',location=(0,-4,4)); fill=bpy.context.object; fill.data.energy=90; fill.data.size=4; fill.data.color=(1,.89,.77)
fill.rotation_euler=(Vector((-1,0,.4))-fill.location).to_track_quat('-Z','Y').to_euler()
s.world=bpy.data.worlds.new('Warm studio ambient'); s.world.use_nodes=True; s.world.node_tree.nodes['Background'].inputs[0].default_value=(.52,.40,.27,1); s.world.node_tree.nodes['Background'].inputs[1].default_value=.18
s.render.engine='CYCLES'; s.cycles.samples=32; s.cycles.use_denoising=True
s.view_settings.exposure=.1
s.render.resolution_x=1488; s.render.resolution_y=1058; s.render.resolution_percentage=100
s.render.image_settings.file_format='PNG'; s.render.filepath=str(OUT/'composition.png')
assert len(rose.objects)==73
assert len(ribbon.objects)==16
assert all(len(o.data.vertices)>0 for o in rose.objects)
# Attachment-point origins preserve the still and allow each part to bend from its actual base.
for c in [rose,foliage,flowers,ribbon]:
    for ob in c.objects:
        roots=ob.get('attachment_vertices')
        if ob.type=='MESH' and roots:
            anchor=sum((ob.data.vertices[i].co for i in roots),Vector())/len(roots)
            for vertex in ob.data.vertices: vertex.co-=anchor
            ob.location=anchor
            del ob['attachment_vertices']
assert cam.animation_data is None
assert atlas.packed_file is not None
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'Golden botanical correspondence.blend'))
for c in [rose,foliage,flowers,ribbon,seal,paper]:
    bpy.data.libraries.write(str(OUT/(c.name.split(' • ')[1]+'.blend')),{c},fake_user=True)
bpy.ops.render.render(write_still=True)
(OUT/'render-complete.txt').write_text('Rendered fixed-camera composition and exported six editable asset libraries.\n',encoding='utf-8')
