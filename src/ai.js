import { guideMessages, parseProposal, validateProposal } from './engine.js';
let engine=null;
let browserModel='';
export async function localStatus(){
  const r=await fetch('/api/status',{signal:AbortSignal.timeout(4500)});
  if(!r.ok||!r.headers.get('content-type')?.includes('application/json'))throw new Error('Local bridge is not available on this hosted page.');
  return r.json();
}
export async function browserModels(){
  if(!navigator.gpu)throw new Error('This browser does not expose WebGPU. Use a recent Chrome/Edge browser, or run the local Ollama edition.');
  const lib=await import('@mlc-ai/web-llm');
  return lib.prebuiltAppConfig.model_list.filter(m=>/gemma-4-e2b.*q4f32_1|qwen2.5-0.5b-instruct-q4f32_1/i.test(m.model_id)).map(m=>({id:m.model_id,memory:m.vram_required_MB}));
}
export async function loadBrowserModel(id,onProgress){
  const lib=await import('@mlc-ai/web-llm');
  if(engine)await engine.unload();
  engine=null;browserModel='';
  const worker=new Worker(new URL('./ai-worker.js',import.meta.url),{type:'module'});
  engine=await lib.CreateWebWorkerMLCEngine(worker,id,{initProgressCallback:p=>onProgress(p.text)});
  browserModel=id;
}
export async function askGuide({id,result,config,seed,question,provider,model}){
  if(provider==='local'){
    const r=await fetch('/api/guide',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,config,seed,question,model}),signal:AbortSignal.timeout(125000)});
    const data=await r.json();if(!r.ok)throw new Error(data.error||'The local model could not answer.');return data;
  }
  if(provider!=='browser'||!engine)throw new Error('Connect a local model or load a browser model first. The guided lesson is available without AI.');
  const start=performance.now();
  const response=await engine.chat.completions.create({messages:guideMessages(id,result,config,question),temperature:0,max_tokens:450,response_format:{type:'json_object'}});
  const proposal=validateProposal(id,parseProposal(response.choices[0].message.content));
  return {proposal,trace:{provider:'WebLLM',model:browserModel,latencyMs:Math.round(performance.now()-start),outputTokens:response.usage?.completion_tokens,inputTokens:response.usage?.prompt_tokens,apiCostUSD:0,validation:'accepted',timestamp:new Date().toISOString()}};
}
