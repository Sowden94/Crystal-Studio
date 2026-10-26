import {atomLimit,bondLimit} from './import-limits.mjs';
const I=()=>({r:[[1,0,0],[0,1,0],[0,0,1]],t:[0,0,0]});
const mv=(a,v)=>a.map(row=>row.reduce((s,x,j)=>s+x*v[j],0));
const mm=(a,b)=>a.map(row=>b[0].map((_,j)=>row.reduce((s,x,k)=>s+x*b[k][j],0)));
const tr=a=>a[0].map((_,j)=>a.map(row=>row[j]));
export function inverseMatrix(a){const [x,y,z]=a,det=x[0]*(y[1]*z[2]-y[2]*z[1])-x[1]*(y[0]*z[2]-y[2]*z[0])+x[2]*(y[0]*z[1]-y[1]*z[0]);if(Math.abs(det)<1e-12)throw Error('Singular symmetry or cell matrix.');return [[y[1]*z[2]-y[2]*z[1],x[2]*z[1]-x[1]*z[2],x[1]*y[2]-x[2]*y[1]],[y[2]*z[0]-y[0]*z[2],x[0]*z[2]-x[2]*z[0],x[2]*y[0]-x[0]*y[2]],[y[0]*z[1]-y[1]*z[0],x[1]*z[0]-x[0]*z[1],x[0]*y[1]-x[1]*y[0]]].map(row=>row.map(v=>v/det))}
export const compose=(a,b)=>({r:mm(a.r,b.r),t:mv(a.r,b.t).map((v,i)=>v+a.t[i])});
export const inverse=g=>{const r=inverseMatrix(g.r);return {r,t:mv(r,g.t).map(v=>-v)}};
export const apply=(g,p)=>mv(g.r,p).map((v,i)=>v+g.t[i]);
export function parseOperation(text){const expressions=text.toLowerCase().replace(/\s/g,'').split(',');if(expressions.length!==3)throw Error('Unsupported CIF symmetry expression.');let r=[],t=[];for(const expression of expressions){let row=[0,0,0],offset=0;const terms=expression.match(/[+-]?[^+-]+/g)||[];if(!terms.length)throw Error('Empty symmetry expression.');for(const term of terms){if(/^[+-]?[xyz]$/.test(term)){row['xyz'.indexOf(term.at(-1))]+=term[0]==='-'?-1:1;}else if(/^[+-]?\d+(?:\/\d+|\.\d+)?$/.test(term)){const [a,b]=term.split('/').map(Number);const v=b===undefined?a:a/b;if(!Number.isFinite(v))throw Error('Invalid symmetry fraction.');offset+=v;}else throw Error('Unsupported symmetry term: '+term)}r.push(row);t.push(offset)}inverseMatrix(r);return {r,t}}
function operations(block){const rows=block.loops.find(l=>l[0]&&('_space_group_symop_operation_xyz'in l[0]||'_symmetry_equiv_pos_as_xyz'in l[0]))||[],map=new Map();if(rows.length>512)throw Error('Too many symmetry operations.');rows.forEach((row,i)=>map.set(String(row._space_group_symop_id||row._symmetry_equiv_pos_site_id||i+1),parseOperation(row._space_group_symop_operation_xyz||row._symmetry_equiv_pos_as_xyz)));return map}
function decode(code,ops){if(!code||code==='.'||code==='?')return I();const match=String(code).match(/^(\d+)(?:[_ ](\d)(\d)(\d))?$/);if(!match||!ops.has(match[1]))throw Error('Missing symmetry operation for bond code '+code);const op=ops.get(match[1]);return {r:op.r.map(row=>row.slice()),t:op.t.map((v,i)=>v+(match[i+2]===undefined?0:Number(match[i+2])-5))}}
const key=g=>[...g.r.flat(),...g.t].map(v=>Math.round(v*1e7)).join(',');
export function completeMolecules(d,block,M,inferBonds,{expandSymmetry=true}={}){
atomLimit(d.atoms.length);
const input=d.atoms,geom=block.loops.filter(l=>l[0]&&'_geom_bond_atom_site_label_1'in l[0]).flat(),ops=operations(block),labels=new Map(input.map((a,i)=>[a.label,i])),edges=input.map(()=>[]);
if(labels.size!==input.length)throw Error('Duplicate CIF atom labels. Review disorder/site identifiers.');
bondLimit(geom.length);let explicit=0,boundary=0;
const localOnly=!expandSymmetry||!M||!input.every(a=>a.fract);
const identity=g=>g.r.every((row,i)=>row.every((x,j)=>Math.abs(x-(i===j?1:0))<1e-9))&&g.t.every(x=>Math.abs(x)<1e-9);
function edge(a,b,g){edges[a].push({j:b,g});edges[b].push({j:a,g:inverse(g)})}
for(const row of geom){const a=labels.get(row._geom_bond_atom_site_label_1),b=labels.get(row._geom_bond_atom_site_label_2);if(a===undefined||b===undefined)continue;
 const first=decode(row._geom_bond_site_symmetry_1,ops),second=decode(row._geom_bond_site_symmetry_2,ops),relative=compose(inverse(first),second);explicit++;
 if(localOnly&&!identity(relative)){if(expandSymmetry&&!M)throw Error('Symmetry-coded bonds require unit-cell/fractional data. Turn off Complete finite molecules to view deposited sites.');boundary++;continue;}
 if(a!==b||!identity(relative))edge(a,b,relative);
}
for(const [a,b]of inferBonds(input,{hydrogenOnly:explicit>0}))edge(a,b,I());
if(localOnly||!explicit){const pairs=new Map();edges.forEach((row,i)=>row.forEach(e=>{if(i!==e.j){const pair=[Math.min(i,e.j),Math.max(i,e.j)];pairs.set(pair.join(','),pair)}}));bondLimit(pairs.size);
 return {...d,bonds:[...pairs.values()],symmetryAdded:0,asymmetricAtoms:input.length,warning:(expandSymmetry?(explicit?'Reported CIF bonds; H bonds inferred':'Deposited coordinates; distance-inferred bonds'):'Deposited sites only; '+boundary+' boundary bond(s) omitted; '+(explicit?'reported local bonds; H bonds inferred':'distance-inferred local bonds'))+' · verify coordination/contacts'};
}
const out=[],bonds=[],bondSet=new Set(),vertices=new Map(),states=new Set(),queue=[],counts=new Map(),Mi=inverseMatrix(M);let maxAtoms=Math.min(2000,Math.max(500,input.length*20));
function vertex(i,g){const f=apply(g,input[i].fract),positionKey=i+':'+f.map(v=>Math.round(v*1e6)).join(',');if(vertices.has(positionKey))return vertices.get(positionKey);if(out.length>=maxAtoms)throw Error('Symmetry links form an extended network or exceed the molecule limit. Turn off Complete finite molecules to view deposited sites.');const a=input[i],copy=counts.get(i)||0;counts.set(i,copy+1);const R=mm(mm(M,g.r),Mi),U=a.U?mm(mm(R,a.U),tr(R)):null;const idx=out.length;out.push({...a,sourceLabel:a.label,label:copy?a.label+'′'+(copy>1?copy:'' ):a.label,p:mv(M,f),fract:f,U});vertices.set(positionKey,idx);return idx}
function enqueue(i,g){const state=i+':'+key(g);if(states.has(state))return;states.add(state);if(states.size>20000)throw Error('Symmetry completion exceeds the supported finite-molecule limit.');const idx=vertex(i,g);queue.push({i,g,idx})}
input.forEach((_,i)=>enqueue(i,I()));for(let q=0;q<queue.length;q++){const current=queue[q];for(const e of edges[current.i]){const next=compose(current.g,e.g),j=vertex(e.j,next);if(j!==current.idx){const pair=[Math.min(j,current.idx),Math.max(j,current.idx)],k=pair.join(',');if(!bondSet.has(k)){bondSet.add(k);bonds.push(pair);bondLimit(bonds.length)}}enqueue(e.j,next)}}
return {...d,atoms:out,bonds,symmetryAdded:out.length-input.length,asymmetricAtoms:input.length,warning:(out.length>input.length?`Completed molecular symmetry · ${out.length-input.length} atoms generated`:'CIF connectivity')+' · reported bonds; H bonds inferred · packing not expanded'}
}
