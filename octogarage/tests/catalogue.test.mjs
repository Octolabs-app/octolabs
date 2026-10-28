import test from 'node:test';
import assert from 'node:assert/strict';
import {cars,partsFor,cleanModels,makeModelsUrl,modelUrl} from '../cars.mjs';
import {discussionLinks,filterParts} from '../data.mjs';
test('real models have distinct licensed sources and assets',()=>{
 assert.ok(cars.length>=3);assert.equal(new Set(cars.map(c=>c.source)).size,cars.length);
 for(const car of cars){assert.match(car.source,/^https:\/\/sketchfab.com\/3d-models\//);assert.match(modelUrl(car),/^https:\/\/sceneview.github.io\/models\/platforms\/.+\.glb$/);assert.ok(car.author);}
});
test('every teaching component has working connections and descriptions for each car',()=>{
 for(const car of cars){const parts=partsFor(car),ids=new Set(parts.map(p=>p.id));assert.equal(ids.size,parts.length);assert.ok(parts.length>=10);for(const p of parts){assert.ok(p.job.length>40);assert.ok(p.symptoms.length);assert.ok(p.connections.every(id=>ids.has(id)),`${car.id}/${p.id}`);}}
});
test('Fiat teaching architecture does not silently use inline-four, radiator or disc brakes',()=>{
 const parts=partsFor(cars.find(c=>c.id==='fiat500'));assert.equal(parts.find(p=>p.id==='engine').name,'Air-cooled twin engine');assert.equal(parts.find(p=>p.id==='brakes').name,'Drum brakes');assert.ok(!parts.some(p=>['radiator','driveshaft','alternator'].includes(p.id)));
});
test('electric car excludes petrol supply components',()=>{const p=partsFor(cars.find(c=>c.id==='tesla'));assert.ok(p.some(p=>p.id==='traction'));assert.ok(!p.some(p=>['fuel','engine','exhaust'].includes(p.id)));});
test('filters combine system and case-insensitive query',()=>{const p=partsFor(cars.find(c=>c.id==='fiat500'));assert.equal(filterParts(p,'Chassis',' BRAKE ')[0].id,'brakes');assert.equal(filterParts(p,'Electrical','brake').length,0);});
test('catalogue handles empty and duplicate API names without fake rows',()=>{
 assert.deepEqual(cleanModels([{Model_Name:'Corolla',Model_ID:1},{Model_Name:' corolla ',Model_ID:2},{Model_Name:''},null,{Model_Name:'Yaris',Model_ID:3}]).map(m=>m.name),['Corolla','Yaris']);assert.deepEqual(cleanModels([]),[]);
});
test('API URLs cannot accept arbitrary paths',()=>{assert.match(makeModelsUrl(448),/GetModelsForMakeId\/448\?format=json$/);assert.throws(()=>makeModelsUrl('../evil'));});
test('forum queries encode vehicle input as search text',()=>{const links=discussionLinks({name:'Brakes'},'GT86 & <script>');for(const link of links){const url=new URL(link.url);assert.equal(url.protocol,'https:');assert.match(url.searchParams.get('q'),/GT86 & <script> Brakes problems/);}});
test('vehicle-specific overrides never mutate shared definitions',()=>{const a=partsFor(cars.find(c=>c.id==='fiat500'));a.find(p=>p.id==='brakes').connections.length=0;const b=partsFor(cars.find(c=>c.id==='mini'));assert.equal(b.find(p=>p.id==='brakes').name,'Disc brakes');assert.ok(b.find(p=>p.id==='brakes').connections.length);});
