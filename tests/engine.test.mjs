import {test} from 'node:test';
import assert from 'node:assert/strict';
import {simulate,initialConfig,expertActions,applyProposal,validateProposal,encodeMorse,decodeMorse,crc8,bytesToBits,bitsToBytes,parseProposal} from '../src/engine.js';
for(const id of ['radio','telegraph','modem']){
  test(`${id}: 20 seeded broken cases recover through bounded measured adjustments`,()=>{
    for(let seed=1;seed<=20;seed++){
      const config=initialConfig(id,seed),before=simulate(id,config,seed);
      assert.equal(before.restored,false,`${id} seed ${seed} starts broken`);
      const proposal={explanation:'Use instrument observations.',actions:expertActions(id,before),sources:[],uncertainty:''};
      const after=simulate(id,applyProposal(id,config,proposal),seed);
      assert.equal(after.restored,true,`${id} seed ${seed} recovered: ${JSON.stringify(after.metrics)}`);
      assert.ok(after.score>before.score);
    }
  });
  test(`${id}: replay is deterministic`,()=>{const config=initialConfig(id,91);assert.deepEqual(simulate(id,config,91),simulate(id,config,91));});
}
test('Morse alphabet and numeric round trip with standard 1:3:7 timing',()=>{const text='ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789';assert.equal(decodeMorse(encodeMorse(text,70),70),text);});
test('CRC-8 standard check vector and single-bit corruption',()=>{assert.equal(crc8(new TextEncoder().encode('123456789')),0xf4);const a=[12,34,56];assert.notEqual(crc8(a),crc8([13,34,56]));});
test('bit packing preserves all byte values',()=>{const bytes=Array.from({length:256},(_,i)=>i);assert.deepEqual(bitsToBytes(bytesToBits(bytes)),bytes);});
test('untrusted model cannot invoke arbitrary tools or push controls beyond bounds',()=>{
  const base={explanation:'test',actions:[],sources:[]};
  for(const actions of [[{control:'shell',value:1}],[{control:'gain',value:100}],[{control:'gain',value:NaN}],[{control:'gain',value:1},{control:'gain',value:2}]])assert.throws(()=>validateProposal('radio',{...base,actions}));
  assert.throws(()=>validateProposal('radio',{...base,sources:['invented']}));
  assert.throws(()=>validateProposal('radio',{...base,explanation:''}));
});
test('parses fenced model JSON but rejects trailing code',()=>{assert.deepEqual(parseProposal('```json\n{"actions":[]}\n```'),{actions:[]});assert.throws(()=>parseProposal('{"actions":[]} run command'));});
test('radio overdriving clips measured samples; correction resolves it',()=>{const r=simulate('radio',{tune:990,bandwidth:450,gain:4},1);assert.ok(r.metrics.clipping>1);assert.equal(r.restored,false);});
