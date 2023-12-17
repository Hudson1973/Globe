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

        // latitude angle = inverse sin(opp / Hypotenuese)
        // latitude angle = inverse sin(camera y position / distance)
        this.#latitude = Math.asin(this.cameraPosition.y / this.#distance);
        this.#latitude *= 180 / Math.PI;        // convert to degrees
        console.log("Y = " + Math.floor(this.cameraPosition.y) + " Latitude = " + Math.round(this.#latitude));
    }
}