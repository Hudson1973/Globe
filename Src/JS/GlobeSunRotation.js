function TimestampToAngle(dateTime) {
    // Let's imagine that the sun rotates around the Earth.
    // The sun is on a disc that is tilted at 23.45 degrees
    // At 12:00 on June 21st 2000, the sun is at the highest
    // (y axis) point of the disc, looking down at the earth.
    //
    // At both equinoxes, the sun is on the same y postion
    // as the earth (y = 0).
    //
    // At 00:00 on December 21st, the sun is at the lowest 
    // y point and looks up at the earth.

    // Check validity of dateTime
    // 1) is there a value
    // 2) Is it a valid timestamp
    console.log(dateTime.toDateString);
/*     if(!isDate(dateTime))
        throw 'TimestampToAngle requires a date'; */

    // We're going to start with our assumption that on
    // 2000 : 06 : 21 : 12 : 00 : 00 the sun is at its peak
    // We also assume that one full rotation takes:
    // 365 days, 6 hours and 9 minutes.
    // This equates to 525969 minutes to rotate once.
    const minutesPerRotation = 525969.00;
    const baseDate = new Date('2000/06/21 12:00');

    const radiansPerMinute = (Math.PI *  2) / minutesPerRotation;
    const degreesPerMinute = 360 / minutesPerRotation;
    
    // date - date retriuens milliseconds so divide by 1000 then 60 to get the difference  in minutes
    const minutesSinceBaseDate = (dateTime - baseDate) / 1000 / 60;
    console.log("Minutes since 2000: " + minutesSinceBaseDate);

    const angleRadians = minutesSinceBaseDate * radiansPerMinute;
    console.log("Angle: " + angleRadians);

    return angleRadians;
}

function isDate(input) {
    if (Object.prototype.toString.call(input) === "[object Date]")
      return true;
    return false;
}

function radianRotationForTime(time) {
    if(!isDate(time))
        throw "radianRotationFporTime argument not in DateTime format";

    return minutesInRadians((time.getUTCHours() * 60) + time.getUTCMinutes());
}

function minutesInRadians(minutes) {
    return minutes * Math.PI / 720;
}

export {TimestampToAngle as default, radianRotationForTime};