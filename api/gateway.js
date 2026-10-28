const ORIGIN='https://tmumiyekzgafawxdwgxm.supabase.co';
const KEY='sb_publishable_xrQK9pXy3KTvazSmbHScGg_QvHyScNw';
const METHODS=new Set(['GET','POST','PATCH','DELETE','PUT']);
module.exports=async function handler(req,res){
 try{
  if(!METHODS.has(req.method))return res.status(405).send('Method not allowed');
  const raw=new URL(req.url,'https://example.invalid').searchParams.get('path')||'';
  if(raw.length>3000||!/^\/(auth|rest)\/v1\//.test(raw)||raw.includes('\\'))return res.status(400).send('Invalid path');
  const target=new URL(raw,ORIGIN);
  if(target.origin!==ORIGIN||!/^\/(auth|rest)\/v1\//.test(target.pathname))return res.status(400).send('Invalid target');
  const headers={apikey:KEY};
  for(const key of ['authorization','content-type','accept','prefer','range','accept-profile','content-profile','x-client-info'])if(req.headers[key])headers[key]=req.headers[key];
  if(!headers.authorization)headers.authorization='Bearer '+KEY;
  const init={method:req.method,headers,redirect:'manual',signal:AbortSignal.timeout(12000)};
  if(req.method!=='GET'){
   let body=req.body;
   if(body!==undefined&&body!==null){
    if(Buffer.isBuffer(body))init.body=body;
    else if(typeof body==='string')init.body=body;
    else init.body=JSON.stringify(body);
    if(Buffer.byteLength(init.body)>1048576)return res.status(413).send('Too large');
   }
  }
  const upstream=await fetch(target,init);
  res.status(upstream.status).setHeader('Cache-Control','no-store');
  for(const h of ['content-type','location']){const v=upstream.headers.get(h);if(v)res.setHeader(h,v)}
  const payload=Buffer.from(await upstream.arrayBuffer());
  return res.send(payload);
 }catch(e){console.error(e?.message);return res.status(502).json({message:'Сервер временно недоступен'})}
};