import Globe from './Src/JS/Globe.js';

let cnvs = document.getElementById("globeCanvas");
cnvs.width = window.innerWidth;
cnvs.height = window.innerHeight;
const myGlobe = new Globe(cnvs);