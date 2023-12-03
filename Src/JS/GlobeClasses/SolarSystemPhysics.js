import TimestampToAngle from './GlobeSunRotation.js';  

export class SolarSystemPhysics {
    #sunAngle = TimestampToAngle(Date.now());
    #earthAxis = 23.45;
    #sunDistance = 148880000;
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

    get sunDistance() {
        return this.#sunDistance;
    }

    get earthAxis() {
        return this.#earthAxis;
    }

    get sunPosition() {
        return this.#cartesianSunPosition;
    }

    get earthRadius() {
        return this.#cartesianSunPosition;
    }
}