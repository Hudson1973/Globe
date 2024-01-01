
class InputEventController {
    screenTouched = false;
    dragging = false;
    initialTouchtime = new Date();
    start = {
        x: 0,
        y: 0
    };
    latest = {
        x: 0,
        y: 0
    };

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
        if (this.screenTouched) {
            const delta = {
                x: ev.clientX - this.latest.x,
                y: ev.clientY - this.latest.y
            }
            this.latest.x = ev.clientX;
            this.latest.y = ev.clientY;

            if(delta.x != 0 || delta.y != 0) {
                // Then we are dragging
                this.onDrag(delta);
            }
        }
    }
    
    onMouseDown(ev) {
        this.screenTouched = true;
        this.initialTouchtime = Date.now();
        this.latest = {
            x: ev.clientX,
            y: ev.clientY
        }
        this.start = this.latest;
    }
    
    onMouseUp(ev) {
        this.screenTouched = false;
        this.dragging = false;
    }
    
    onTouchStart(ev) {
        ev.preventDefault();            // Prevent more touch (or mouse) events from being processed

        const touches = ev.touches;
        console.log("CLASS: Touch started with " + touches.length + " touches");
        if (touches.length === 1){
            // Poke, stroke or swipe
            this.screenTouched = true;
            this.initialTouchtime = Date.now();
            this.latest.x = ev.touches[0].clientX;
            this.latest.y = ev.touches[0].clientY;
        }
        else {
            // Pinch or flex
            this.onPinchFlex(touches);
        }
    }
    
    onTouchEnd(ev) {
        this.screenTouched = false;
        this.dragging = false;

        console.log("PROTO: Touch ended");
    }
    
    onTouchCancel(ev) {
        console.log("PROTO: Touch cancelled");
    }
    
    onTouchMove(ev) {
        if (this.screenTouched) {
            const delta = {
                x: ev.touches[0].clientX - this.latest.x,
                y: ev.touches[0].clientY - this.latest.y
            }
            this.latest.x = ev.touches[0].clientX;
            this.latest.y = ev.touches[0].clientY;

            if(delta.x != 0 || delta.y != 0) {
                // Then we are dragging
                this.onDrag(delta);
            }
        }
    }
    
    onMouseWheel(ev) {
    
    }

    processTouch(touch) {
        console.log("CLASS: Touch start at " + touch.identifier + " - screen: " + touch.screenX + ", " + touch.screenY);

    }

    hitScreen(x,y) {
        console.log("CLASS: Hit screen at " + Math.floor(x) + ", " + Math.floor(y));
    }

    onDrag(delta) {
        console.log("Dragging x:" + delta.x + " y:" + delta.y);
    }
    onPinchFlex(touches) {
        for(let i = 0; i < touches.length; i++)
        this.processTouch(touches[i]);
    }
}

export { InputEventController };


