import Globe from './Src/JS/Globe.js';



// Add keydown listener
document.addEventListener('keydown', e => keypressed(e)); 
let cnvs = document.getElementById("globeCanvas");
cnvs.width = window.innerWidth;
cnvs.height = window.innerHeight;
const myGlobe = new Globe(cnvs);
myGlobe.handleKeyownEVents = false;     // This will handle key events for rotation
document.getElementById("geoposition").innerHTML=myGlobe.latitude + " " + myGlobe.longitude;
setInterval(updateDateTime, 1000);

function keypressed(ev) {
    //console.log(this , ev);

    // SHIFT key pressed should do bigger changes than without
    switch (ev.key) {
        case 'ArrowUp':
            //this.#rotateNorth(ev.shiftKey);
            console.log("Outside->UP");
            break;
        case 'ArrowDown':
            //this.#rotateSouth(ev.shiftKey);
            console.log("Outside->Down");
            break;
        case 'ArrowRight':
            //this.#rotateWest(ev.shiftKey);
            document.getElementById("geoposition").innerHTML=myGlobe.latitude + " " + myGlobe.longitude;
            console.log("Outside->Right. Long:" + myGlobe.longitude);
            break;
        case 'ArrowLeft':
            //this.#rotateEast(ev.shiftKey);
            document.getElementById("geoposition").innerHTML=myGlobe.latitude + " " + myGlobe.longitude;
            console.log("Outside->Left. Long:" + myGlobe.longitude);
            break;
    }
}

function updateDateTime() {
        const nowDateTime = new Date();
        document.getElementById("datetimenow").innerHTML=nowDateTime;
        myGlobe.redrawGlobe();
}

