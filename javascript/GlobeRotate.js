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

function inRadians (angleInDegrees) {
    return (angleInDegrees * Math.PI / 180);
}

export {rotatePointAroundGlobe};