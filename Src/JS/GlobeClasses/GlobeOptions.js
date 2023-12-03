// GlobeOptions is for holding the options that are called even if 
// no options aare determined. This class sets defaults if nothing
// has been set and updates it with values. It also checks (e.g. 
// if a filename does not exist, the exception will be thrown from here.)

export class GlobeOptions {
    #mapImageFile = './Images/2_no_clouds_4k.jpg';
    #mapBumpFile = './Images/elev_bump_8k.jpg';
    #drawWireframe = false;
    #drawEarthTexture = true;
    #ambientLight = true;
    #pointLight = true;

    constructor(options) {

        if(options) {
            console.log("There are options, so unpack them");
        }
    }

    get drawEarthTexture() {
        return this.#drawEarthTexture;
    }
    get drawWireframe() {
        return this.#drawWireframe;
    }
    get ambientLight() {
        return this.#ambientLight
    }
    get pointLight() {
        return this.#pointLight
    }
    get imageMap() {
        return this.#mapImageFile;
    }
    get bumpMap() {
        return this.#mapBumpFile;
    }

}