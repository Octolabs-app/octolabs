import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {modelUrl} from './cars.mjs';

export function createViewer(host,onSelect,onStatus) {
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(38,1,.01,100);camera.position.set(7,4.3,7);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x070e17,0);renderer.outputEncoding=THREE.sRGBEncoding;renderer.physicallyCorrectLights=true;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;host.append(renderer.domElement);
 const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();const env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xbbeeff,0x233046,.8));
 const sun=new THREE.DirectionalLight(0xe9f5ff,1.8);sun.position.set(3,8,5);scene.add(sun);
 const rim=new THREE.DirectionalLight(0x67e8dc,1);rim.position.set(-5,3,-4);scene.add(rim);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.7,0);controls.enableDamping=true;controls.minDistance=2;controls.maxDistance=17;controls.maxPolarAngle=Math.PI*.49;controls.autoRotateSpeed=.6;
 const grid=new THREE.GridHelper(22,44,0x31525a,0x16303b);grid.position.y=-.04;grid.material.transparent=true;grid.material.opacity=.35;scene.add(grid);
 const ring=new THREE.Mesh(new THREE.RingGeometry(3.5,3.515,120),new THREE.MeshBasicMaterial({color:0x67e8dc,transparent:true,opacity:.3,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=-.025;scene.add(ring);
 const platform=new THREE.Mesh(new THREE.CircleGeometry(3.5,96),new THREE.MeshStandardMaterial({color:0x10212c,metalness:.5,roughness:.5,transparent:true,opacity:.45}));platform.rotation.x=-Math.PI/2;platform.position.y=-.03;scene.add(platform);
 const assetRoot=new THREE.Group();scene.add(assetRoot);const lab=new THREE.Group();scene.add(lab);
 let currentAsset=null,car=null,revision=0,selected=null,systemMode=false,xray=false,explode=0,targetExplode=0,groups=new Map(),assetMaterials=[],pointerStart=null,paused=false;
 const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();const label=document.querySelector('#part-label');let focusTarget=null,focusPosition=null;const activePointers=new Set();let multiTouch=false;
 const loader=new GLTFLoader();const draco=new DRACOLoader();draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.146.0/examples/jsm/libs/draco/');loader.setDRACOLoader(draco);loader.setMeshoptDecoder(MeshoptDecoder);
 function disposeObject(root){root.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of [].concat(o.material)){for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose();}});}
 function clearLab(){for(const g of [...lab.children]){lab.remove(g);disposeObject(g);}groups.clear();}
 function material(color=0x536e80){return new THREE.MeshStandardMaterial({color,roughness:.36,metalness:.65,emissive:0x0c3738,emissiveIntensity:.15});}
 function box(parent,x,y,z,w,h,d,color){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));m.position.set(x,y,z);parent.add(m);return m;}
 function cylinder(parent,x,y,z,r,h,color,axis='y'){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),material(color));if(axis==='x')m.rotation.z=Math.PI/2;if(axis==='z')m.rotation.x=Math.PI/2;m.position.set(x,y,z);parent.add(m);return m;}
 function group(id,pos,dir,build){const g=new THREE.Group();g.position.fromArray(pos);g.userData={partId:id,home:g.position.clone(),explode:new THREE.Vector3(...dir)};build(g);g.traverse(o=>{o.userData.partId=id;});lab.add(g);groups.set(id,g);}
 function buildLab(c,parts){clearLab();const valid=new Set(parts.map(p=>p.id));const engineZ=c.layout==='rear'?-1.45:1.15;const wheelZ=1.43;const wheelX=.94;
 const make=(id,p,d,fn)=>{if(valid.has(id))group(id,p,d,fn);};
 make('body',[0,.33,0],[0,1.8,0],g=>{box(g,0,0,0,1.65,.12,3.65,0x284857);for(const x of [-.73,.73])box(g,x,.14,0,.08,.2,3.5,0x89a0ad);});
 make('wheels',[0,.36,0],[1.2,0,0],g=>{for(const x of [-wheelX,wheelX])for(const z of [-wheelZ,wheelZ]){const t=new THREE.Mesh(new THREE.TorusGeometry(.27,.09,12,36),material(0x18242d));t.rotation.y=Math.PI/2;t.position.set(x,0,z);g.add(t);cylinder(g,x,0,z,.22,.12,0x7895a6,'x');}});
 make('brakes',[0,.36,0],[-1.3,.5,0],g=>{for(const x of [-.84,.84])for(const z of [-wheelZ,wheelZ]){cylinder(g,x,0,z,.19,c.id==='fiat500'?.12:.035,0x91a4b2,'x');if(c.id!=='fiat500')box(g,x,.1,z-.14,.1,.15,.13,0xe8a04f);}});
 make('suspension',[0,.7,0],[0,1.5,0],g=>{for(const x of [-.76,.76])for(const z of [-wheelZ,wheelZ]){cylinder(g,x,0,z,.045,.55,0xa1b3bd);for(let i=0;i<8;i++){const t=new THREE.Mesh(new THREE.TorusGeometry(.075,.013,6,14),material(0xe7b577));t.rotation.x=Math.PI/2;t.position.set(x,-.15+i*.045,z);g.add(t);}box(g,x*.6,-.2,z,.5,.045,.1,0x4e7789);}});
 make('steering',[0,.43,1.42],[0,.3,1],g=>{cylinder(g,0,0,0,.045,1.6,0x9ac1c8,'x');box(g,0,.1,0,.3,.15,.2,0x4b6c7d);});
 make('battery12',[-.53,.67,c.layout==='rear'?1.2:.6],[-1.3,1,0],g=>{box(g,0,0,0,.28,.23,.35,0x364b5e);for(const x of [-.09,.09])box(g,x,.14,0,.04,.04,.07,x<0?0xe37f65:0x7ed4cd);});
 make('engine',[0,.65,engineZ],[0,1.4,c.layout==='rear'?-1:1],g=>{box(g,0,0,0,.6,.42,.65,0x6c8a9b);box(g,0,.26,0,.65,.12,.7,0x9aaeb9);for(let i=0;i<(c.id==='fiat500'?2:4);i++){cylinder(g,(i-(c.id==='fiat500'?.5:1.5))*.14,.35,0,.055,.08,0xe4ad6d);box(g,(i-1.5)*.13,0,.36,.04,.1,.1,0x446674);}cylinder(g,.36,0,0,.13,.08,0x263e50,'x');});
 make('transmission',[.35,.46,engineZ-.15],[1,1,0],g=>{box(g,0,0,0,.35,.3,.4,0x738896);cylinder(g,0,0,.2,.18,.1,0x9badb7,'z');});
 make('intake',[0,1.04,engineZ],[0,1.6,0],g=>{box(g,0,0,0,.4,.12,.3,0x263e51);cylinder(g,.2,0,.1,.065,.35,0x617e91,'x');});
 make('radiator',[0,.65,1.94],[0,.4,1.5],g=>{box(g,0,0,0,1,.45,.08,0x506e7c);for(let i=0;i<16;i++)box(g,-.45+i*.06,0,.055,.012,.42,.015,0xa1c5c8);});
 make('alternator',[.43,.63,engineZ],[1.3,.8,.3],g=>{cylinder(g,0,0,0,.12,.22,0xa9b5be,'z');cylinder(g,0,0,.13,.07,.04,0x2b414f,'z');});
 make('fuel',[0,.45,c.layout==='rear'?1:-1.1],[0,.4,-1.5],g=>box(g,0,0,0,.9,.22,.5,0x82745a));
 make('exhaust',[.55,.25,-1.3],[1,-.05,-1],g=>{cylinder(g,0,0,0,.05,1,0x82909c,'z');cylinder(g,0,0,.2,.12,.4,0x9eacb4,'z');});
 make('traction',[0,.31,0],[0,.75,0],g=>{box(g,0,0,0,1.45,.2,2.5,0x314e69);for(let i=0;i<12;i++)box(g,0,.12,-1.1+i*.2,1.3,.025,.13,0x5d92af);});
 make('motor',[0,.52,-1.36],[0,1.2,-1],g=>{cylinder(g,0,0,0,.22,.58,0x809bad,'x');for(const x of [-.32,.32])cylinder(g,x,0,0,.16,.06,0x77c5c1,'x');});
 make('inverter',[0,.88,-1.35],[0,1.7,-.5],g=>{box(g,0,0,0,.65,.18,.45,0x72949c);for(let i=0;i<9;i++)box(g,-.27+i*.065,.13,0,.02,.1,.4,0xa0b5bf);});
 make('reduction',[.38,.5,-1.4],[1,.6,-.8],g=>{cylinder(g,0,0,0,.18,.15,0xadb5b3,'x');box(g,0,0,.15,.2,.22,.25,0x6e8e9e);});
 make('thermal',[0,.66,1.5],[0,1,1],g=>{box(g,0,0,0,.8,.3,.15,0x68a3b1);cylinder(g,.3,-.1,-.1,.12,.2,0x8ab7bb);});
 make('charger',[0,.75,-.85],[0,1.4,-1.3],g=>box(g,0,0,0,.6,.16,.4,0x8aa1b3));
 make('port',[-.96,.85,-1.65],[-1.4,.7,-.5],g=>{cylinder(g,0,0,0,.1,.09,0x6ee5d7,'x');box(g,0,0,0,.08,.24,.25,0x415a6a);});
 lab.visible=systemMode;
 }
 function appearance(){for(const item of assetMaterials){const {m,opacity,transparent,depthWrite}=item;m.transparent=systemMode&&xray?true:transparent;m.opacity=systemMode&&xray?Math.min(opacity,.12):opacity;m.depthWrite=systemMode&&xray?false:depthWrite;m.needsUpdate=true;}if(currentAsset)currentAsset.visible=!systemMode||xray;lab.visible=systemMode;}
 async function setCar(next,parts){const rev=++revision;car=next;selected=null;targetExplode=0;explode=0;label.hidden=true;buildLab(car,parts);if(currentAsset){assetRoot.remove(currentAsset);disposeObject(currentAsset);currentAsset=null;}assetMaterials=[];onStatus('loading',`Loading ${car.name}…`);reset();
 try{const gltf=await loader.loadAsync(modelUrl(car));if(rev!==revision){disposeObject(gltf.scene);return;}const root=gltf.scene;root.rotation.y=car.yaw;root.updateMatrixWorld(true);let bounds=new THREE.Box3().setFromObject(root),size=bounds.getSize(new THREE.Vector3());const scale=4.7/Math.max(size.x,size.z);root.scale.setScalar(scale);root.updateMatrixWorld(true);bounds=new THREE.Box3().setFromObject(root);const center=bounds.getCenter(new THREE.Vector3());root.position.set(-center.x,-bounds.min.y,-center.z);root.traverse(o=>{if(!o.isMesh)return;o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();for(const m of [].concat(o.material))assetMaterials.push({m,opacity:m.opacity,transparent:m.transparent,depthWrite:m.depthWrite});});currentAsset=root;assetRoot.add(root);appearance();onStatus('ready',`${car.name} · real 3D asset loaded`);
 }catch(error){if(rev!==revision)return;systemMode=true;xray=false;appearance();onStatus('error',`${car.name} asset could not load. Educational systems remain available.`);console.warn('Model load failed:',error.message);}}
 function setMode(value,transparent=false){systemMode=value;xray=transparent;appearance();if(!value){selected=null;label.hidden=true;}}
 function select(id){selected=groups.get(id)||null;for(const [pid,g] of groups)g.traverse(o=>{if(o.material){o.material.emissive.setHex(pid===id?0x38d5c2:0x0c3738);o.material.emissiveIntensity=pid===id?.7:.15;}});if(selected){focusTarget=selected.position.clone();focusPosition=camera.position.clone().sub(controls.target).normalize().multiplyScalar(5).add(focusTarget);}}
 function framing(){return Math.max(1,.57/camera.aspect);}
 function view(which){focusTarget=new THREE.Vector3(0,.65,0);focusPosition=(which==='top'?new THREE.Vector3(0,9,.001):which==='side'?new THREE.Vector3(8,1.3,0):new THREE.Vector3(7,4.3,7)).multiplyScalar(framing());}
 function reset(){focusTarget=null;focusPosition=null;controls.target.set(0,.65,0);camera.position.set(7,4.3,7).multiplyScalar(framing());controls.update();}
 renderer.domElement.addEventListener('pointerdown',e=>{activePointers.add(e.pointerId);if(activePointers.size>1)multiTouch=true;pointerStart={x:e.clientX,y:e.clientY};focusTarget=null;focusPosition=null;});
 renderer.domElement.addEventListener('pointerup',e=>{activePointers.delete(e.pointerId);const skip=multiTouch;if(!activePointers.size)multiTouch=false;const start=pointerStart;pointerStart=null;if(skip||!start||Math.hypot(e.clientX-start.x,e.clientY-start.y)>8||!systemMode)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(lab.children,true);if(hits.length)onSelect(hits[0].object.userData.partId);});
 renderer.domElement.addEventListener('pointercancel',e=>{activePointers.delete(e.pointerId);pointerStart=null;if(!activePointers.size)multiTouch=false;});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();paused=true;onStatus('error','3D graphics context lost. Reload to restore the car.');});
 const resize=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(!selected)reset();});resize.observe(host);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let frame=0;
 function animate(){frame=requestAnimationFrame(animate);if(paused||document.hidden)return;explode=THREE.MathUtils.lerp(explode,targetExplode,reduced?1:.08);for(const g of groups.values())g.position.copy(g.userData.home).addScaledVector(g.userData.explode,explode);if(focusTarget){controls.target.lerp(focusTarget,reduced?1:.06);camera.position.lerp(focusPosition,reduced?1:.06);if(camera.position.distanceTo(focusPosition)<.01){focusTarget=null;focusPosition=null;}}controls.update();if(selected&&systemMode){const p=selected.getWorldPosition(new THREE.Vector3()).project(camera);label.hidden=p.z>1||Math.abs(p.x)>.95||Math.abs(p.y)>.95;if(!label.hidden){label.style.left=`${(p.x*.5+.5)*host.clientWidth}px`;label.style.top=`${(-p.y*.5+.5)*host.clientHeight}px`;}}renderer.render(scene,camera);}
 animate();return {setCar,setMode,select,view,reset,setExplode:v=>{targetExplode=v;if(v>0)view('perspective');},setRotate:v=>{controls.autoRotate=v;},dispose(){cancelAnimationFrame(frame);resize.disconnect();draco.dispose();controls.dispose();clearLab();if(currentAsset)disposeObject(currentAsset);env.dispose();renderer.dispose();}};
}
