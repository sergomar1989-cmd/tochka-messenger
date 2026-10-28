const ORIGIN='https://tmumiyekzgafawxdwgxm.supabase.co';
const KEY='sb_publishable_xrQK9pXy3KTvazSmbHScGg_QvHyScNw';
const METHODS=new Set(['GET','POST','PATCH','DELETE','PUT']);
export default async function handler(req){
 try{
  if(!METHODS.has(req.method))return new Response('Method not allowed',{status:405});
  const path=new URL(req.url).searchParams.get('path')||'';
  if(path.length>3000||!/^\/(auth|rest)\/v1\//.test(path)||path.includes('\\'))return new Response('Invalid path',{status:400});
  const target=new URL(path,ORIGIN);
  if(target.origin!==ORIGIN||!/^\/(auth|rest)\/v1\//.test(target.pathname))return new Response('Invalid target',{status:400});
  const h=new Headers({apikey:KEY});
  for(const key of ['authorization','content-type','accept','prefer','range','accept-profile','content-profile','x-client-info']){const v=req.headers.get(key);if(v)h.set(key,v)}
  if(!h.has('authorization'))h.set('authorization','Bearer '+KEY);
  const body=req.method==='GET'?undefined:await req.arrayBuffer();
  if(body&&body.byteLength>1048576)return new Response('Too large',{status:413});
  const result=await fetch(target,{method:req.method,headers:h,body,redirect:'manual',signal:AbortSignal.timeout(12000)});
  const headers=new Headers({'cache-control':'no-store'});
  for(const k of ['content-type','location']){const v=result.headers.get(k);if(v)headers.set(k,v)}
  return new Response(result.body,{status:result.status,headers});
 }catch(e){console.error(e?.message);return Response.json({message:'Сервер временно недоступен'},{status:502})}
}
