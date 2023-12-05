import Globe from './Src/JS/GlobeClasses/Globe.js';
import TextFormatHelpers from './Src/JS/GlobeClasses/TextFormatHelpers.js';

// Add keydown listener
document.addEventListener('keydown', e => keypressed(e)); 
let cnvs = document.getElementById("globeCanvas");
cnvs.width = window.innerWidth;
cnvs.height = window.innerHeight;

//const myGraphics = new GlobeGraphics(cnvs);
//myGraphics.redrawScene();
const myGlobe = new Globe(cnvs);
document.getElementById("geoposition").innerHTML=TextFormatHelpers.latitudeGCS(myGlobe.View.latitude) + " " + TextFormatHelpers.longitudeGCS(myGlobe.View.longitude);
updateDiagnostics()
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
            document.getElementById("geoposition").innerHTML=TextFormatHelpers.latitudeGCS(myGlobe.View.latitude) + 
                " " + TextFormatHelpers.longitudeGCS(myGlobe.View.longitude);
            break;
        case 'ArrowLeft':
            //this.#rotateEast(ev.shiftKey);
            document.getElementById("geoposition").innerHTML=TextFormatHelpers.latitudeGCS(myGlobe.View.latitude) + 
                " " + TextFormatHelpers.longitudeGCS(myGlobe.View.longitude);
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

function updateDateTime() {
        const nowDateTime = new Date();
        document.getElementById("datetimenow").innerHTML=nowDateTime;
        myGlobe.redrawGlobe();
}

function updateDiagnostics() {
    document.getElementById("earthView").innerHTML="Radius: " + myGlobe.View.radius + "km<br>Field of view: " 
        + myGlobe.View.fieldOfView + TextFormatHelpers.degreeSymbol() + "<br>Distance: " + myGlobe.View.distance + "km";
    document.getElementById("pointerDiagnostics").innerHTML="Screen height: " + window.innerHeight + " pixels";
}
