const ORIGIN='https://tmumiyekzgafawxdwgxm.supabase.co';
const KEY='sb_publishable_xrQK9pXy3KTvazSmbHScGg_QvHyScNw';
export default async function handler(req,res){
 try{
  if(!['GET','POST','PATCH','PUT','DELETE'].includes(req.method))return res.status(405).end();
  const path=new URL(req.url,'https://tochka.local').searchParams.get('path')||'';
  if(path.length>3000||!/^\/(auth|rest)\/v1\//.test(path)||path.includes('\\'))return res.status(400).json({error:'Invalid path'});
  const target=new URL(path,ORIGIN);
  if(target.origin!==ORIGIN||!/^\/(auth|rest)\/v1\//.test(target.pathname))return res.status(400).end();
  const headers=new Headers({apikey:KEY});
  for(const k of ['authorization','content-type','accept','prefer','range','accept-profile','content-profile','x-client-info'])if(req.headers[k])headers.set(k,req.headers[k]);
  if(!headers.has('authorization'))headers.set('authorization','Bearer '+KEY);
  const body=['GET','HEAD'].includes(req.method)?undefined:typeof req.body==='string'?req.body:Buffer.isBuffer(req.body)?req.body:JSON.stringify(req.body??{});
  if(body&&Buffer.byteLength(body)>1048576)return res.status(413).end();
  const r=await fetch(target,{method:req.method,headers,body,redirect:'manual'});
  res.status(r.status).setHeader('Cache-Control','no-store');
  for(const k of ['content-type','location']){const v=r.headers.get(k);if(v)res.setHeader(k,v)}
  res.send(Buffer.from(await r.arrayBuffer()));
 }catch(e){console.error('gateway',e);res.status(502).json({message:'Сервер временно недоступен'})}
}
