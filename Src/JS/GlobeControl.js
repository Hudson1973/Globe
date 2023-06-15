class UIController {
    connstructor() {
        // keydown event listener
        document.addEventListener('keydown', e => this.onKeyPress(e), true); 

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

    // Main keypress loop
    onKeyPress(ev) {
        
    }

    onMouseMove(ev) {

    }

    onMouseDown(ev) {

    }

    onMouseUp(ev) {

    }

    onMouseWheel(ev) {

    }

    onTouchStart(ev) {

    }

    onTouchEnd(ev) {
        
    }

    onTouchCancel(ev) {
        
    }

    onTouchMove(ev) {
        
    }
}


export {UIController as default};