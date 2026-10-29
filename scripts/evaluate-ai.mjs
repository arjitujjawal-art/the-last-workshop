import {mkdir,writeFile} from 'node:fs/promises';
import {simulate,initialConfig,applyProposal} from '../src/engine.js';
const model=process.env.WORKSHOP_MODEL||'gemma3:1b';
const base=process.env.WORKSHOP_URL||'http://127.0.0.1:4173';
const rows=[];
for(const id of ['radio','telegraph','modem'])for(const seed of [3,7,11]){
  const config=initialConfig(id,seed),before=simulate(id,config,seed);
  try{
    const response=await fetch(base+'/api/guide',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,config,seed,model,question:'Inspect the measurements and propose the best repair. Explain why each adjustment helps.'}),signal:AbortSignal.timeout(130000)});
    const data=await response.json();if(!response.ok)throw new Error(data.error);
    const after=simulate(id,applyProposal(id,config,data.proposal),seed);
    rows.push({id,seed,model,proposal:data.proposal,trace:data.trace,before:before.metrics,after:after.metrics,recovered:after.restored});
    console.log(`${id} seed ${seed}: ${after.restored?'recovered':'not recovered'} (${data.trace.latencyMs}ms)`);
  }catch(e){rows.push({id,seed,model,error:e.message,recovered:false});console.log(`${id} seed ${seed}: ${e.message}`);}
}
const report={kind:'actual local model inference; single attempt per seeded case; engineering notes included in prompt; NOT a held-out generalization benchmark',timestamp:new Date().toISOString(),model,cases:rows.length,validProposals:rows.filter(r=>r.proposal).length,recovered:rows.filter(r=>r.recovered).length,rows};
await mkdir('evidence',{recursive:true});await writeFile('evidence/ai-evaluation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({cases:report.cases,valid:report.validProposals,recovered:report.recovered}));
