export function calculateDistanceKm(lat1:number,lon1:number,lat2:number,lon2:number){
 const r=6371; const rad=(n:number)=>n*Math.PI/180;
 const dLat=rad(lat2-lat1),dLon=rad(lon2-lon1);
 const a=Math.sin(dLat/2)**2+Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2;
 return 2*r*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

export function calculateRouteDistance(points:Array<{latitude:number|null;longitude:number|null}>){
 if(points.length<2||points.some(p=>p.latitude===null||p.longitude===null))return null;
 return points.slice(1).reduce((sum,p,i)=>sum+calculateDistanceKm(points[i].latitude!,points[i].longitude!,p.latitude!,p.longitude!),0);
}
