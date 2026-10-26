// Constructed octahedral ammine geometry for software demonstrations only.
export function metalSample(){
  const atoms=[{element:'Ni',label:'Ni1',p:[0,0,0]}];
  for(let axis=0;axis<3;axis++)for(const sign of [1,-1]){
    const u=[0,0,0],v=[0,0,0],w=[0,0,0];u[axis]=sign;v[(axis+1)%3]=1;w[(axis+2)%3]=1;
    const p=u.map(x=>x*2.1);atoms.push({element:'N',label:'N'+((atoms.length-1)/4+1),p});
    for(let i=0;i<3;i++){const angle=i*2*Math.PI/3;atoms.push({element:'H',label:'H'+(atoms.filter(a=>a.element==='H').length+1),p:p.map((x,k)=>x+u[k]/3+Math.sqrt(8/9)*(Math.cos(angle)*v[k]+Math.sin(angle)*w[k]))});}
  }
  return {name:'Synthetic nickel ammine',source:'DEMO',atoms,warning:'Constructed nickel ammine test geometry · not an experimental refinement · inferred connections'};
}
