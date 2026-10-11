import {createServer,request as proxyRequest} from 'node:http';
import {createReadStream} from 'node:fs';
import {realpath,stat} from 'node:fs/promises';
import {dirname,extname,isAbsolute,relative,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const website=await realpath(resolve(dirname(fileURLToPath(import.meta.url)),'../..'));
const HOST='127.0.0.1',PORT=5180,API_PORT=5181;
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon','.apk':'application/vnd.android.package-archive'};
const inside=path=>{const r=relative(website,path);return r!== '..'&&!r.startsWith('..'+sep)&&!isAbsolute(r);};
function send(response,status,text){
 response.writeHead(status,{'Content-Type':'text/plain; charset=utf-8','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
 response.end(text);
}

createServer(async(request,response)=>{
 let url;
 try{url=new URL(request.url,`http://${HOST}:${PORT}`);}catch{send(response,400,'Invalid URL.');return;}
 if(url.pathname.startsWith('/octoflag/api/')){
  // Origin and request headers pass through so local API authorization is tested.
  const upstream=proxyRequest({hostname:HOST,port:API_PORT,path:url.pathname+url.search,method:request.method,headers:request.headers},incoming=>{
   response.writeHead(incoming.statusCode??502,incoming.headers);
   incoming.pipe(response);
  });
  upstream.on('error',()=>{if(!response.headersSent)send(response,503,'The local API is not running on port 5181.');else response.destroy();});
  request.on('aborted',()=>upstream.destroy());
  response.on('close',()=>upstream.destroy());
  request.pipe(upstream);
  return;
 }
 if(!['GET','HEAD'].includes(request.method)){send(response,405,'Method not allowed.');return;}
 try{
  const pathname=decodeURIComponent(url.pathname);
  if(pathname.includes('\0')){send(response,400,'Invalid URL.');return;}
  let file=resolve(website,'.'+pathname);
  if(!inside(file)){send(response,404,'Not found.');return;}
  file=await realpath(file);
  if(!inside(file)){send(response,404,'Not found.');return;}
  let info=await stat(file);
  if(info.isDirectory()){
   file=await realpath(resolve(file,'index.html'));
   if(!inside(file)){send(response,404,'Not found.');return;}
   info=await stat(file);
  }
  if(!info.isFile()){send(response,404,'Not found.');return;}
  response.writeHead(200,{'Content-Type':mime[extname(file).toLowerCase()]??'application/octet-stream','Content-Length':info.size,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
  if(request.method==='HEAD'){response.end();return;}
  const stream=createReadStream(file);
  stream.on('error',()=>response.destroy());
  response.on('close',()=>stream.destroy());
  stream.pipe(response);
 }catch(error){send(response,error instanceof URIError?400:404,error instanceof URIError?'Invalid URL.':'Not found.');}
}).listen(PORT,HOST,()=>console.log(`Octolabs preview: http://${HOST}:${PORT}/octoflag/ (API → ${API_PORT})`));
