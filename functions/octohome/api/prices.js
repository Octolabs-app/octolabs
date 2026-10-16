export const onRequestGet = function priceEndpoint(context){
  return (async()=>{
    const u=new URL(context.request.url),q=(u.searchParams.get('q')||'').trim().replace(/\s+/g,' ');
    const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':status===200?'public, max-age=300':'no-store','X-Content-Type-Options':'nosniff'}});
    if(q.length<2||q.length>60||/[\u0000-\u001f]/.test(q))return reply({error:'Enter a product or brand between 2 and 60 characters.'},400);
    const cacheKey=new Request(u.origin+'/octohome/api/prices?q='+encodeURIComponent(q.toLowerCase()));
    const cached=await caches.default.match(cacheKey);if(cached)return cached;
    const source=new URL('https://winners.mu/filterSearch');
    source.searchParams.set('q',q);source.searchParams.set('cid','0');source.searchParams.set('mid','0');source.searchParams.set('advs','false');source.searchParams.set('isc','false');source.searchParams.set('sid','false');
    try{
      let upstream=await fetch(source,{headers:{Accept:'text/html','User-Agent':'OctoHome/0.2 (+https://octolabs.app/octohome/; user-requested product lookup)'},signal:AbortSignal.timeout(10000),redirect:'manual'});
      if([301,302,307,308].includes(upstream.status)){
        const redirect=new URL(upstream.headers.get('Location')||'',source);
        if(redirect.protocol!=='https:'||!['winners.mu','www.winners.mu'].includes(redirect.hostname))throw Error('Unexpected store redirect');
        upstream=await fetch(redirect,{headers:{Accept:'text/html'},signal:AbortSignal.timeout(10000),redirect:'error'});
      }
      if(!upstream.ok||!upstream.headers.get('Content-Type')?.includes('text/html'))return reply({error:'Winners could not provide product listings. Please use the store website.'},503);
      const reader=upstream.body.getReader(),chunks=[];let bytes=0;
      while(true){const r=await reader.read();if(r.done)break;bytes+=r.value.byteLength;if(bytes>1500000){await reader.cancel();throw Error('Store response too large')}chunks.push(r.value)}
      const all=new Uint8Array(bytes);let at=0;for(const c of chunks){all.set(c,at);at+=c.length}
      const rows=[];let current=null;
      const rewriter=new HTMLRewriter()
        .on('.product-item',{element(){current={name:'',url:'',priceText:'',sku:''};if(rows.length<24)rows.push(current)}})
        .on('.product-item .product-title a',{element(e){if(!current)return;try{const link=new URL(e.getAttribute('href'),source);if(link.protocol==='https:'&&['winners.mu','www.winners.mu'].includes(link.hostname))current.url=link.href}catch{}},text(t){if(current)current.name+=t.text}})
        .on('.product-item .actual-price',{text(t){if(current)current.priceText+=t.text}})
        .on('.product-item .sku',{text(t){if(current)current.sku+=t.text}});
      await rewriter.transform(new Response(all,{headers:{'Content-Type':'text/html'}})).arrayBuffer();
      const checkedAt=new Date().toISOString(),seen=new Set(),products=[];
      for(const row of rows){const price=Number(row.priceText.replace(/Rs\.?\s*/gi,'').replace(/[,\s]/g,''));const name=row.name.replace(/\s+/g,' ').trim();
        if(!name||!row.url||!Number.isFinite(price)||price<=0||seen.has(row.url))continue;
        seen.add(row.url);products.push({name,url:row.url,price,currency:'MUR',sku:row.sku.trim(),store:'Winners',checkedAt});
      }
      const response=reply({products,checkedAt,store:'Winners',currency:'MUR',source:source.href,note:'Online listed prices. Confirm pack size, availability and final checkout price with the retailer.'});
      context.waitUntil(caches.default.put(cacheKey,response.clone()));return response;
    }catch{return reply({error:'The supermarket listing service is temporarily unavailable. Search on Winners directly.'},503)}
  })();
};
