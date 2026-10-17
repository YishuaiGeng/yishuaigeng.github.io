from pathlib import Path
import base64, io, json, os
import numpy as np
from PIL import Image
from scipy.interpolate import splprep, splev
from scipy.ndimage import binary_fill_holes
from skimage.color import rgb2hsv
from skimage.measure import find_contours
from skimage.morphology import binary_closing, binary_dilation, disk, remove_small_objects, remove_small_holes

ROOT=Path(__file__).resolve().parents[2]/'design'/'whale-pet'
OUT=Path(os.environ.get('WHALE_PET_OUTPUT_DIR', ROOT/'v02-glossy'))
OUT.mkdir(parents=True, exist_ok=True)
SOURCE=ROOT/'reference'/'whale-original.png'
im=Image.open(SOURCE).convert('RGB')
a=np.asarray(im)/255.
hsv=rgb2hsv(a)
yy,xx=np.indices(a.shape[:2])
blue=(hsv[:,:,0]>.47)&(hsv[:,:,0]<.75)&(hsv[:,:,1]>.10)&(hsv[:,:,2]>.2)
# White specular islands belong to the material; preserve only the large tail opening.
blue=remove_small_objects(binary_closing(blue,disk(3)),min_size=100)
blue=remove_small_holes(blue,area_threshold=1500)
eye=(np.max(a,axis=2)<.58)&(xx>340)&(xx<490)&(yy>620)&(yy<747)
eye=remove_small_objects(binary_closing(eye,disk(1)),min_size=300)
eye=binary_fill_holes(eye)
spout=blue&(yy<405)
tail=blue&(xx>=875)&(yy<=819)
body=blue&(yy>=398)&~tail
# Shared material overlaps at the movable joint to avoid a pale antialiasing seam.
body=binary_dilation(body,disk(3))&blue&(yy>=398)
masks={'body':body,'tail':tail,'spout':spout,'eye':eye}

def curves(mask):
    contours=find_contours(np.pad(mask.astype(float),1),.5)
    paths=[]
    for c in contours:
        if len(c)<15: continue
        # Pixel centers from marching squares need a half-pixel offset in SVG space.
        c=c-.5
        points=np.column_stack([c[:,1],c[:,0]])
        tck,u=splprep([points[:,0],points[:,1]],s=len(points)*.05,per=True,k=3)
        length=np.linalg.norm(np.diff(points,axis=0),axis=1).sum()
        ts=np.linspace(0,1,max(16,int(np.ceil(length/8)))+1)
        q=np.array(splev(ts,tck)).T
        d=np.array(splev(ts,tck,der=1)).T
        s=[f'M {q[0,0]:.2f} {q[0,1]:.2f}']
        for i in range(len(ts)-1):
            dt=ts[i+1]-ts[i]
            p1=q[i]+d[i]*dt/3
            p2=q[i+1]-d[i+1]*dt/3
            e=q[i+1]
            s.append(f'C {p1[0]:.2f} {p1[1]:.2f} {p2[0]:.2f} {p2[1]:.2f} {e[0]:.2f} {e[1]:.2f}')
        s.append('Z')
        paths.append(' '.join(s))
    return ' '.join(paths)

def texture(mask,name):
    ys,xs=np.where(mask)
    x0=max(0,int(xs.min())-3);y0=max(0,int(ys.min())-3)
    x1=min(im.width,int(xs.max())+4);y1=min(im.height,int(ys.max())+4)
    crop=im.crop((x0,y0,x1,y1))
    stream=io.BytesIO();crop.save(stream,format='PNG',optimize=True)
    payload=base64.b64encode(stream.getvalue()).decode()
    crop.save(OUT/f'{name}-source-texture.png',optimize=True)
    return f'<image id="{name}-material" x="{x0}" y="{y0}" width="{x1-x0}" height="{y1-y0}" href="data:image/png;base64,{payload}"/>'

paths={k:curves(m) for k,m in masks.items()}
textures={k:texture(m,k) for k,m in masks.items()}
defs=''.join(f'<clipPath id="{k}-contour"><path d="{paths[k]}" clip-rule="evenodd"/></clipPath>' for k in masks)
defs+='''
<filter id="cast-shadow" x="-18%" y="-18%" width="140%" height="150%" color-interpolation-filters="sRGB">
<feDropShadow dx="8" dy="18" stdDeviation="12" flood-color="#101C35" flood-opacity=".30"/>
</filter>
<filter id="eye-shadow" x="-50%" y="-50%" width="220%" height="220%" color-interpolation-filters="sRGB">
<feDropShadow dx="7" dy="13" stdDeviation="8" flood-color="#1A2234" flood-opacity=".32"/>
</filter>
<linearGradient id="eye-glass" x1="0" y1="0" x2=".65" y2="1"><stop stop-color="#5D6267"/><stop offset=".24" stop-color="#17191B"/><stop offset=".7" stop-color="#050607"/><stop offset="1" stop-color="#292D30"/></linearGradient>
<linearGradient id="aqua-glass" x1="0" y1="0" x2=".6" y2="1"><stop stop-color="#B2F7FF"/><stop offset=".3" stop-color="#16C5FF"/><stop offset="1" stop-color="#047DE2"/></linearGradient>
<linearGradient id="paper-glass" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#FFF"/><stop offset=".6" stop-color="#EAF8FF"/><stop offset="1" stop-color="#A9DFFF"/></linearGradient>
'''
base=''.join(f'<g id="{k}"><g clip-path="url(#{k}-contour)">{textures[k]}</g></g>' for k in ['spout','body','tail'])
source_eye=f'<g id="eye"><g clip-path="url(#eye-contour)">{textures["eye"]}</g></g>'

