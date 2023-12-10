import {GlobeOptions} from './GlobeOptions.js'
import {SolarSystemPhysics} from './SolarSystemPhysics.js'
import {EarthView} from './EarthView.js'
import {GlobePainter} from './GlobePainter.js'
import { GlobeEventController } from './GlobeEventController.js';

export default class Globe {
    options = null;
    solarSystemPhysics = null;
    View = null;
    #globePainter = null;
    #eventController = null;

    constructor(canvas, optionParameters = null) {
        console.log("Globe.constructor(canvas)");
        this.options = new GlobeOptions(optionParameters);
        this.solarSystemPhysics = new SolarSystemPhysics();
        this.View = new EarthView(this.#globePainter);
        this.#globePainter = new GlobePainter(canvas, this.options, this.View);
        this.View.initGlobePainting(this.#globePainter);
        this.#globePainter.AnimateScene();
        this.#eventController = new GlobeEventController(this.View);
    }

    redrawGlobe() {
        this.#globePainter.redrawScene();
    }
}

