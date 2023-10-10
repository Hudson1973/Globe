
function setInputEvents (canvas) {
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

function onTouchEnd(ev) {
    
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
}

export {setInputEvents as default, onMouseMove, onMouseDown, onMouseUp, onMouseWheel, onTouchStart, onTouchEnd, onTouchCancel, onTouchMove};