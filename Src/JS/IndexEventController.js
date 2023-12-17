import { InputEventController } from './GlobeClasses/Proto/InputEventController.js';


export class IndexEventController extends InputEventController {
    #globe = null;

    constructor(Globe) {
        super();
        
        console.log("IndexEventController constructor");
        this.#globe = Globe;
    }

    onKeyPress(ev) {
        console.log("ndexEventController onKeyPress");

            // SHIFT key pressed should do bigger changes than without
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
    }

    updateScreenCoordinates() {
        document.getElementById("cameraPosition").innerHTML="Camera position" + 
            " x:" + Math.floor(this.#globe.View.cameraPosition.x) + 
            " y:" + Math.floor(this.#globe.View.cameraPosition.y) + 
            " z:" + Math.floor(this.#globe.View.cameraPosition.z);
    }
}