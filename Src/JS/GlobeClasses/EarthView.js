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
        console.log("EarthView get Latitude()");
        return this.#latitude;
    }
    get longitude() {
        console.log("EarthView get Longitude()");
        return this.#longitude;
    }
    get radius() {
        console.log("EarthView get radius()");
        return this.#radius;
    }
    get fieldOfView() {
        return this.#FOV;
    }
    get distance() {
        console.log("EarthView get distance()");
        return this.#distance;
    }

    rotateBy({ latitude, longitude }) {
        this.#latitude += latitude;
        this.#longitude += longitude;

        if (this.#longitude < -180) this.#longitude += 360;
        if (this.#longitude > 180) this.#longitude -= 360;
        if (this.#latitude < -90) this.#latitude = -90;
        if (this.#latitude > 90) this.#latitude = 90;

        console.log("repaint");
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
}