def closed_eye(state):
    d='M 379 696 Q 410 714 443 695'
    if state=='Happy': d='M 378 704 Q 410 661 443 703'
    return f'<g id="eye" filter="url(#eye-shadow)"><path id="eye-closed-glass" d="{d}" fill="none" stroke="url(#eye-glass)" stroke-width="20" stroke-linecap="round"/><path id="eye-closed-highlight" d="{d}" fill="none" stroke="#A8B3BC" stroke-opacity=".35" stroke-width="3" stroke-linecap="round" transform="translate(-2 -4)"/></g>'

def expression(state):
    if state=='Thinking':
        return '<g id="expression" filter="url(#eye-shadow)"><path id="question" d="M 884 345 C 884 303 948 306 948 343 C 948 373 915 374 914 397" fill="none" stroke="url(#aqua-glass)" stroke-width="18" stroke-linecap="round"/><circle cx="914" cy="427" r="10" fill="url(#aqua-glass)"/></g>'
    if state=='Happy':
        return '<g id="expression" filter="url(#eye-shadow)"><path id="sparkle" d="M 911 330 Q 911 359 882 361 Q 911 361 912 393 Q 913 362 942 361 Q 913 360 911 330 Z" fill="url(#aqua-glass)"/><circle cx="974" cy="306" r="12" fill="url(#aqua-glass)"/></g>'
    if state=='Sleep':
        return '<g id="expression" fill="none" stroke="url(#aqua-glass)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" filter="url(#eye-shadow)"><path id="sleep-z-large" d="M 881 370 H 926 L 881 417 H 926"/><path id="sleep-z-small" d="M 958 302 H 991 L 958 336 H 991"/></g>'
    if state=='Reading':
        return '<g id="expression" filter="url(#eye-shadow)"><g id="paper"><rect x="597" y="643" width="112" height="148" rx="16" fill="url(#paper-glass)" stroke="#0A8CE8" stroke-width="5"/><path d="M 613 654 H 692" stroke="#FFF" stroke-width="5" stroke-linecap="round"/><path d="M 619 678 H 684 M 619 704 H 680 M 619 730 H 661" fill="none" stroke="#1453C8" stroke-width="9" stroke-linecap="round"/></g></g>'
    return ''

svg_map={}
for state in ['Idle','Blink','Happy','Thinking','Sleep','Reading']:
    e=closed_eye(state) if state in ['Blink','Happy','Sleep'] else source_eye
    if state=='Thinking':e=f'<g transform="translate(8 -12)">{e}</g>'
    if state=='Reading':e=f'<g transform="translate(12 5)">{e}</g>'
    eye_layer=e if state in ['Blink','Happy','Sleep'] else f'<g filter="url(#eye-shadow)">{e}</g>'
    badge=expression(state)
    if state in ['Happy','Thinking','Sleep']:
        badge=badge.replace('<g id="expression"', '<g id="expression" transform="translate(930 365) scale(1.6) translate(-930 -365)"', 1)
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 1254 1254"><title>Whale Pet {state} — reference-matched contours and original gloss</title><desc>Vector contours traced from the supplied reference. Original raster material retained inside separately editable body, tail, spout and eye groups. Soft shadows are SVG filters.</desc><defs>{defs}</defs><g id="silhouette" filter="url(#cast-shadow)">{base}</g>{eye_layer}{badge}</svg>'
    (OUT/f'whale-pet-{state.lower()}.svg').write_text(svg,encoding='utf-8')
    svg_map[state]=svg
silhouette=f'<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 1254 1254"><title>Reference-traced editable silhouette</title>'+''.join(f'<path id="{k}-contour" d="{paths[k]}" fill="{("#08B9EF" if k=="spout" else "#172333" if k=="eye" else "#1844C9")}" fill-rule="evenodd"/>' for k in ['spout','body','tail','eye'])+'</svg>'
(OUT/'whale-pet-editable-contours.svg').write_text(silhouette,encoding='utf-8')
(OUT/'svg-states.json').write_text(json.dumps(svg_map,ensure_ascii=False),encoding='utf-8')
bounds={}
for k,m in masks.items():
    ys,xs=np.where(m)
    bounds[k]={'x':int(xs.min()),'y':int(ys.min()),'width':int(xs.max()-xs.min()+1),'height':int(ys.max()-ys.min()+1),'maskArea':int(m.sum())}
(OUT/'contour-measurements.json').write_text(json.dumps(bounds,indent=2),encoding='utf-8')
Image.fromarray(np.uint8(blue)*255).save(OUT/'reference-blue-mask.png')
Image.fromarray(np.uint8(eye)*255).save(OUT/'reference-eye-mask.png')
print(json.dumps(bounds))
