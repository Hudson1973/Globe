import Globe from './GlobeClasses/Globe.js';
import TextFormatHelpers from './GlobeClasses/TextFormatHelpers.js';
import { IndexEventController } from './IndexEventController.js';

// Add keydown listener
let cnvs = document.getElementById("globeCanvas");
cnvs.width = window.innerWidth;
cnvs.height = window.innerHeight;

const myGlobe = new Globe(cnvs);
document.getElementById("geoposition").innerHTML=TextFormatHelpers.latitudeGCS(myGlobe.View.latitude) 
    + " " + TextFormatHelpers.longitudeGCS(myGlobe.View.longitude);

updateDiagnostics();
setInterval(updateDateTime, 1000);
const myController = new IndexEventController(myGlobe);

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
