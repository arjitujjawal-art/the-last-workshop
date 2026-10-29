import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { EXHIBITS, simulate, validateConfig, guideMessages, validateProposal, parseProposal } from '../src/engine.js';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const production=process.argv.includes('--production');
const port=Number(process.env.PORT||4173);
const vite=production?null:await createViteServer({root,server:{middlewareMode:true},appType:'spa'});
let busy=false;
const schema={type:'object',properties:{explanation:{type:'string'},actions:{type:'array',maxItems:3,items:{type:'object',properties:{control:{type:'string'},value:{type:'number'}},required:['control','value'],additionalProperties:false}},sources:{type:'array',items:{type:'string'}},uncertainty:{type:'string'}},required:['explanation','actions','sources','uncertainty'],additionalProperties:false};
const reply=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
async function installed(){const r=await fetch('http://127.0.0.1:11434/api/tags',{signal:AbortSignal.timeout(3000)});if(!r.ok)throw new Error('Ollama is unavailable.');return (await r.json()).models.map(m=>m.name);}
async function readBody(req){let data='';for await(const chunk of req){data+=chunk;if(data.length>12000)throw new Error('Request too large.');}return JSON.parse(data);}
const server=http.createServer(async(req,res)=>{
  const host=req.headers.host||'';
  if(![`127.0.0.1:${port}`,`localhost:${port}`].includes(host))return reply(res,403,{error:'Loopback requests only.'});
  if(req.headers.origin&&!['http://'+host].includes(req.headers.origin))return reply(res,403,{error:'Cross-origin requests are disabled.'});
  const path=new URL(req.url,`http://${host}`).pathname;
  if(path==='/api/status'&&req.method==='GET'){
    try{return reply(res,200,{available:true,models:await installed(),provider:'Ollama',cost:'No API charge. Runs on this computer.'});}
    catch{return reply(res,200,{available:false,models:[],error:'Start Ollama to use the local AI guide. The exhibits work without it.'});}
  }
  if(path==='/api/guide'&&req.method==='POST'){
    if(busy)return reply(res,429,{error:'Another local inference is running. Try again when it finishes.'});
    let locked=false;
    try{
      const body=await readBody(req);
      const {id,config,model}=body;
      if(!Number.isInteger(body.seed)||body.seed<0||body.seed>100000)throw new Error('Invalid seed.');
      if(typeof body.question!=='string'||body.question.length>1200)throw new Error('Question must be under 1,200 characters.');
      validateConfig(id,config);
      if(typeof model!=='string'||!(await installed()).includes(model))throw new Error('Choose an installed Ollama model. No model is downloaded automatically.');
      busy=true;locked=true;const start=performance.now();
      const constrained=structuredClone(schema);
      constrained.properties.actions.maxItems=EXHIBITS[id].controls.length;
      constrained.properties.sources.items.enum=[EXHIBITS[id].source];
      constrained.properties.actions.items.properties.control.enum=EXHIBITS[id].controls.map(c=>c.id);
      const response=await fetch('http://127.0.0.1:11434/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,stream:false,format:constrained,messages:guideMessages(id,simulate(id,config,body.seed),config,body.question),options:{temperature:0,num_predict:450,num_ctx:4096}}),signal:AbortSignal.timeout(120000)});
      if(!response.ok)throw new Error('Ollama could not complete this request.');
      const data=await response.json();const proposal=validateProposal(id,parseProposal(data.message?.content||''));
      return reply(res,200,{proposal,trace:{provider:'Ollama',model,latencyMs:Math.round(performance.now()-start),outputTokens:data.eval_count,inputTokens:data.prompt_eval_count,apiCostUSD:0,validation:'accepted',timestamp:new Date().toISOString()}});
    }catch(error){return reply(res,422,{error:error.name==='TimeoutError'?'The model timed out. Try a smaller model.':error.message});}
    finally{if(locked)busy=false;}
  }
  if(path.startsWith('/api/'))return reply(res,404,{error:'Unknown endpoint.'});
  if(!production)return vite.middlewares(req,res,()=>reply(res,404,{error:'Not found'}));
  if(!['GET','HEAD'].includes(req.method))return reply(res,405,{error:'Method not allowed.'});
  try{
    const directory=resolve(root,'dist');const file=resolve(directory,'.'+decodeURIComponent(path==='/'?'/index.html':path));
    if(!file.startsWith(directory+sep))return reply(res,403,{error:'Invalid path.'});
    if(!(await stat(file)).isFile())return reply(res,404,{error:'Not found'});
    const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.webmanifest':'application/manifest+json'};
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:await readFile(file));
  }catch{return reply(res,404,{error:'Not found'});}
});
server.listen(port,'127.0.0.1',()=>console.log(`The Last Workshop: http://127.0.0.1:${port}\nLocal AI bridge: Ollama on this computer. No external API calls.`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await vite?.close();server.close(()=>process.exit(0));});

