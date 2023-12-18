import { InputEventController } from './GlobeClasses/Proto/InputEventController.js';
import TextFormatHelpers from './GlobeClasses/TextFormatHelpers.js';

export class IndexEventController extends InputEventController {
    #globe = null;

    constructor(Globe) {
        super();
        
        console.log("IndexEventController constructor");
        this.#globe = Globe;
    }

    onKeyPress(ev) {
        console.log("ndexEventController onKeyPress");

        switch (ev.key) {
            case 'ArrowUp':
                console.log("Outside->UP");
                break;
            case 'ArrowDown':
                console.log("Outside->Down");
                break;
            case 'ArrowRight':
                this.updateScreenCoordinates();
                break;
            case 'ArrowLeft':
                this.updateScreenCoordinates();
                break;
            case '+':
                updateDiagnostics()
                break;
            case '-':
                updateDiagnostics()
                break;  
            case '=':
                updateDiagnostics()
                break;
            case '_':
                updateDiagnostics();
                break;
        }
    }

    onDrag(delta) {
        this.updateScreenCoordinates();
        this.updateGeocentricCoordinates();
    }
    onMouseWheel(ev) {
        this.updateDistance();
    }
    onPinchFlex(touches) {
        this.updateDistance();
    }
    updateScreenCoordinates() {
        document.getElementById("cameraPosition").innerHTML="Camera position" + 
            " x:" + Math.floor(this.#globe.View.cameraPosition.x) + 
            " y:" + Math.floor(this.#globe.View.cameraPosition.y) + 
            " z:" + Math.floor(this.#globe.View.cameraPosition.z);
    }
    updateGeocentricCoordinates() {
        document.getElementById("geoposition").innerHTML=TextFormatHelpers.latitudeGCS(this.#globe.View.latitude) 
        + " " + TextFormatHelpers.longitudeGCS(this.#globe.View.longitude);
    }
    updateDistance() {
        document.getElementById("earthView").innerHTML="Radius: " + this.#globe.View.radius + "km<br>Field of view: " 
        + this.#globe.View.fieldOfView + TextFormatHelpers.degreeSymbol() + "<br>Distance: " + Math.round(this.#globe.View.distance) + "km";
    }
}