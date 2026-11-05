// The renderer's backing canvas may be 2x the requested CSS dimensions on
// Retina displays. Always copy the complete backing canvas into the output.
export function copyExportFrame(ctx,source,width,height){
  ctx.clearRect(0,0,width,height);
  ctx.drawImage(source,0,0,source.width,source.height,0,0,width,height);
}

// A sphere enclosing the visible atom shapes fits every rotation, including
// space-filling spheres and elongated thermal ellipsoids. Bond thickness is
// included so cylinders cannot extend beyond the fitted envelope.
export function rotationRadius(shapes,bondRadius=0){
  let radius=1.5;
  for(const {position,scale} of shapes){
    const extent=Math.max(Math.abs(scale.x),Math.abs(scale.y),Math.abs(scale.z))*1.01;
    radius=Math.max(radius,Math.hypot(position.x,position.y,position.z)+Math.max(extent,bondRadius));
  }
  return radius;
}

export function exportFrustum(width,height,radius){
  const span=radius*1.2,aspect=width/height;
  return {left:-span*Math.max(1,aspect),right:span*Math.max(1,aspect),top:span*Math.max(1,1/aspect),bottom:-span*Math.max(1,1/aspect)};
}
