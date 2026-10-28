const ORIGIN='https://tmumiyekzgafawxdwgxm.supabase.co';
const KEY='sb_publishable_xrQK9pXy3KTvazSmbHScGg_QvHyScNw';
export async function onRequest({request}){
 try {
  if(!['GET','POST','PATCH','PUT','DELETE'].includes(request.method))return new Response('Method not allowed',{status:405});
  const path=new URL(request.url).searchParams.get('path')||'';
  if(path.length>3000||!/^\/(auth|rest)\/v1\//.test(path)||path.includes('\\'))return new Response('Invalid path',{status:400});
  const target=new URL(path,ORIGIN);
  if(target.origin!==ORIGIN||!/^\/(auth|rest)\/v1\//.test(target.pathname))return new Response('Invalid target',{status:400});
  const headers=new Headers({apikey:KEY});
  for(const key of ['authorization','content-type','accept','prefer','range','accept-profile','content-profile','x-client-info']){const val=request.headers.get(key);if(val)headers.set(key,val)}
  if(!headers.has('authorization'))headers.set('authorization','Bearer '+KEY);
  const body=['GET','HEAD'].includes(request.method)?undefined:await request.arrayBuffer();
  if(body&&body.byteLength>1048576)return new Response('Payload too large',{status:413});
  const response=await fetch(target,{method:request.method,headers,body,redirect:'manual'});
  const out=new Headers({'cache-control':'no-store'});
  for(const k of ['content-type','location']){const v=response.headers.get(k);if(v)out.set(k,v)}
  return new Response(response.body,{status:response.status,headers:out});
 }catch(e){return Response.json({message:'Сервер временно недоступен'},{status:502})}
}
