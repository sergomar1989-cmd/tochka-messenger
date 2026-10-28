import { buildPushHTTPRequest } from '@pushforge/builder';
const BASE='https://tmumiyekzgafawxdwgxm.supabase.co';
const pub='sb_publishable_xrQK9pXy3KTvazSmbHScGg_QvHyScNw';
async function api(path,token,method='GET',data){const r=await fetch(BASE+path,{method,headers:{apikey:token?'':pub,authorization:'Bearer '+token,'content-type':'application/json',prefer:'return=representation'},body:data?JSON.stringify(data):undefined});if(!r.ok)throw Error('Supabase '+r.status);return r.json()}
async function admin(path,env,method='GET',data){const r=await fetch(BASE+path,{method,headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY,'content-type':'application/json',prefer:'return=representation'},body:data?JSON.stringify(data):undefined});if(!r.ok)throw Error('Database '+r.status);return r.json()}
export async function onRequestPost({request,env,context}){
try{
if(!env.SUPABASE_SERVICE_ROLE_KEY||!env.VAPID_PUBLIC_KEY||!env.VAPID_PRIVATE_KEY||!env.VAPID_SUBJECT)return Response.json({error:'Push not configured'},{status:503});
const bearer=request.headers.get('authorization')||'';if(!/^Bearer [A-Za-z0-9_.-]+$/.test(bearer))return new Response('Unauthorized',{status:401});
const jwt=bearer.slice(7);
const identity=await fetch(BASE+'/auth/v1/user',{headers:{apikey:pub,authorization:'Bearer '+jwt}});
if(!identity.ok)return new Response('Unauthorized',{status:401});
const user=await identity.json();
const body=await request.json();if(!/^[0-9a-f-]{36}$/i.test(body.message_id||''))return new Response('Bad ID',{status:400});
const rows=await admin('/rest/v1/messages?id=eq.'+encodeURIComponent(body.message_id)+'&select=id,body,sender_id,room_id,created_at',env);
const m=rows[0];if(!m||m.sender_id!==user.id||Date.now()-new Date(m.created_at).getTime()>120000)return new Response('Forbidden',{status:403});
const rooms=await admin('/rest/v1/rooms?id=eq.'+m.room_id+'&select=id,team_id,kind',env);
const room=rooms[0];if(!room)return new Response('Not found',{status:404});
let ids=[];
if(room.kind==='general'){const members=await admin('/rest/v1/members?team_id=eq.'+room.team_id+'&select=user_id',env);ids=members.map(x=>x.user_id)}
else{const members=await admin('/rest/v1/room_members?room_id=eq.'+room.id+'&select=user_id',env);const active=await admin('/rest/v1/members?team_id=eq.'+room.team_id+'&select=user_id',env);const allowed=new Set(active.map(x=>x.user_id));ids=members.filter(x=>allowed.has(x.user_id)).map(x=>x.user_id)}
ids=ids.filter(x=>x!==user.id);
const claimed=await fetch(BASE+'/rest/v1/push_dispatches',{method:'POST',headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY,'content-type':'application/json',prefer:'return=minimal'},body:JSON.stringify({message_id:m.id})});
if(!claimed.ok)return Response.json({status:'already_processed'});
const targets=[];
for(const id of ids.slice(0,100)){const rows=await admin('/rest/v1/push_subscriptions?user_id=eq.'+id+'&select=endpoint,p256dh,auth_secret',env);targets.push(...rows)}
context.waitUntil(Promise.allSettled(targets.slice(0,200).map(async sub=>{try{const raw=Uint8Array.from(atob(env.VAPID_PUBLIC_KEY.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));if(raw.length!==65||raw[0]!==4)throw Error('Invalid VAPID public key');const b64=b=>btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');const privateJWK={kty:'EC',crv:'P-256',x:b64(raw.slice(1,33)),y:b64(raw.slice(33,65)),d:env.VAPID_PRIVATE_KEY};const req=await buildPushHTTPRequest({privateJWK,subscription:{endpoint:sub.endpoint,keys:{p256dh:sub.p256dh,auth:sub.auth_secret}},message:{payload:{title:'ТОЧКА · Новое сообщение',body:'Вам пришло новое сообщение',url:'/'},adminContact:env.VAPID_SUBJECT,options:{ttl:86400}}});const resp=await fetch(req.endpoint,{method:'POST',headers:req.headers,body:req.body});if(resp.status===404||resp.status===410)await admin('/rest/v1/push_subscriptions?endpoint=eq.'+encodeURIComponent(sub.endpoint),env,'DELETE');else if(!resp.ok)throw Error('Push service '+resp.status)}catch(e){console.error('push',e.message)}})));
return Response.json({status:'queued',devices:targets.length});
}catch(e){console.error(e);return Response.json({error:'Push unavailable'},{status:500})}
}