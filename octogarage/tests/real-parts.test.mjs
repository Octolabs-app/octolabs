import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyMesh,sourceLabel} from '../real-parts.mjs';
test('unidentified source names do not become invented engines',()=>{
 assert.equal(classifyMesh('Object_27 / Material.003'),'body');
 assert.equal(classifyMesh('wheel_fl / rim'),'wheels');
 assert.equal(classifyMesh('brake_caliper'),'brakes');
});
test('source labels remain text and retain the author label when meaningful',()=>{
 assert.equal(sourceLabel('Object_27',0),'Surface 01');
 assert.equal(sourceLabel('rear_wheel',4),'rear wheel');
 assert.equal(sourceLabel('',2),'Surface 03');
 assert.equal(sourceLabel('a'.repeat(100),0).length,65);
});
