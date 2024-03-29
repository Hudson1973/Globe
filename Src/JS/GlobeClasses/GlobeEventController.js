import { InputEventController } from './Proto/InputEventController.js';


export class GlobeEventController extends InputEventController {
    #view = null

    constructor(globeView) {
        super();
        this.#view = globeView;
    }

    onKeyPress(ev) {
        super.onKeyPress(ev);

        switch (ev.key) {
            case 'ArrowUp':
                //this.#view.rotateNorth();
                break;
            case 'ArrowDown':
                //this.#view.rotateSouth();
                break;
            case 'ArrowRight':
                //this.#view.rotateEast();
                break;
            case 'ArrowLeft':
                //this.#view.rotateWest();
                break;
            case '=':
                // Dolly in
                break;
            case '-':
                // Dolly out
                break;
            case '+':
                // Dolly in fine
                break;
            case '_':
                // Dolly out fine
                break;
        }
    }

    onMouseWheel(ev) {
        // mouse wheel changes distance on Orbit controls 
        // So we need to reset Distance when this happens.
        this.#view.updateDistance();

    }
    onTouchEnd(ev) {
        // screen touch changes distance on Orbit controls 
        // So we need to reset Distance when this happens.
        this.#view.updateDistance();
    }

    onDrag(delta) {
        console.log("GlobeEventController onDrag: " + delta.x + ":" + delta.y);

        this.#view.convertCameraCartesianToGeocentric();
    }
    onPinchFlex(touches) {
        this.#view.updateDistance();
    }

}

/*function setInputEvents (canvas) {
    // keydown event listener
    // document.addEventListener('keydown', e => this.onKeyPress(e), true); 

    // Mouse events
    document.addEventListener('mousemove', e => onMouseMove(e), false); 
    document.addEventListener('mousedown', e => onMouseDown(e), false); 
    document.addEventListener('mouseup', e => onMouseUp(e), false); 

    // Mouse wheel events
    document.addEventListener('wheel', e => this.onMouseWheel(e), false);  

    // Touch events
    document.addEventListener('touchstart', e => this.onTouchStart(e), false);  
    document.addEventListener('touchend', e => this.onTouchEnd(e), false); 
    document.addEventListener('touchcancel', e => this.onTouchCancel(e), false); 
    document.addEventListener('touchmove', e => this.onTouchMove(e), false); 
}

// Main keypress loop
function onKeyPress(ev) {
    console.log("Key pressed");
}

function onMouseMove(ev) {
    console.log("Mouse moved to " + ev.offsetX + ", " + ev.offsetY);
}

function onMouseDown(ev) {
    console.log("Mouse pressed at " + ev.offsetX + ", " + ev.offsetY);
    startPressedTimer();
}

function onMouseUp(ev) {
    console.log("Mouse depressed at " + ev.offsetX + ", " + ev.offsetY);
}

function onMouseWheel(ev) {
    console.log("Wheel X delta " + ev.deltaX + ", Y delta " + ev.deltaY);
}

function onTouchStart(ev) {
    ev.preventDefault();            // Prevent more touch (or mouse) events from being processed
    const touches = ev.changedTouches;
    console.log("Touch started with " + touches.length + " touches");
    for(let i = 0; i < touches.length; i++)
        this.processTouch(touches[i]);

    startPressedTimer();
    console.log("I was touched " + this.numberOfFingers + " times!");
}



function onTouchCancel(ev) {
    
}

function onTouchMove(ev) {
    const touches = ev.changedTouches;
    for(let i = 0; i < this.numberOfFingers; i++) {
        this.ongoingTouches[i].xNow = touches[i].clientX;
        this.ongoingTouches[i].yNow = touches[i].clientY;

        console.log("Touch " + touches[i].identifier + " start: " + this.ongoingTouches[i].xStart + ", " + this.ongoingTouches[i].yStart +
            " Now: " + this.ongoingTouches[i].xNow + ", " + this.ongoingTouches[i].yNow);
    }
}

function startPressedTimer() {
    this.pressStartTime = Date.now();
}

function processTouch(touch) {
    console.log("Touch start at " + touch.identifier + " - screen: " + touch.screenX + ", " + touch.screenY);

    if(touch.identifier === 0) {            // Then this is the first finger
        // Clear ongoingTouches array
        this.ongoingTouches.length = 0;
        this.numberOfFingers = 0;
    }
    let fingerTouch = {
        xStart: touch.clientX,
        yStart: touch.clientY,
        xNow: touch.clientX,
        yNow: touch.clientY
    }
    this.ongoingTouches[this.numberOfFingers] = fingerTouch;

    this.numberOfFingers++;
}*/

//export {setInputEvents as default, onMouseMove, onMouseDown, onMouseUp, onMouseWheel, onTouchStart, onTouchEnd, onTouchCancel, onTouchMove};