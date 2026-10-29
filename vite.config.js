import { defineConfig } from 'vite';
export default defineConfig({ base: './', worker:{format:'es'}, build: { target: 'es2022', chunkSizeWarningLimit: 700 }, plugins:[{
  name:'workshop-offline-shell',
  generateBundle(_,bundle){
    const files=['./','./favicon.svg',...Object.keys(bundle).map(x=>'./'+x)];
    const key='last-workshop-'+Object.keys(bundle).join('-').replace(/[^a-z0-9]/gi,'').slice(-80);
    this.emitFile({type:'asset',fileName:'sw.js',source:`const KEY=${JSON.stringify(key)};const FILES=${JSON.stringify(files)};self.addEventListener('install',e=>{e.waitUntil(caches.open(KEY).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('last-workshop-')&&k!==KEY).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/api/'))return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||Response.error())))});`});
  }
}] });
