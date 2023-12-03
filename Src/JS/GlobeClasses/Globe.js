import {GlobeOptions} from './GlobeOptions.js'
import {SolarSystemPhysics} from './SolarSystemPhysics.js'
import {EarthView} from './EarthView.js'
import {GlobePainter} from './GlobePainter.js'

export default class Globe {
    options = null;
    solarSystemPhysics = null;
    view = null;
    #globePainter = null;

    constructor(canvas, optionParameters = null) {
        console.log("Globe.constructor(canvas)");
        this.options = new GlobeOptions(optionParameters);
        this.solarSystemPhysics = new SolarSystemPhysics();
        this.view = new EarthView();
        this.#globePainter = new GlobePainter(canvas, this.view, this.options);
    }

    redrawGlobe() {
        this.#globePainter.redrawScene();
    }
}

