const overlaps=(a,b,g=0)=>a.x<b.x+b.w+g&&a.x+a.w>b.x-g&&a.y<b.y+b.h+g&&a.y+a.h>b.y-g;

// Keep label boxes in the paper around the molecule, never over its silhouette.
// The result depends only on geometry, so live views and movie frames agree.
export function layoutMeasurementLabels(labels,atoms,width,height,gap=12,{avoidStructure=true}={}){
  if(!atoms.length)return labels.map(()=>null);
  const bounds={x:Math.min(...atoms.map(a=>a.x-(a.rx||0))),y:Math.min(...atoms.map(a=>a.y-(a.ry||0)))};
  bounds.w=Math.max(...atoms.map(a=>a.x+(a.rx||0)))-bounds.x;
  bounds.h=Math.max(...atoms.map(a=>a.y+(a.ry||0)))-bounds.y;
  const used=[],margin=gap;
  return labels.map(label=>{
    const {w,h,desired,anchor}=label,possible=[];
    const add=(x,y)=>{
      const box={x:x-w/2,y:y-h/2,w,h};
      if(box.x<margin||box.y<margin||box.x+w>width-margin||box.y+h>height-margin||avoidStructure&&overlaps(box,bounds,gap)||used.some(other=>overlaps(box,other,gap)))return;
      possible.push({box,cost:(x-desired.x)**2+(y-desired.y)**2+.08*((x-anchor.x)**2+(y-anchor.y)**2)});
    };
    add(Math.max(margin+w/2,Math.min(width-margin-w/2,desired.x)),Math.max(margin+h/2,Math.min(height-margin-h/2,desired.y)));
    if(label.manual&&possible.length){used.push(possible[0].box);return possible[0].box;}
    const ys=[desired.y,anchor.y,bounds.y+bounds.h/2],xs=[desired.x,anchor.x,bounds.x+bounds.w/2];
    for(let y=margin+h/2;y<=height-margin-h/2;y+=h+gap)ys.push(y);
    for(let x=margin+w/2;x<=width-margin-w/2;x+=w+gap)xs.push(x);
    for(const y of ys){add(bounds.x-gap-w/2,y);add(bounds.x+bounds.w+gap+w/2,y)}
    for(const x of xs){add(x,bounds.y-gap-h/2);add(x,bounds.y+bounds.h+gap+h/2)}
    possible.sort((a,b)=>a.cost-b.cost);
    const box=possible[0]?.box||null;if(box)used.push(box);return box;
  });
}

export function boxEdge(anchor,box){
  const x=box.x+box.w/2,y=box.y+box.h/2,dx=anchor.x-x,dy=anchor.y-y;
  if(!dx&&!dy)return {x,y};
  const t=Math.min(dx?box.w/(2*Math.abs(dx)):Infinity,dy?box.h/(2*Math.abs(dy)):Infinity);
  return {x:x+dx*t,y:y+dy*t};
}
