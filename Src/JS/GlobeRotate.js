function rotatePointAroundGlobe(globeTangentLat, globeTangentLong, pointLat, pointLong, radius) {
    const cosPLat = Math.cos(inRadians(pointLat));
    const sinPLat = Math.sin(inRadians(pointLat));

    const xCentre = 0;
    const yCentre = radius * Math.cos(inRadians(globeTangentLat)) * sinPLat;
    const zCentre = Math.sin(inRadians(globeTangentLat)) * sinPLat;
    const zRange = cosPLat * Math.cos(inRadians(globeTangentLat));
    const xEnd = xCentre + (radius * cosPLat * Math.sin(inRadians(pointLong - globeTangentLong)));
    const yEnd = yCentre - (radius * cosPLat * Math.cos(inRadians(pointLong - globeTangentLong)) * Math.sin(inRadians(globeTangentLat)));
    const zEnd = zCentre + (zRange * Math.cos(inRadians(pointLong - globeTangentLong)));

    //console.log("latitude:" + globeTangentLat + " longitude:" + globeTangentLong + " Radius:" + radius + 
    //   " Point Lat:" + pointLat + " Point Long:" + pointLong + " x:" + xEnd + " y:" + yEnd + " z:" + zEnd);

    return {
        'xPoint' : xEnd,
        'yPoint' : yEnd,
        'zPoint' : zEnd      
    };
}

// This takes a point of longitude and latitude and the radius of the globe and returns 
// a 3d vector (x, y, z) as a point on a sphere that's z,x,y centre is 0,0,0.
// Latitude and longtitude 
function gcsToCartesian(pointLat,pointLong, radius) {
    const cosLatitude = Math.cos(inRadians(pointLat));

    //const xPoint = Math.sin(inRadians(pointLong)) * cosLatitude * radius;
    //const yPoint = cosLatitude * radius;
    //const zPoint = Math.cos(inRadians(pointLong)) * cosLatitude * radius;

    const xPoint = Math.cos(inRadians(pointLong)) * cosLatitude * radius * -1;
    const zPoint = cosLatitude * Math.sin(inRadians(pointLong)) * radius;
    const yPoint = Math.sin(inRadians(pointLat)) * radius * -1;

    return {
        'xPoint' : xPoint,
        'yPoint' : yPoint,
        'zPoint' : zPoint      
    };
}

function inRadians (angleInDegrees) {
    return (angleInDegrees * Math.PI / 180);
}



export {rotatePointAroundGlobe, gcsToCartesian}