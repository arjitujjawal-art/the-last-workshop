import {mkdir,writeFile} from 'node:fs/promises';
import {simulate,initialConfig,expertActions,applyProposal} from '../src/engine.js';
const rows=[];
for(const id of ['radio','telegraph','modem'])for(let seed=1;seed<=20;seed++){
  const config=initialConfig(id,seed),before=simulate(id,config,seed),actions=expertActions(id,before);
  const after=simulate(id,applyProposal(id,config,{explanation:'Deterministic reference repair',actions,sources:[]}),seed);
  rows.push({exhibit:id,seed,before:before.metrics,actions,after:after.metrics,recovered:after.restored});
}
const report={kind:'deterministic simulation regression; NOT an AI benchmark',cases:rows.length,passed:rows.filter(x=>x.recovered).length,rows};
await mkdir('evidence',{recursive:true});await writeFile('evidence/simulation-evaluation.json',JSON.stringify(report,null,2)+'\n');console.log(`${report.passed}/${report.cases} deterministic cases restored. This does not measure AI ability.`);
if(report.passed!==report.cases)process.exitCode=1;
