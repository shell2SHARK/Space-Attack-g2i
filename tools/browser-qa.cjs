const fs=require('node:fs'),assert=require('node:assert/strict');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
const ver=await(await fetch('http://127.0.0.1:9223/json/version')).json();
const tabs=await(await fetch('http://127.0.0.1:9223/json/list')).json();
const ws=new WebSocket(tabs[0].webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pending=new Map(),errors=[];
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown'||m.method==='Network.loadingFailed')errors.push(m);};
const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
const ev=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw r.exceptionDetails;return r.result.value;};
const key=(key,type='keyDown')=>call('Input.dispatchKeyEvent',{type,key,code:key===' '?'Space':key.startsWith('Arrow')?key:'Key'+key.toUpperCase(),windowsVirtualKeyCode:key===' '?32:key==='Enter'?13:undefined});
const snap=()=>ev('spaceAttack.snapshot()');
const click=async()=>{const b=await ev('(()=>{let r=document.querySelector("#action").getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()');await call('Input.dispatchMouseEvent',{type:'mousePressed',...b,button:'left',clickCount:1});await call('Input.dispatchMouseEvent',{type:'mouseReleased',...b,button:'left',clickCount:1});};
await call('Runtime.enable');await call('Network.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});await call('Page.navigate',{url:'http://127.0.0.1:8765'});await sleep(600);
fs.mkdirSync('qa-evidence',{recursive:true});const capture=async name=>{const r=await call('Page.captureScreenshot');fs.writeFileSync('qa-evidence/'+name+'.png',Buffer.from(r.data,'base64'));};
assert.equal((await snap()).state,'ready');await sleep(250);assert.equal((await snap()).health,100);await capture('desktop-ready');await click();assert.equal((await snap()).state,'playing');
let a=await snap();await key('d');await key(' ');await sleep(700);await key('d','keyUp');await key(' ','keyUp');let b=await snap();assert(b.player.x>a.player.x&&b.shots>=3);assert.equal(await ev('scrollY'),0);
for(const k of ['a','w','s','ArrowLeft','ArrowUp','ArrowDown','ArrowRight']){await key(k);await sleep(120);await key(k,'keyUp');}
for(const k of ['ArrowLeft','ArrowUp','ArrowRight','ArrowDown']){await key(k);await sleep(3100);await key(k,'keyUp');const s=await snap();assert(s.player.x>=20&&s.player.x<=await ev('spaceAttack.w-20'));assert(s.player.y>=100&&s.player.y<=await ev('spaceAttack.h-45'));}
await capture('desktop-playing');
// Deterministic fixtures isolate collisions inside the actual browser animation loop.
await ev('spaceAttack.start();spaceAttack.enemies=[{x:spaceAttack.player.x,y:spaceAttack.player.y-90,r:16,phase:0,fire:99,color:"#ff618f"}]');await key(' ');await sleep(200);await key(' ','keyUp');assert.equal((await snap()).score,100);assert.equal(await ev('document.querySelector("#score").textContent'),'000100');
await ev('spaceAttack.hostile=[{x:spaceAttack.player.x,y:spaceAttack.player.y,r:5,vx:0,vy:0}]');await sleep(80);assert.equal((await snap()).health,80);assert(await ev('spaceAttack.invulnerable>0'));await capture('hit-feedback');await ev('spaceAttack.hostile=[{x:spaceAttack.player.x,y:spaceAttack.player.y,r:5,vx:0,vy:0}]');await sleep(80);assert.equal((await snap()).health,80);
await ev('window.dispatchEvent(new Event("blur"))');assert.equal((await snap()).state,'paused');assert.equal(await ev('spaceAttack.keys.size'),0);a=await snap();await sleep(150);assert.deepEqual(await snap(),a);await key('Enter');await key('Enter','keyUp');assert.equal((await snap()).state,'playing');
await call('Emulation.setDeviceMetricsOverride',{width:800,height:600,deviceScaleFactor:1,mobile:false});await sleep(100);await capture('compact-playing');assert(await ev('spaceAttack.player.x<=spaceAttack.w-20&&spaceAttack.player.y<=spaceAttack.h-45'));
await ev('spaceAttack.score=700;spaceAttack.hud();for(let i=0;i<4;i++){spaceAttack.invulnerable=0;spaceAttack.damage()}');assert.equal((await snap()).state,'over');assert.equal((await snap()).health,0);await capture('compact-game-over');a=await snap();await sleep(200);assert.deepEqual(await snap(),a);assert((await ev('document.querySelector("#message").textContent')).includes('000700'));
for(let i=0;i<3;i++){if(i===1){await key('Enter');await key('Enter','keyUp');}else await click();b=await snap();assert.equal(b.wave,1);assert.equal(b.score,0);assert.equal(b.health,100);assert.equal(b.enemies,9);assert.equal(b.shots,0);assert.equal(b.hostile,0);assert.equal(await ev('spaceAttack.keys.size'),0);await ev('for(let i=0;i<5;i++){spaceAttack.invulnerable=0;spaceAttack.damage()}');}
await click();let first=(await snap()).difficulty;
for(let wave=1;wave<=2;wave++){await ev('spaceAttack.enemies.forEach(e=>e.y=spaceAttack.h+30)');await sleep(1100);assert.equal((await snap()).wave,wave+1);}
b=await snap();assert(b.difficulty.count>first.count&&b.difficulty.speed>first.speed);await capture('compact-wave3');await key(' ');await sleep(4500);await key(' ','keyUp');b=await snap();assert(b.shots<20&&b.particles<100);assert.equal(errors.length,0);
// Run natural enemy movement/wave escape for 50 seconds; protection fixture avoids unattended death.
await ev('spaceAttack.start();spaceAttack.invulnerable=999');await key(' ');await sleep(50000);await key(' ','keyUp');b=await snap();assert(b.wave>=3);assert(b.shots<20&&b.hostile<100&&b.particles<100);assert.equal(errors.length,0);await capture('extended-natural-waves');
await ev('spaceAttack.pause()');await capture('compact-paused');
const report={browser:ver.Browser,viewports:['1440x900','800x600'],errors,final:b,checks:'PASS: ready/button/start; keyboard WASD/arrows/bounds/held fire+move/no scroll; real frame collision+score/HUD/damage/invulnerability; blur pause/resume; viewport resize; zero-health game-over+freeze; three button/Enter restarts; actual loop escaped-enemy waves to 3/scaling; entity cleanup. Wave/collision fixtures explicitly injected to exercise real browser loop.',screenshots:fs.readdirSync('qa-evidence').filter(x=>x.endsWith('.png'))};fs.writeFileSync('qa-evidence/browser-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));ws.close();
})().catch(e=>{console.error(e);process.exit(1)});
