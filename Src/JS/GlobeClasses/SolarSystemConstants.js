import TimestampToAngle from './GlobeSunRotation.js';  

export class SolarSystemConstants {
    #sunAngle = TimestampToAngle(Date.now());
    #earthAxis = 23.45;
    #sunDistance = 148880000;
    #earthRadius = 6371;
    #cartesianSunPosition = {
        x: 0,
        y: 0,
        x: 0
    };

    constructor() {
        console.log("PhysicalConstraints.constructor()");
        this.#cartesianSunPosition.x = this.#sunDistance * Math.sin(this.#sunAngle);
        this.#cartesianSunPosition.y = this.#sunDistance * Math.cos(this.#earthAxis) * Math.cos(this.#sunAngle);
        this.#cartesianSunPosition.z = this.#sunDistance * Math.sin(this.#sunAngle);
    }

    get sunAngle() {
        return this.#sunAngle;
    }

    static get sunDistance() {
        return 148880000;   // In KM
    }

    static get earthAxis() {
        return 23.45;       // in degrees
    }

    get sunPosition() {
        return this.#cartesianSunPosition;
    }

    static get earthRadius() {
        return 6371;        // In KM
    }
}