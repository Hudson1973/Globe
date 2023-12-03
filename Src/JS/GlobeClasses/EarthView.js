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

    constructor(){
        console.log("EarthView.constructor()");
        this.#latitude = 56.7;
        this.#longitude = 23.5;
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

    rotateBy() {

    }
    rotateTo() {

    }
}