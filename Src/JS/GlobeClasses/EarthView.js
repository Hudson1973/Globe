// EarthView class holds properties about the viewpoint of the Earth.
// This can be interrogated or use the methods to update properties
// (E.g. rotating the earth)

export class EarthView {
    // class private properties
    #latitude = 0.0
    #longitude = 0.0;
    #radius = 6371;
    #FOV = 46;
    #distance = 35000;

    #globePainter = null;
    #cameraPosition = {
        x: 0,
        y: 0,
        z: 0
    };

    constructor(){
        console.log("EarthView.constructor()");
    }
    initGlobePainting(painterReference) {
        // Due to a chicken and egg situation, the GlobePainter object 
        // needs to access camera distance from this EarthView object 
        // to set up. Nonetheless, this EarthView object needs 
        // GlobePainter in order to update the globe.

        // Set reference for repainting once  a transformation has happened
        this.#globePainter = painterReference;
    }

    get latitude() {
        return Math.round(this.#latitude);
    }
    get longitude() {
        return Math.round(this.#longitude);
    }
    get radius() {
        return this.#radius;
    }
    get fieldOfView() {
        return this.#FOV;
    }
    get distance() {
        return this.#distance;
    }
    get cameraPosition() {
        return this.#cameraPosition;
    }

    rotateBy({ latitude, longitude }) {
        this.#latitude += latitude;
        this.#longitude += longitude;

        if (this.#longitude < -180) this.#longitude += 360;
        if (this.#longitude > 180) this.#longitude -= 360;
        if (this.#latitude < -90) this.#latitude = -90;
        if (this.#latitude > 90) this.#latitude = 90;

        this.#globePainter.rotateGlobe(longitude, latitude);
    }
    rotateTo({ latitude, longitude }) {

    }
    rotateNorth() {
        this.rotateBy({
            latitude: 1,
            longitude: 0
        });
    }
    rotateSouth() {
        this.rotateBy({
            latitude: -1,
            longitude: 0
        });
    }
    rotateEast() {
        this.rotateBy({
            latitude: 0,
            longitude: -1
        });
    }
    rotateWest() {
        this.rotateBy({
            latitude: 0,
            longitude: 1
        });
    }

    updatePosition (cameraPosition) {
        if(cameraPosition) {
            this.#cameraPosition = cameraPosition;
        }
    }
    updateDistance() {
        // This assumes that this.#cameraPosition is up to date

        // Distance calculation is hypoteneuse.
        //=SQRT(position.x^2 + position.y^2 + position.z^2)
        this.#distance = 
            Math.sqrt(Math.pow(this.#cameraPosition.x,2) + 
            Math.pow(this.#cameraPosition.y,2) + 
            Math.pow(this.#cameraPosition.z,2));
        
        console.log("Distance is now " + this.#distance + " Km");
    }



    convertCameraCartesianToGeocentric() {
        // Take camera coodinates looking at the origin of the globe and
        // return the geocentric coordinates (latitude & longitude) at the 
        // tangent of the surface of the globe to the camera.

        //    latitude angle = inverse sin(opp / Hypotenuese)
        //    latitude angle = inverse sin(camera y position / distance)
        //
        // IMPORTANT - THIS ASSUMES THE GLOBE IS A PERFECT SPHERE
        this.#latitude = Math.asin(this.cameraPosition.y / this.#distance);
        this.#latitude *= 180 / Math.PI;        // convert to degrees
    
        // Longtitude calculation will use Earth-centered, Earth-fixed (ECEF)
        // system to convert to geodetic coordinates (latitude and longitude)
        // 
        // ECEF coordinates are cartesian coordinates that track sateallites 
        // and things on or inside the earth that can't be represented via
        // geodetic coordinates. This assumes:
        //
        //     x axis interescts the Greenwich (prime) meridian through the 
        //            centre of the globe at origin and through the 180 degree
        //            meridian at the international date line.
        //     y axis intersects at 90 degreess to the x axis (between 90 West 
        //            and 90 East through the earths centre).
        //     z axis from pole to pole through the rotation of the Earth.
        //
        // This is different to the three.js coordinate system. SO effectively:
        //
        //     ECEF x axis = three.js z axis
        //     ECEF y axis = three.js x axis
        //     ECEF z axis = three.js y axis
        //
        //     More info about ECEF to geodetic coordinates at:
        //     https://uk.mathworks.com/help/aeroblks/ecefpositiontolla.html
        //
        //    Longitude angle = inverse tan( Px / Py)
        //    Longitude angle = inverse tan ( camera z posiotion / camera x position )
        this.#longitude = Math.atan(this.cameraPosition.z / this.cameraPosition.x);
        this.#longitude *= 180 / Math.PI;        // convert to degrees
        if (this.#cameraPosition.x > 0) {
            this.#longitude *= -1;
        } else {
            if (this.cameraPosition.z < 0) {
                this.#longitude = 90 + (90 - this.#longitude);
            } else {
                this.#longitude *= -1;
                this.#longitude -= 180;
            }
        }

        console.log("Y = " + Math.floor(this.cameraPosition.y) + " Latitude = " + Math.round(this.#latitude));
        console.log("X: " + Math.floor(this.cameraPosition.x) + " Z: " + Math.floor(this.cameraPosition.z) 
            + " Longitude: " + Math.round(this.#longitude));
    }
}