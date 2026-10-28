import { onRequestPost } from '../src/push-send.js';
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).end();
 const headers=new Headers();
 for(const [k,v] of Object.entries(req.headers))if(typeof v==='string')headers.set(k,v);
 const body=typeof req.body==='string'?req.body:JSON.stringify(req.body??{});
 const request=new Request('https://tochka.local/api/push-send',{method:'POST',headers,body});
 const pending=[];
 const context={waitUntil(p){pending.push(Promise.resolve(p))}};
 try{
  const response=await onRequestPost({request,env:process.env,context});
  await Promise.allSettled(pending);
  res.status(response.status);
  response.headers.forEach((value,key)=>res.setHeader(key,value));
  res.send(await response.text());
 }catch(e){console.error('push-send',e);res.status(500).json({error:'Push unavailable'})}
}
