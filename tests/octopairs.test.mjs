import test from 'node:test';
import assert from 'node:assert/strict';
import {deckFor,newGame,flip,settle} from '../octopairs/engine.mjs';
test('1000 seeds per size: each deck contains exactly two of every symbol and is reproducible',()=>{
 for(const size of [6,8,12])for(let i=0;i<1000;i++){
  const d=deckFor(i,size);assert.equal(d.length,size*2);assert.equal(new Set(d.map(c=>c.id)).size,size*2);
  for(const symbol of new Set(d.map(c=>c.symbol)))assert.equal(d.filter(c=>c.symbol===symbol).length,2);
  assert.deepEqual(d,deckFor(i,size));
 }
 assert.notDeepEqual(deckFor('a'),deckFor('b'));
});
test('rejects invalid configurations and illegal flips',()=>{
 assert.throws(()=>newGame('a',7));assert.throws(()=>newGame('a',8,3));
 let s=newGame('a');for(const i of [-1,16,1.5,NaN])assert.equal(flip(s,i),s);
 s=flip(s,0);assert.equal(flip(s,0),s);assert.equal(settle(s),s);
});
test('miss locks board until next turn; duel switches player only on a miss',()=>{
 let s=newGame('duel',6,2);const wrong=s.cards.findIndex(c=>c.symbol!==s.cards[0].symbol);
 s=flip(flip(s,0),wrong);assert.equal(s.moves,1);assert.equal(flip(s,4),s);s=settle(s);assert.equal(s.turn,1);
 const mate=s.cards.findIndex((c,i)=>i!==0&&c.symbol===s.cards[0].symbol);
 s=flip(flip(s,0),mate);assert.deepEqual(s.scores,[0,1]);s=settle(s);assert.equal(s.turn,1);assert.equal(flip(s,mate),s);
});
test('complete games count each pair once and cannot score after finishing',()=>{
 for(const players of [1,2])for(const pairs of [6,8,12]){
  let s=newGame('complete',pairs,players);
  for(const symbol of new Set(s.cards.map(c=>c.symbol))){const indices=s.cards.map((c,i)=>c.symbol===symbol?i:-1).filter(i=>i>=0);s=settle(flip(flip(s,indices[0]),indices[1]));}
  assert.equal(s.done,true);assert.equal(s.moves,pairs);assert.equal(s.scores[0],pairs);assert.equal(flip(s,0),s);
 }
});
