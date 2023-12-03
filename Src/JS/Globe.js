
import {loadMap} from './GlobeLoadMap.js';
import {rotatePointAroundGlobe, gcsToCartesian, globeRadius} from './GlobeRotate.js';
import TimestampToAngle from './GlobeSunRotation.js';  
import {GlobeEventController} from './GlobeEventController.js'
//import setInputEvents from './GlobeControl.js'; 

import * as THREE from 'three';
import { GlobeGraphics } from './GlobeGraphics.js';
import { initGlobePainting } from './GlobePainter.js';

export default class Globe {
    #globePainter = null;
    webGLisAvailable = true;
    ambientLight = true;
    showDiagnostics = true;
    handleKeyownEVents=true;

    #controller = null;

    radius = 10;              // Remember # before a property means its private;
    TangentPoint = {
        Latitude: 0.00,
        Longitude: 0.00,
    }
    smallRotationAngle = 1;
    bigRotationAngle = 10;
    #centrePoint = {
        x: 0,
        y: 0,
    };
    mapSource = 'https://datahub.io/core/geo-countries/datapackage.json';
    #context = null;
    #canvas = null;

    // three.js objects
    #renderer = null;
    #camera = null;
    #scene = null;
    #geometry = null;
    #material = null;
    #sphere = null;
    #light = null;
    #line = null;
    #earthPointer = null;
    #earthRaycaster = null;
    #fov = 46;                  // 46 degrees is the same as a 50mm lens
    #distance = 35000;          // Km away from the earth (16323 fits screen height)
    objects = [];

    //mapImageFile = 'Images/world_bluemarble.jpg';
    mapImageFile = 'Images/2_no_clouds_4k.jpg';
    //mapImageFile = 'Images/High-Resolution-World-Map.jpg';
    mapImageLongRotation = 90;  // In degrees
    #wireframe = null;
    #globeGeometry = null;

    // Array that will hold the map point data
    mapData = [];

    constructor(canvas) {
        console.log("Globe.constructor()");
        this.#controller = new GlobeEventController();
        this.#canvas = canvas;
    
        this.#centrePoint = {
            x: this.#canvas.width / 2,
            y: this.#canvas.height / 2,
        };
        this.radius = this.#initialiseRadius();

        // fail back
        if (!this.webGLisAvailable)
            this.#context = this.#canvas.getContext("2d");


        this.#globePainter = new GlobeGraphics(canvas);
        console.log("this.#globePainter = GlobeGraphics()");
        this.#globePainter.redrawScene();
        console.log("this.#globePainter.redrawScene()");
        if (!this.#globePainter)
            // this.#initGlobe();
            initGlobePainting(canvas);

        // keydown event listener
        /*document.addEventListener('keydown', e => this.onKeyPress(e), true); 

        // Mouse events
        document.addEventListener('mousemove', e => this.onMouseMove(e), false); 
        document.addEventListener('mousedown', e => this.onMouseDown(e), false); 
        document.addEventListener('mouseup', e => this.onMouseUp(e), false); 

        // Mouse wheel events
        document.addEventListener('wheel', e => this.onMouseWheel(e), false);     */ 
    }

    get latitude() {
        return this.latitudeGeo();
    }

    get longitude() {
        return this.longitudeGeo();
    }

    get screenHeight() {
        return this.#canvas.height;
    }

    get globeRadius() {
        return globeRadius(this.#fov, this.#distance);
    }

    get globeFOV() {
        return this.#fov;
    }

    get globeDist() {
        return Math.floor(this.#distance);
    }

    // Main keypress loop
    onKeyPress(ev) {
        console.log(ev.key + " was pressed");
        // SHIFT key pressed should do bigger changes than without

        switch (ev.key) {
            case 'ArrowUp':
                this.#rotateNorth(ev.shiftKey);
                break;
            case 'ArrowDown':
                this.#rotateSouth(ev.shiftKey);
                break;
            case 'ArrowRight':
                this.#rotateWest(ev.shiftKey);
                break;
            case 'ArrowLeft':
                this.#rotateEast(ev.shiftKey);
                break;
            case '=':
                this.#dollyIn();
                break;
            case '-':
                this.#dollyOut();
                break;
            case '+':
                this.#dollyInFine();
                break;
            case '_':
                this.#dollyOutFine();
                break;
        }
        this.#globePainter.redrawGlobe();
    }

    onMouseMove(ev) {
        const rect = this.#canvas.getBoundingClientRect();
        this.#earthPointer.x = (ev.clientX / window.innerWidth) * 2 -1;
        this.#earthPointer.y = - (ev.clientY / window.innerHeight) * 2 + 1;
        

        this.#earthRaycaster.setFromCamera(this.#earthPointer, this.#camera);
        const interects = this.#earthRaycaster.intersectObjects(this.objects);

        console.log("x: " + ev.clientX + " , y: " + ev.clientY + " - " + interects.length);

    }

    onMouseDown(ev) {

    }

    onMouseUp(ev) {

    }

    onMouseWheel(ev) {

    }


    #initGlobe() {
        // Load map data from - well wherever. The data will be in geograohic
        // coordinates (latitude [-90 -> 90], longitude [-180 -> 180]). 
        // This data will be interpreted as points (a particular place), a
        // series of points to make a line (a border) or a series of points to 
        // make an enclosed area (the boundary of a country)
        this.loadMapData(); // Need a callback here

        // Work out where the sun should be
        const sunAngle = TimestampToAngle(Date.now());
        const sunDistance = 1500;
        const earthAxis = 23.45 * Math.PI / 180;

        // SUn position based on the date
        const xSunPos = sunDistance * Math.sin(sunAngle);
        const ySunPos = sunDistance * Math.cos(earthAxis) * Math.cos(sunAngle);
        const zSunPos = sunDistance * Math.sin(sunAngle);

        // Earth rotation, based on the time
        const gmtTime = new Date();

        if (this.webGLisAvailable){
            // Three.js init 
            this.#renderer = new THREE.WebGLRenderer({antialias: true, canvas: this.#canvas});

            const aspect = window.innerWidth / window.innerHeight;  // the canvas default
            const near = 10;
            const far = 300000;
            this.#camera = new THREE.PerspectiveCamera(this.#fov, aspect, near, far);
            this.#camera.position.set(0,0, this.#distance);                     
            this.#camera.lookAt( 0, 0, 0 );
            this.#scene = new THREE.Scene();

            this.#material = new THREE.MeshPhongMaterial(); 
            const textureLoader = new THREE.TextureLoader();
            const earthTexture = textureLoader.load(this.mapImageFile);
            this.#material.setValues({map: earthTexture});
            
            this.#geometry = new THREE.SphereGeometry( this.radius, 32, 16 ); 
            this.#sphere = new THREE.Mesh( this.#geometry, this.#material ); 
            this.#scene.add(this.#sphere);
            this.objects.push(this.#sphere);

            // plot points on the three.gs globe
            let lastPointMove = 0;
            let arrIndex = 0;
            let points = [];

            let cartesianCoods = {
                xPoint : 0,
                yPoint : 0,
                zPoint : 0 
            }

            this.mapData.forEach((mapPoint) => {
                // cartesianCoods are around a 0,0,0 origin, so some of them will be -ve
                cartesianCoods = gcsToCartesian(this.mapData[arrIndex].latitude, this.mapData[arrIndex].longitude, this.radius);
                lastPointMove = this.mapData[arrIndex].move;
                points.push( new THREE.Vector3(cartesianCoods.xPoint, cartesianCoods.yPoint, cartesianCoods.zPoint));
                arrIndex++;
            });

            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineMaterial = new THREE.LineBasicMaterial( { color: 0xffff50, 
                                                                linewidth: 1 } );
            this.#line = new THREE.Line( lineGeometry, lineMaterial );

            this.#scene.add( this.#line );
            this.objects.push(this.#line);

            const color = 0xFFFFDD;
            const intensity = 0.8;

            if (this.ambientLight) {
                this.#light = new THREE.DirectionalLight(color, intensity);
                this.#light.position.set(0, 10, 100);
            } else {
                this.#light = new THREE.PointLight ( color, intensity, 50000);
                this.#light.position.set(xSunPos, ySunPos, zSunPos);
            }
            
            this.#scene.add(this.#light);

            // Rotet globe to noon GMt (GMT longitude is x = 0 through globe)
            this.#line.rotation.y = Math.PI /2;
            this.#sphere.rotation.y = Math.PI + (this.mapImageLongRotation * Math.PI /180 );


            this.TangentPoint.longitude = (gmtTime.getUTCHours() - 12) * 15;
            console.log("minutes since midnight = " + gmtTime.getUTCHours() + " x 60 + " + gmtTime.getUTCMinutes() + " = ");
            console.log("longitude: " + this.TangentPoint.longitude);

            //this.animate();
            this.#renderer.render(this.#scene, this.#camera);

            // Set up raycasting for mouse pointer conflicts with the earth
            this.#earthPointer = new THREE.Vector2();
            this.#earthRaycaster = new THREE.Raycaster();
        }
    }

    #repositionCamera() {
        this.#camera.position.set(0,0, this.#distance);  
    }

    animate = () => {
        requestAnimationFrame( this.animate );

        this.#line.rotation.y += 0.01;
	    this.#renderer.render( this.#scene, this.#camera );
    }

    redrawGlobe() {
        if(this.webGLisAvailable) {
            if (this.#globePainter)
               this.#globePainter.redrawGlobe();
            else
                this.#renderer.render( this.#scene, this.#camera );
        } else {
            this.#clearScreen();
            this.#displayOutercircle();
            this.#displayText();
            this.#drawMap();
        }
    }

    #initialiseRadius() {
        console.log('size is ' + this.#canvas.width + ' by ' + this.#canvas.height);
        if(this.webGLisAvailable) {
            return 6371;                        // The radius of the earth in Km
        } else {
            if (this.#canvas.width > this.#canvas.height) {
                return (this.#canvas.height * .33);
            } else {
                return (this.#canvas.width * .33);
            }
        }   
    }

    #displayOutercircle() {
        if (!this.webGLisAvailable) {
            this.#context.beginPath();
            this.#context.arc(this.#centrePoint.x,this.#centrePoint.y,this.radius,0,2 * Math.PI);
            this.#context.stroke();
        }
    }

    #clearScreen() {
       if (!this.webGLisAvailable)
        this. #context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    #displayText() {
        if (this.webGLisAvailable) {

        }
        else {
            this.#context.font = "20px Arial";
            this.#context.fillText("Lat:" + this.TangentPoint.Latitude , 26, 50);
            this.#context.fillText("Long:" + this.TangentPoint.Longitude , 10, 80);
        }
    }

    #drawMap() {
        let drawPoint = {
            xPoint : 0,
            yPoint : 0,
            zPoint : 0 
        }


        // Get ready to draw
        if (!this.webGLisAvailable)
            this.#context.beginPath();

        let lastPointMove = 0;

        // Read through every point in mapData and rotate it
        this.mapData.forEach((mapPoint) => {
            drawPoint = rotatePointAroundGlobe(this.TangentPoint.Latitude, this.TangentPoint.Longitude, 
                mapPoint.latitude, mapPoint.longitude, this.radius);

            // Now draw this point, but check if the *LAST* point told it to move
            // And if the point is on the hemisphere that is facing the viewer
            if (this.webGLisAvailable) {

            }
            else {
                if (drawPoint.zPoint > 0 && !lastPointMove)
                    this.#context.lineTo(this.#centrePoint.x + drawPoint.xPoint , this.#centrePoint.y + drawPoint.yPoint);
                else    
                    this.#context.moveTo(this.#centrePoint.x + drawPoint.xPoint , this.#centrePoint.y + drawPoint.yPoint);           
                
                //this.#context.fillRect(this.#centrePoint.x + drawPoint.xPoint , this.#centrePoint.y + drawPoint.yPoint,2,2);
            }
            // The when mapPoint.move is true it is for the *NEXT* plot that should move, not this one
            lastPointMove = mapPoint.move;

        });

        if (this.webGLisAvailable) {

        }
        else {
            this.#context.lineWidth = 1;
            this.#context.strokeStyle = "blue";
            this.#context.stroke();   
        }
    }

    #rotateNorth(bigRotation) {
        if(bigRotation)
            this.TangentPoint.Latitude -= this.bigRotationAngle;
        else
            this.TangentPoint.Latitude -= this.smallRotationAngle;
        if(this.TangentPoint.Latitude < -90)
        this.TangentPoint.Latitude = -90;
    }

    #rotateSouth(bigRotation) {
        if(bigRotation)
            this.TangentPoint.Latitude += this.bigRotationAngle;
        else
            this.TangentPoint.Latitude += this.smallRotationAngle;
        
        if(this.TangentPoint.Latitude > 90)
            this.TangentPoint.Latitude = 90;
    }

    #rotateWest(bigRotation) {
        if(bigRotation) {
            this.TangentPoint.Longitude -= this.bigRotationAngle;
            if (this.webGLisAvailable) {
                this.#sphere.rotation.y -= this.bigRotationAngle * Math.PI / 180;
                this.#line.rotation.y -= this.bigRotationAngle * Math.PI / 180;
            }
        } else {
            this.TangentPoint.Longitude -= this.smallRotationAngle;
            if (this.webGLisAvailable) {
                this.#sphere.rotation.y -= this.smallRotationAngle * Math.PI / 180;
                this.#line.rotation.y -= this.smallRotationAngle * Math.PI / 180;;
            }
        }
        
        if(this.TangentPoint.Longitude < -180)
            this.TangentPoint.Longitude += 360;
    }

    #rotateEast(bigRotation) {
        if(bigRotation) {
            if (this.webGLisAvailable) {
                this.#sphere.rotation.y += this.bigRotationAngle * Math.PI / 180;
                this.#line.rotation.y += this.bigRotationAngle * Math.PI / 180;
            }
            this.TangentPoint.Longitude += this.bigRotationAngle;
        } else {
            this.TangentPoint.Longitude += this.smallRotationAngle;
            if (this.webGLisAvailable) {
                this.#sphere.rotation.y += this.smallRotationAngle * Math.PI / 180;;
                this.#line.rotation.y += this.smallRotationAngle * Math.PI / 180;;
            }
        }
        
        if(this.TangentPoint.Longitude > 180)
            this.TangentPoint.Longitude -= 360;
    }

    #dollyIn(){
        console.log("Dolly in");
        this.#distance /= 1.1;
        this.#repositionCamera();  
    }

    #dollyOut(){
        console.log("Dolly out");
        this.#distance *= 1.1;
        this.#repositionCamera();
    }

    #dollyInFine(){
        console.log("Dolly in");
        this.#distance--;
        this.#repositionCamera();  
    }

    #dollyOutFine(){
        console.log("Dolly out");
        this.#distance++;
        this.#repositionCamera();
    }

    loadMapData() {
        this.mapData = loadMap();

    }

    timestamp() {
        let now = new Date();
        return '[' + now.getHours() + ':' + now.getMinutes() + ":" + now.getSeconds() + ':' + now.getMilliseconds() + ']';
    }

    latitudeGeo() {
        const wholeDegree = Math.floor(this.TangentPoint.Latitude);
        const positiveWholeDegree = Math.abs(wholeDegree);
        let suffix = '';
        const degreeSymbol = '\u00B0';

        if (wholeDegree < 0) {
            suffix = 'N';
        } else if (wholeDegree > 0) {
            suffix = 'S';
        } else {
            suffix = '';
        }

        return positiveWholeDegree + degreeSymbol + suffix;
    }

    longitudeGeo() {
        const wholeDegree = Math.floor(this.TangentPoint.Longitude);
        const positiveWholeDegree = Math.abs(wholeDegree);
        let suffix = '';
        const degreeSymbol = '\u00B0';

        if (wholeDegree < 0) {
            suffix = 'W';
        } else if (wholeDegree > 0) {
            suffix = 'E';
        } else {
            suffix = '';
        }

        return positiveWholeDegree + degreeSymbol + suffix;
    }

}