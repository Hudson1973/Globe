
class InputEventController {

    constructor () {
        // keydown event listener
        document.addEventListener('keydown', e => this.onKeyPress(e), false); 

        // Mouse events
        document.addEventListener('mousemove', e => this.onMouseMove(e), false); 
        document.addEventListener('mousedown', e => this.onMouseDown(e), false); 
        document.addEventListener('mouseup', e => this.onMouseUp(e), false); 

        // Mouse wheel events
        document.addEventListener('wheel', e => this.onMouseWheel(e), false); 

        // Touch events
        document.addEventListener('touchstart', e => this.onTouchStart(e), false);  
        document.addEventListener('touchend', e => this.onTouchEnd(e), false); 
        document.addEventListener('touchcancel', e => this.onTouchCancel(e), false); 
        document.addEventListener('touchmove', e => this.onTouchMove(e), false); 
    }

    onKeyPress(ev) {
        console.log("proto keypress");
    }
    
    onMouseMove(ev) {
        console.log("Proto: x: " + ev.clientX + " , y: " + ev.clientY);
    }
    
    onMouseDown(ev) {
        this.hitScreen(ev.clientX, ev.clientY);
    }
    
    onMouseUp(ev) {
    
    }
    
    onTouchStart(ev) {
        ev.preventDefault();            // Prevent more touch (or mouse) events from being processed
        const touches = ev.touches;
        console.log("CLASS: Touch started with " + touches.length + " touches");
        if (touches.length === 1){
            // Poke, stroke or swipe
            this.hitScreen(touches[0].clientX, touches[0].clientY);
        }
        else {
            // Pinch or flex
            for(let i = 0; i < touches.length; i++)
            this.processTouch(touches[i]);
        }

        
    }
    
    onTouchEnd(ev) {
    
    }
    
    onTouchCancel(ev) {
    
    }
    
    onTouchMove(ev) {
    
    }
    
    onMouseWheel(ev) {
    
    }

    processTouch(touch) {
        console.log("CLASS: Touch start at " + touch.identifier + " - screen: " + touch.screenX + ", " + touch.screenY);

    }

    hitScreen(x,y) {
        console.log("CLASS: Hit screen at " + Math.floor(x) + ", " + Math.floor(y));
    }
}

export { InputEventController };


