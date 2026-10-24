import {themes} from '../octocross/themes.mjs';
import {generate,validate,signature,VERSION} from '../octocross/engine.mjs';
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
const count=Number(process.env.CROSSWORD_COUNT||25001),seen=new Set(),groups=[];let rejected=0,duplicates=0;
for(const theme of themes){const seeds=[];let seed=1;while(seeds.length<count){const p=generate(theme,seed);const errors=validate(p);if(errors.length){rejected++;seed++;continue;}const hash=createHash('sha256').update(signature(p)).digest('hex');if(seen.has(hash)){duplicates++;seed++;continue;}seen.add(hash);seeds.push(seed++);}
 groups.push({id:theme.id,seeds});console.log(theme.id,seeds.length,'accepted; last seed',seed-1);
}
const catalog={version:VERSION,total:groups.reduce((n,g)=>n+g.seeds.length,0),kind:'Generated grid variations from original themed clue banks',themes:groups};
writeFileSync('octocross/catalog.json',JSON.stringify(catalog));
writeFileSync('octocross/validation.json',JSON.stringify({version:VERSION,total:catalog.total,themes:themes.length,originalClues:themes.reduce((n,t)=>n+t.entries.length,0),uniqueGridHashes:seen.size,rejected,duplicates,checks:['Answers match cells','Connected grid','No parallel overlaps','Every multi-letter run has a clue','No duplicate answer in a puzzle','At least nine answers','SHA-256 grid deduplication across entire catalog']},null,2)+'\n');
console.log('TOTAL',catalog.total,'rejected',rejected,'duplicates',duplicates);
