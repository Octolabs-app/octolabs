// Conservative labels for authored geometry. Unknown names remain source geometry,
// rather than being presented as mechanically verified internals.
export function classifyMesh(name) {
 const text=String(name).toLowerCase();
 if(/tyre|tire|wheel|rim/.test(text))return 'wheels';
 if(/caliper|brake|rotor/.test(text))return 'brakes';
 if(/glass|window|windscreen|windshield/.test(text))return 'glass';
 if(/seat|interior|dashboard|cockpit/.test(text))return 'interior';
 if(/engine|cylinder|crankcase/.test(text))return 'engine';
 if(/exhaust|muffler/.test(text))return 'exhaust';
 if(/suspension|strut|damper|spring/.test(text))return 'suspension';
 return 'body';
}
export function sourceLabel(name,index) {
 const clean=String(name||'').replace(/[_|]/g,' ').replace(/([a-z])([A-Z])/g,'$1 $2').trim();
 return clean&&!/^(object|mesh|geometry|primitive|default|material)[ .\d_-]*$/i.test(clean)?clean.slice(0,65):`Surface ${String(index+1).padStart(2,'0')}`;
}
