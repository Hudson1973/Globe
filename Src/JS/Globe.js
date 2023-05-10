
import {loadMap} from './GlobeLoadMap.js';
import {rotatePointAroundGlobe} from './GlobeRotate.js';

export default class Globe {
    radius = 200;              // Remember # before a property means its private;
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
    #context = null;
    #canvas = null;

    // Array that will hold the map point data
    mapData = [];

    constructor(canvas) {
        this.#canvas = canvas;
        this.#context = this.#canvas.getContext("2d");

        this.#centrePoint = {
            x: this.#canvas.width / 2,
            y: this.#canvas.height / 2,
        };
        this.radius = this.#initialiseRadius();

        this.loadMapData();
        this.displayGlobe();

        // Add keydown listener
        document.addEventListener('keydown', e => this.keypressed(e), true); 
    }

    // Main keypress loop
    keypressed(ev) {
        //console.log(this , ev);

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
        }
        this.displayGlobe();
    }

    displayGlobe() {
        this.#clearScreen();
        this.#displayOutercircle();
        this.#displayText();
        this.#drawMap();
    }

    #initialiseRadius() {
        console.log('size is ' + this.#canvas.width + ' by ' + this.#canvas.height);
        if (this.#canvas.width > this.#canvas.height) {
            return (this.#canvas.height * .33);
        } else {
            return (this.#canvas.width * .33);
        }
    }

    #displayOutercircle() {
        this.#context.beginPath();
        this.#context.arc(this.#centrePoint.x,this.#centrePoint.y,this.radius,0,2 * Math.PI);
        this.#context.stroke();
    }

    #clearScreen() {
        this. #context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    #displayText() {
        this.#context.font = "20px Arial";
        this.#context.fillText("Lat:" + this.TangentPoint.Latitude , 26, 50);
        this.#context.fillText("Long:" + this.TangentPoint.Longitude , 10, 80);
    }

    #drawMap() {
        let drawPoint = {
            xPoint : 0,
            yPoint : 0,
            zPoint : 0 
        }


        // Get ready to draw
        this.#context.beginPath();
        let lastPointMove = 0;

        // Read through every point in mapData and rotate it
        this.mapData.forEach((mapPoint) => {
            drawPoint = rotatePointAroundGlobe(this.TangentPoint.Latitude, this.TangentPoint.Longitude, 
                mapPoint.latitude, mapPoint.longitude, this.radius);

            // Now draw this point, but check if the *LAST* point told it to move
            // And if the point is on the hemisphere that is facing the viewer
            if (drawPoint.zPoint > 0 && !lastPointMove)
                this.#context.lineTo(this.#centrePoint.x + drawPoint.xPoint , this.#centrePoint.y + drawPoint.yPoint);
            else    
                this.#context.moveTo(this.#centrePoint.x + drawPoint.xPoint , this.#centrePoint.y + drawPoint.yPoint);             
            
            //this.#context.fillRect(this.#centrePoint.x + drawPoint.xPoint , this.#centrePoint.y + drawPoint.yPoint,2,2);

            // The when mapPoint.move is true it is for the *NEXT* plot that should move, not this one
            lastPointMove = mapPoint.move;

        });
        this.#context.lineWidth = 1;
        this.#context.strokeStyle = "blue";
        this.#context.stroke();   
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
        if(bigRotation)
            this.TangentPoint.Longitude -= this.bigRotationAngle;
        else
            this.TangentPoint.Longitude -= this.smallRotationAngle;
        
        if(this.TangentPoint.Longitude < -180)
            this.TangentPoint.Longitude += 360;
    }

    #rotateEast(bigRotation) {
        if(bigRotation)
            this.TangentPoint.Longitude += this.bigRotationAngle;
        else
            this.TangentPoint.Longitude += this.smallRotationAngle;
        
        if(this.TangentPoint.Longitude > 180)
            this.TangentPoint.Longitude -= 360;
    }

    loadMapData() {
        this.mapData = loadMap();
    }
}