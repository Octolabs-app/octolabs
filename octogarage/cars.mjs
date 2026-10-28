import {common,petrol,electric} from './data.mjs';
// Artist-created representations, not manufacturer CAD. Credits verified 2026-10-28.
export const cars = [
 {id:'fiat500',name:'Fiat 500',edition:'Classic · rear-engine petrol',make:'FIAT',file:'fiat_500_classic',author:'Francesco Coldesina',source:'https://sketchfab.com/3d-models/fiat-500-4606659ff31142e3b8080f995514452f',layout:'rear',fuel:'petrol',length:2.97,yaw:0,description:'A small classic with a rear-mounted engine. Start here to explore a simple powertrain.'},
 {id:'mini',name:'MINI Cooper S',edition:'Petrol · front-engine',make:'MINI',file:'mini_cooper_s',author:'cenobyte',source:'https://sketchfab.com/3d-models/mini-cooper-s-b262744901a04cda823f17289d1a4847',layout:'front',fuel:'petrol',length:3.63,yaw:Math.PI,description:'A compact petrol hatchback. Compare its front-mounted powertrain with the classic Fiat. Exact year and engine variant are unverified.'},
 {id:'tesla',name:'Tesla Model 3',edition:'Electric · battery-floor architecture',make:'TESLA',file:'tesla_model_3',author:'David_Holiday',source:'https://sketchfab.com/3d-models/tesla-model-3-123c10f376ec4f18b93c73afc382808b',layout:'electric',fuel:'electric',length:4.69,yaw:0,description:'An electric saloon. The educational overlay uses a rear-drive arrangement; production variants can also have a front motor.'}
];
export const modelUrl = car => `https://sceneview.github.io/models/platforms/${car.file}.glb`;
export const thumbnailUrl = car => `https://sceneview.github.io/models/platforms/thumbnails/${car.file}.webp`;
export const VPIC_BASE='https://vpic.nhtsa.dot.gov/api/vehicles/';
export function partsFor(car) {
 const base=common.map(p=>({...p,connections:[...p.connections]}));
 const ids=car.fuel==='electric'?electric:petrol.filter(p=>!['driveshaft','differential'].includes(p.id)&&!(car.id==='fiat500'&&['radiator','alternator','intake'].includes(p.id)));
 const parts=[...ids.map(p=>({...p,connections:[...p.connections]})),...base];
 const engine=parts.find(p=>p.id==='engine');
 if(engine){engine.name=car.id==='fiat500'?'Air-cooled twin engine':'Petrol engine';engine.job=car.id==='fiat500'?'The classic Fiat 500 uses a rear-mounted, air-cooled two-cylinder engine. Combustion pushes pistons that turn the crankshaft. Cooling fins and forced airflow carry heat away. The overlay is a teaching schematic, not an exact engine casting.':'A petrol engine turns combustion energy into crankshaft rotation. This MINI model represents a front-engine car; the precise engine variant and its internal geometry are not verified. The overlay illustrates the function.';}
 const gearbox=parts.find(p=>p.id==='transmission');
 if(gearbox)gearbox.job='The gearbox changes the ratio between engine speed and wheel speed. This car uses a compact engine/transaxle arrangement rather than the long rear-wheel-drive shaft shown in some educational examples. The overlay is schematic.';
 if(car.id==='fiat500'){const b=parts.find(p=>p.id==='brakes');b.name='Drum brakes';b.summary='Brake shoes press against rotating drums to slow the wheels.';b.job='On a standard classic Fiat 500, hydraulic pressure moves brake shoes against the inside of the drums. Friction turns motion into heat. Modified cars can have different brakes; this schematic represents the original arrangement.';}
 const valid=new Set(parts.map(p=>p.id));
 return parts.map(p=>({...p,connections:p.connections.filter(id=>valid.has(id))}));
}
export function makeModelsUrl(id) {
 if(!/^\d+$/.test(String(id))) throw new Error('Invalid make ID');
 return `${VPIC_BASE}GetModelsForMakeId/${id}?format=json`;
}
export function cleanModels(rows) {
 const seen=new Set();
 return rows.filter(r=>r&&typeof r.Model_Name==='string'&&r.Model_Name.trim()).map(r=>({id:r.Model_ID,name:r.Model_Name.trim()})).filter(r=>{const k=r.name.toLowerCase();if(seen.has(k))return false;seen.add(k);return true;}).sort((a,b)=>a.name.localeCompare(b.name));
}
