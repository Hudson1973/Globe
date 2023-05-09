import Globe from './Globe.js';

let cnvs = document.getElementById("globeCanvas");
cnvs.width = window.innerWidth;
cnvs.height = window.innerHeight;
let myGlobe = new Globe(cnvs, "oldschool");