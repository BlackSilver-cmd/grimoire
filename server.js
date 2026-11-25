// Grimoire Years relay server: no dependencies. Run: node server.js
// Serves the game at / and relays multiplayer messages between players (SSE + POST).
const http=require('http'),fs=require('fs'),path=require('path');
const PORT=process.env.PORT||3000,MAXR=300,MAXC=64;
const rooms=new Map(); // roomName -> Map(clientId -> {res,pres})
const ok=s=>typeof s==='string'&&/^[\w\-.:@+]{1,80}$/.test(s);
const send=(res,ev,data)=>{try{res.write(`event: ${ev}\ndata: ${JSON.stringify(data)}\n\n`)}catch(e){}};
function peers(name){const r=rooms.get(name);return r?[...r].map(([id,c])=>({id,presence:c.pres})):[]}
function pushPeers(name){const r=rooms.get(name);if(!r)return;const p=peers(name);r.forEach(c=>send(c.res,'peers',{peers:p}))}
function body(req,lim,cb){let b='',n=0;req.on('data',d=>{n+=d.length;if(n>lim){req.destroy();return}b+=d});req.on('end',()=>{try{cb(JSON.parse(b||'{}'))}catch(e){cb(null)}})}
http.createServer((req,res)=>{
 const u=new URL(req.url,'http://x');
 if(u.pathname==='/'||u.pathname==='/index.html'){fs.readFile(path.join(__dirname,'index.html'),(e,d)=>{if(e){res.writeHead(500);return res.end('index.html missing')}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});res.end(d)});return}
 if(u.pathname==='/health'){res.writeHead(200);return res.end('ok')}
 const r=u.searchParams.get('r')||'',c=u.searchParams.get('c')||'';
 if(u.pathname==='/mp/stream'&&req.method==='GET'){
  if(!ok(c)||(r&&!ok(r))){res.writeHead(400);return res.end()}
  const name=r||'~lobby';if(!rooms.has(name)){if(rooms.size>=MAXR){res.writeHead(503);return res.end()}rooms.set(name,new Map())}
  const room=rooms.get(name);if(!room.has(c)&&room.size>=MAXC){res.writeHead(503);return res.end()}
  res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','X-Accel-Buffering':'no'});
  res.write('retry: 2000\n\n');
  const old=room.get(c);room.set(c,{res,pres:old?old.pres:{}});send(res,'hello',{id:c});pushPeers(name);
  req.on('close',()=>{const cur=rooms.get(name);if(cur&&cur.get(c)&&cur.get(c).res===res){cur.delete(c);if(!cur.size)rooms.delete(name);else pushPeers(name)}});return}
 if(u.pathname==='/mp/send'&&req.method==='POST'){
  if(!ok(c)||(r&&!ok(r))){res.writeHead(400);return res.end()}
  const name=r||'~lobby';
  body(req,32768,b=>{const room=rooms.get(name),me=room&&room.get(c);if(!b||!me){res.writeHead(404);return res.end()}
   if(b.presence&&typeof b.presence==='object'){if(JSON.stringify(b.presence).length>6000){res.writeHead(413);return res.end()}me.pres=b.presence;pushPeers(name)}
   if(b.emit&&typeof b.emit==='object'&&ok(String(b.emit.topic||''))){const ev={topic:b.emit.topic,data:b.emit.data,from:c};room.forEach(x=>send(x.res,'ev',ev))}
   res.writeHead(204);res.end()});return}
 res.writeHead(404);res.end('not found')}).listen(PORT,()=>console.log('Grimoire Years server on port '+PORT));
setInterval(()=>rooms.forEach(r=>r.forEach(c=>{try{c.res.write(': ping\n\n')}catch(e){}})),15000);
