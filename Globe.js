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

    constructor(canvas, mode) {
        this.#canvas = canvas;
        this.#context = this.#canvas.getContext("2d");

        // Set canvas to same size as the screen
        this.#context.width = window.innerWidth;
        this.#context.height = window.innerHeight;

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
            drawPoint = this.#rotatePointAroundGlobe(this.TangentPoint.Latitude, this.TangentPoint.Longitude, 
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

#rotatePointAroundGlobe(globeTangentLat, globeTangentLong, pointLat, pointLong, radius) {
    const cosPLat = Math.cos(this.#inRadians(pointLat));
    const sinPLat = Math.sin(this.#inRadians(pointLat));

    const xCentre = 0;
    const yCentre = radius * Math.cos(this.#inRadians(globeTangentLat)) * sinPLat;
    const zCentre = Math.sin(this.#inRadians(globeTangentLat)) * sinPLat;
    const zRange = cosPLat * Math.cos(this.#inRadians(globeTangentLat));
    const xEnd = xCentre + (radius * cosPLat * Math.sin(this.#inRadians(pointLong - globeTangentLong)));
    const yEnd = yCentre - (radius * cosPLat * Math.cos(this.#inRadians(pointLong - globeTangentLong)) * Math.sin(this.#inRadians(globeTangentLat)));
    const zEnd = zCentre + (zRange * Math.cos(this.#inRadians(pointLong - globeTangentLong)));

    //console.log("latitude:" + globeTangentLat + " longitude:" + globeTangentLong + " Radius:" + radius + 
    //   " Point Lat:" + pointLat + " Point Long:" + pointLong + " x:" + xEnd + " y:" + yEnd + " z:" + zEnd);

    return {
        'xPoint' : xEnd,
        'yPoint' : yEnd,
        'zPoint' : zEnd      
    };
}

#inRadians (angleInDegrees) {
    return (angleInDegrees * Math.PI / 180);
}

    loadMapData() {
        this.mapData = this.#loadMap();
    }
    
#loadMap() {
    // This is a crude way of getting the data into an array.
    // TODO: use a database and serve up from the server
    let mapPoint = [];
    mapPoint.push({ latitude: -36, longitude: -5.5, zoomLevel: 1, move: 0, nextPoint: 1 });
    mapPoint.push({ latitude: -37, longitude: -6.5, zoomLevel: 1, move: 0, nextPoint: 2 });
    mapPoint.push({ latitude: -37, longitude: -8.75, zoomLevel: 1, move: 0, nextPoint: 4 });
    mapPoint.push({ latitude: -38, longitude: -9.25, zoomLevel: 1, move: 0, nextPoint: 5 });
    mapPoint.push({ latitude: -40.75, longitude: -8.5, zoomLevel: 1, move: 0, nextPoint: 6 });
    mapPoint.push({ latitude: -43, longitude: -9.25, zoomLevel: 1, move: 0, nextPoint: 7 });
    mapPoint.push({ latitude: -43.5, longitude: -8, zoomLevel: 1, move: 0, nextPoint: 8 });
    mapPoint.push({ latitude: -43.25, longitude: -2, zoomLevel: 1, move: 0, nextPoint: 9 });
    mapPoint.push({ latitude: -46.75, longitude: -2, zoomLevel: 1, move: 0, nextPoint: 10 });
    mapPoint.push({ latitude: -48.25, longitude: -4.75, zoomLevel: 1, move: 0, nextPoint: 11 });
    mapPoint.push({ latitude: -48.25, longitude: -1.75, zoomLevel: 1, move: 0, nextPoint: 12 });
    mapPoint.push({ latitude: -49.75, longitude: -2, zoomLevel: 1, move: 0, nextPoint: 13 });
    mapPoint.push({ latitude: -49.75, longitude: 0, zoomLevel: 1, move: 0, nextPoint: 14 });
    mapPoint.push({ latitude: -51.5, longitude: 2, zoomLevel: 1, move: 0, nextPoint: 15 });
    mapPoint.push({ latitude: -52, longitude: 1.5, zoomLevel: 1, move: 0, nextPoint: 16 });
    mapPoint.push({ latitude: -51.5, longitude: -2, zoomLevel: 1, move: 0, nextPoint: 17 });
    mapPoint.push({ latitude: -51.75, longitude: -3.75, zoomLevel: 1, move: 0, nextPoint: 18 });
    mapPoint.push({ latitude: -50.75, longitude: -4, zoomLevel: 1, move: 0, nextPoint: 19 });
    mapPoint.push({ latitude: -50, longitude: -5.75, zoomLevel: 1, move: 0, nextPoint: 20 });
    mapPoint.push({ latitude: -52, longitude: -4.75, zoomLevel: 1, move: 0, nextPoint: 21 });
    mapPoint.push({ latitude: -52.75, longitude: -2.75, zoomLevel: 1, move: 0, nextPoint: 22 });
    mapPoint.push({ latitude: -52.75, longitude: -5.25, zoomLevel: 1, move: 0, nextPoint: 23 });
    mapPoint.push({ latitude: -53.75, longitude: -4.5, zoomLevel: 1, move: 0, nextPoint: 24 });
    mapPoint.push({ latitude: -53.75, longitude: -2.75, zoomLevel: 1, move: 0, nextPoint: 25 });
    mapPoint.push({ latitude: -55, longitude: -3, zoomLevel: 1, move: 0, nextPoint: 26 });
    mapPoint.push({ latitude: -55, longitude: -4.75, zoomLevel: 1, move: 1, nextPoint: 27 });
    mapPoint.push({ latitude: -55, longitude: -5.5, zoomLevel: 1, move: 0, nextPoint: 28 });
    mapPoint.push({ latitude: -52.25, longitude: -6.25, zoomLevel: 1, move: 0, nextPoint: 29 });
    mapPoint.push({ latitude: -51.75, longitude: -9.75, zoomLevel: 1, move: 0, nextPoint: 30 });
    mapPoint.push({ latitude: -53.25, longitude: -8.75, zoomLevel: 1, move: 0, nextPoint: 31 });
    mapPoint.push({ latitude: -53.5, longitude: -10, zoomLevel: 1, move: 0, nextPoint: 32 });
    mapPoint.push({ latitude: -54.25, longitude: -10, zoomLevel: 1, move: 0, nextPoint: 33 });
    mapPoint.push({ latitude: -54.25, longitude: -8.25, zoomLevel: 1, move: 0, nextPoint: 34 });
    mapPoint.push({ latitude: -55.5, longitude: -7.75, zoomLevel: 1, move: 0, nextPoint: 35 });
    mapPoint.push({ latitude: -55, longitude: -5.5, zoomLevel: 1, move: 1, nextPoint: 36 });
    mapPoint.push({ latitude: -55, longitude: -5, zoomLevel: 1, move: 0, nextPoint: 37 });
    mapPoint.push({ latitude: -58, longitude: -5, zoomLevel: 1, move: 0, nextPoint: 38 });
    mapPoint.push({ latitude: -58, longitude: -3, zoomLevel: 1, move: 0, nextPoint: 39 });
    mapPoint.push({ latitude: -57, longitude: -3.75, zoomLevel: 1, move: 0, nextPoint: 40 });
    mapPoint.push({ latitude: -57, longitude: -2.25, zoomLevel: 1, move: 0, nextPoint: 41 });
    mapPoint.push({ latitude: -56.25, longitude: -3.25, zoomLevel: 1, move: 0, nextPoint: 42 });
    mapPoint.push({ latitude: -55.75, longitude: -2.25, zoomLevel: 1, move: 0, nextPoint: 43 });
    mapPoint.push({ latitude: -53.25, longitude: 0, zoomLevel: 1, move: 0, nextPoint: 44 });
    mapPoint.push({ latitude: -53.25, longitude: 1.25, zoomLevel: 1, move: 0, nextPoint: 45 });
    mapPoint.push({ latitude: -52.25, longitude: 1.25, zoomLevel: 1, move: 0, nextPoint: 46 });
    mapPoint.push({ latitude: -52, longitude: 1.5, zoomLevel: 1, move: 1, nextPoint: 47 });
    mapPoint.push({ latitude: -51.5, longitude: 2, zoomLevel: 1, move: 0, nextPoint: 48 });
    mapPoint.push({ latitude: -52.75, longitude: 4.75, zoomLevel: 1, move: 0, nextPoint: 49 });
    mapPoint.push({ latitude: -53.5, longitude: 8.75, zoomLevel: 1, move: 0, nextPoint: 50 });
    mapPoint.push({ latitude: -57.25, longitude: 8.5, zoomLevel: 1, move: 0, nextPoint: 51 });
    mapPoint.push({ latitude: -58.25, longitude: 10.75, zoomLevel: 1, move: 0, nextPoint: 52 });
    mapPoint.push({ latitude: -56.75, longitude: 11.25, zoomLevel: 1, move: 0, nextPoint: 53 });
    mapPoint.push({ latitude: -54.5, longitude: 11, zoomLevel: 1, move: 0, nextPoint: 54 });
    mapPoint.push({ latitude: -55, longitude: 20, zoomLevel: 1, move: 0, nextPoint: 55 });
    mapPoint.push({ latitude: -57, longitude: 21.5, zoomLevel: 1, move: 0, nextPoint: 56 });
    mapPoint.push({ latitude: -59.25, longitude: 23.75, zoomLevel: 1, move: 0, nextPoint: 57 });
    mapPoint.push({ latitude: -60, longitude: 30, zoomLevel: 1, move: 0, nextPoint: 58 });
    mapPoint.push({ latitude: -60, longitude: 23.75, zoomLevel: 1, move: 0, nextPoint: 59 });
    mapPoint.push({ latitude: -61.25, longitude: 21.25, zoomLevel: 1, move: 0, nextPoint: 60 });
    mapPoint.push({ latitude: -63.25, longitude: 21.25, zoomLevel: 1, move: 0, nextPoint: 61 });
    mapPoint.push({ latitude: -65, longitude: 25, zoomLevel: 1, move: 0, nextPoint: 62 });
    mapPoint.push({ latitude: -66, longitude: 22.25, zoomLevel: 1, move: 0, nextPoint: 63 });
    mapPoint.push({ latitude: -64.25, longitude: 21, zoomLevel: 1, move: 0, nextPoint: 64 });
    mapPoint.push({ latitude: -60.75, longitude: 17.5, zoomLevel: 1, move: 0, nextPoint: 65 });
    mapPoint.push({ latitude: -60, longitude: 18.75, zoomLevel: 1, move: 0, nextPoint: 66 });
    mapPoint.push({ latitude: -56.5, longitude: 16, zoomLevel: 1, move: 0, nextPoint: 67 });
    mapPoint.push({ latitude: -55.75, longitude: 13, zoomLevel: 1, move: 0, nextPoint: 68 });
    mapPoint.push({ latitude: -59.5, longitude: 10.5, zoomLevel: 1, move: 0, nextPoint: 69 });
    mapPoint.push({ latitude: -58, longitude: 7.75, zoomLevel: 1, move: 0, nextPoint: 70 });
    mapPoint.push({ latitude: -58.75, longitude: 5.5, zoomLevel: 1, move: 0, nextPoint: 71 });
    mapPoint.push({ latitude: -62.25, longitude: 5, zoomLevel: 1, move: 0, nextPoint: 72 });
    mapPoint.push({ latitude: -63.5, longitude: 10, zoomLevel: 1, move: 0, nextPoint: 73 });
    mapPoint.push({ latitude: -70, longitude: 18, zoomLevel: 1, move: 0, nextPoint: 74 });
    mapPoint.push({ latitude: -71, longitude: 29.25, zoomLevel: 1, move: 0, nextPoint: 75 });
    mapPoint.push({ latitude: -62.25, longitude: 41.25, zoomLevel: 1, move: 0, nextPoint: 76 });
    mapPoint.push({ latitude: -65, longitude: 38.5, zoomLevel: 1, move: 0, nextPoint: 77 });
    mapPoint.push({ latitude: -68.5, longitude: 55, zoomLevel: 1, move: 0, nextPoint: 78 });
    mapPoint.push({ latitude: -73.75, longitude: 65, zoomLevel: 1, move: 0, nextPoint: 79 });
    mapPoint.push({ latitude: -76.5, longitude: 111.25, zoomLevel: 1, move: 0, nextPoint: 80 });
    mapPoint.push({ latitude: -74, longitude: 110, zoomLevel: 1, move: 0, nextPoint: 81 });
    mapPoint.push({ latitude: -71.25, longitude: 131.25, zoomLevel: 1, move: 0, nextPoint: 82 });
    mapPoint.push({ latitude: -72, longitude: 150, zoomLevel: 1, move: 0, nextPoint: 83 });
    mapPoint.push({ latitude: -70.75, longitude: 160, zoomLevel: 1, move: 0, nextPoint: 84 });
    mapPoint.push({ latitude: -68.75, longitude: 161.25, zoomLevel: 1, move: 0, nextPoint: 85 });
    mapPoint.push({ latitude: -70, longitude: 175, zoomLevel: 1, move: 0, nextPoint: 86 });
    mapPoint.push({ latitude: -66, longitude: -170, zoomLevel: 1, move: 0, nextPoint: 87 });
    mapPoint.push({ latitude: -64, longitude: -175, zoomLevel: 1, move: 0, nextPoint: 88 });
    mapPoint.push({ latitude: -66, longitude: -180, zoomLevel: 1, move: 0, nextPoint: 89 });
    mapPoint.push({ latitude: -64, longitude: 178, zoomLevel: 1, move: 0, nextPoint: 90 });
    mapPoint.push({ latitude: -62.5, longitude: 179.5, zoomLevel: 1, move: 0, nextPoint: 91 });
    mapPoint.push({ latitude: -62.75, longitude: 177.75, zoomLevel: 1, move: 0, nextPoint: 92 });
    mapPoint.push({ latitude: -60, longitude: 170, zoomLevel: 1, move: 0, nextPoint: 93 });
    mapPoint.push({ latitude: -60, longitude: 163.25, zoomLevel: 1, move: 0, nextPoint: 94 });
    mapPoint.push({ latitude: -54.75, longitude: 161.5, zoomLevel: 1, move: 0, nextPoint: 95 });
    mapPoint.push({ latitude: -50.75, longitude: 157, zoomLevel: 1, move: 0, nextPoint: 96 });
    mapPoint.push({ latitude: -55.75, longitude: 155.5, zoomLevel: 1, move: 0, nextPoint: 97 });
    mapPoint.push({ latitude: -62, longitude: 164.25, zoomLevel: 1, move: 0, nextPoint: 98 });
    mapPoint.push({ latitude: -59, longitude: 155, zoomLevel: 1, move: 0, nextPoint: 99 });
    mapPoint.push({ latitude: -59.25, longitude: 143.25, zoomLevel: 1, move: 0, nextPoint: 100 });
    mapPoint.push({ latitude: -55.25, longitude: 135.25, zoomLevel: 1, move: 0, nextPoint: 101 });
    mapPoint.push({ latitude: -54, longitude: 141, zoomLevel: 1, move: 1, nextPoint: 102 });
    mapPoint.push({ latitude: -54, longitude: 141.5, zoomLevel: 1, move: 0, nextPoint: 103 });
    mapPoint.push({ latitude: -49, longitude: 143, zoomLevel: 1, move: 0, nextPoint: 104 });
    mapPoint.push({ latitude: -48.75, longitude: 142.25, zoomLevel: 1, move: 0, nextPoint: 105 });
    mapPoint.push({ latitude: -46, longitude: 141.25, zoomLevel: 1, move: 1, nextPoint: 106 });
    mapPoint.push({ latitude: -45.75, longitude: 141.25, zoomLevel: 1, move: 0, nextPoint: 107 });
    mapPoint.push({ latitude: -43.5, longitude: 145, zoomLevel: 1, move: 0, nextPoint: 108 });
    mapPoint.push({ latitude: -42.25, longitude: 143, zoomLevel: 1, move: 0, nextPoint: 109 });
    mapPoint.push({ latitude: -42.5, longitude: 141.75, zoomLevel: 1, move: 0, nextPoint: 110 });
    mapPoint.push({ latitude: -39.25, longitude: 141.25, zoomLevel: 1, move: 0, nextPoint: 111 });
    mapPoint.push({ latitude: -35, longitude: 140, zoomLevel: 1, move: 0, nextPoint: 112 });
    mapPoint.push({ latitude: -33.75, longitude: 135.75, zoomLevel: 1, move: 0, nextPoint: 113 });
    mapPoint.push({ latitude: -31.75, longitude: 131, zoomLevel: 1, move: 0, nextPoint: 114 });
    mapPoint.push({ latitude: -33.5, longitude: 130, zoomLevel: 1, move: 0, nextPoint: 115 });
    mapPoint.push({ latitude: -35.75, longitude: 133.5, zoomLevel: 1, move: 0, nextPoint: 116 });
    mapPoint.push({ latitude: -35.75, longitude: 136.25, zoomLevel: 1, move: 0, nextPoint: 117 });
    mapPoint.push({ latitude: -37.5, longitude: 138, zoomLevel: 1, move: 0, nextPoint: 118 });
    mapPoint.push({ latitude: -40, longitude: 140, zoomLevel: 1, move: 0, nextPoint: 119 });
    mapPoint.push({ latitude: -43, longitude: 140.5, zoomLevel: 1, move: 0, nextPoint: 120 });
    mapPoint.push({ latitude: -45.75, longitude: 141.25, zoomLevel: 1, move: 1, nextPoint: 121 });
    mapPoint.push({ latitude: -46, longitude: 141.25, zoomLevel: 1, move: 0, nextPoint: 122 });
    mapPoint.push({ latitude: -54, longitude: 141.5, zoomLevel: 1, move: 1, nextPoint: 123 });
    mapPoint.push({ latitude: -54, longitude: 141, zoomLevel: 1, move: 0, nextPoint: 124 });
    mapPoint.push({ latitude: -48.25, longitude: 140, zoomLevel: 1, move: 0, nextPoint: 125 });
    mapPoint.push({ latitude: -42.75, longitude: 133, zoomLevel: 1, move: 0, nextPoint: 126 });
    mapPoint.push({ latitude: -43.25, longitude: 132, zoomLevel: 1, move: 0, nextPoint: 127 });
    mapPoint.push({ latitude: -39.25, longitude: 127.5, zoomLevel: 1, move: 0, nextPoint: 128 });
    mapPoint.push({ latitude: -35, longitude: 129, zoomLevel: 1, move: 0, nextPoint: 129 });
    mapPoint.push({ latitude: -34.75, longitude: 126, zoomLevel: 1, move: 0, nextPoint: 130 });
    mapPoint.push({ latitude: -37.5, longitude: 126.75, zoomLevel: 1, move: 0, nextPoint: 131 });
    mapPoint.push({ latitude: -38, longitude: 125, zoomLevel: 1, move: 0, nextPoint: 132 });
    mapPoint.push({ latitude: -38.75, longitude: 125.25, zoomLevel: 1, move: 0, nextPoint: 133 });
    mapPoint.push({ latitude: -33.75, longitude: 123, zoomLevel: 1, move: 0, nextPoint: 134 });
    mapPoint.push({ latitude: -40.5, longitude: 122.25, zoomLevel: 1, move: 0, nextPoint: 135 });
    mapPoint.push({ latitude: -39.25, longitude: 117.5, zoomLevel: 1, move: 0, nextPoint: 136 });
    mapPoint.push({ latitude: -36, longitude: 120.25, zoomLevel: 1, move: 0, nextPoint: 137 });
    mapPoint.push({ latitude: -34.75, longitude: 119.25, zoomLevel: 1, move: 0, nextPoint: 138 });
    mapPoint.push({ latitude: -29.75, longitude: 121.5, zoomLevel: 1, move: 0, nextPoint: 139 });
    mapPoint.push({ latitude: -26, longitude: 119.25, zoomLevel: 1, move: 1, nextPoint: 140 });
    mapPoint.push({ latitude: -25.25, longitude: 121.75, zoomLevel: 1, move: 0, nextPoint: 141 });
    mapPoint.push({ latitude: -22.25, longitude: 121, zoomLevel: 1, move: 0, nextPoint: 142 });
    mapPoint.push({ latitude: -22.5, longitude: 120.25, zoomLevel: 1, move: 0, nextPoint: 143 });
    mapPoint.push({ latitude: -25, longitude: 120.25, zoomLevel: 1, move: 0, nextPoint: 144 });
    mapPoint.push({ latitude: -25.25, longitude: 121.75, zoomLevel: 1, move: 1, nextPoint: 145 });
    mapPoint.push({ latitude: -25.75, longitude: 119.25, zoomLevel: 1, move: 0, nextPoint: 146 });
    mapPoint.push({ latitude: -23.25, longitude: 116.75, zoomLevel: 1, move: 0, nextPoint: 147 });
    mapPoint.push({ latitude: -22.25, longitude: 114.25, zoomLevel: 1, move: 0, nextPoint: 148 });
    mapPoint.push({ latitude: -21.25, longitude: 110.25, zoomLevel: 1, move: 0, nextPoint: 149 });
    mapPoint.push({ latitude: -20.5, longitude: 110, zoomLevel: 1, move: 1, nextPoint: 150 });
    mapPoint.push({ latitude: -20, longitude: 110, zoomLevel: 1, move: 0, nextPoint: 151 });
    mapPoint.push({ latitude: -20, longitude: 110.5, zoomLevel: 1, move: 0, nextPoint: 152 });
    mapPoint.push({ latitude: -19.5, longitude: 110.75, zoomLevel: 1, move: 0, nextPoint: 153 });
    mapPoint.push({ latitude: -18.5, longitude: 110, zoomLevel: 1, move: 0, nextPoint: 154 });
    mapPoint.push({ latitude: -18.25, longitude: 109.5, zoomLevel: 1, move: 0, nextPoint: 155 });
    mapPoint.push({ latitude: -18.25, longitude: 108.75, zoomLevel: 1, move: 0, nextPoint: 156 });
    mapPoint.push({ latitude: -19, longitude: 108.75, zoomLevel: 1, move: 0, nextPoint: 157 });
    mapPoint.push({ latitude: -20, longitude: 109.25, zoomLevel: 1, move: 0, nextPoint: 158 });
    mapPoint.push({ latitude: -20, longitude: 110, zoomLevel: 1, move: 1, nextPoint: 159 });
    mapPoint.push({ latitude: -20.5, longitude: 110, zoomLevel: 1, move: 0, nextPoint: 160 });
    mapPoint.push({ latitude: -20.5, longitude: 109.5, zoomLevel: 1, move: 0, nextPoint: 161 });
    mapPoint.push({ latitude: -21.5, longitude: 109.25, zoomLevel: 1, move: 0, nextPoint: 162 });
    mapPoint.push({ latitude: -21.5, longitude: 106, zoomLevel: 1, move: 0, nextPoint: 163 });
    mapPoint.push({ latitude: -18, longitude: 105.25, zoomLevel: 1, move: 0, nextPoint: 164 });
    mapPoint.push({ latitude: -16, longitude: 108.25, zoomLevel: 1, move: 0, nextPoint: 165 });
    mapPoint.push({ latitude: -13.75, longitude: 109.25, zoomLevel: 1, move: 0, nextPoint: 166 });
    mapPoint.push({ latitude: -11.5, longitude: 109, zoomLevel: 1, move: 0, nextPoint: 167 });
    mapPoint.push({ latitude: -10.5, longitude: 107.25, zoomLevel: 1, move: 0, nextPoint: 168 });
    mapPoint.push({ latitude: -8.25, longitude: 105, zoomLevel: 1, move: 0, nextPoint: 169 });
    mapPoint.push({ latitude: -10, longitude: 105, zoomLevel: 1, move: 0, nextPoint: 170 });
    mapPoint.push({ latitude: -13.75, longitude: 100.5, zoomLevel: 1, move: 0, nextPoint: 171 });
    mapPoint.push({ latitude: -9, longitude: 99.25, zoomLevel: 1, move: 0, nextPoint: 172 });
    mapPoint.push({ latitude: -7.25, longitude: 100.5, zoomLevel: 1, move: 0, nextPoint: 173 });
    mapPoint.push({ latitude: -5, longitude: 103.5, zoomLevel: 1, move: 0, nextPoint: 174 });
    mapPoint.push({ latitude: -2.5, longitude: 104, zoomLevel: 1, move: 0, nextPoint: 175 });
    mapPoint.push({ latitude: -1, longitude: 104, zoomLevel: 1, move: 0, nextPoint: 176 });
    mapPoint.push({ latitude: -1, longitude: 103.5, zoomLevel: 1, move: 0, nextPoint: 177 });
    mapPoint.push({ latitude: -3, longitude: 101.5, zoomLevel: 1, move: 0, nextPoint: 178 });
    mapPoint.push({ latitude: -5.5, longitude: 100.25, zoomLevel: 1, move: 1, nextPoint: 179 });    // End of Sumatra
    mapPoint.push({ latitude: -5.25, longitude: 95.25, zoomLevel: 1, move: 0, nextPoint: 180 });    // Beginning of Malayasia Mainland
    mapPoint.push({ latitude: -4.75, longitude: 97.75, zoomLevel: 1, move: 0, nextPoint: 181 });
    mapPoint.push({ latitude: -1.5, longitude: 101.5, zoomLevel: 1, move: 0, nextPoint: 182 });
    mapPoint.push({ latitude: -0.5, longitude: 103.75, zoomLevel: 1, move: 0, nextPoint: 183 });
    mapPoint.push({ latitude: 2.25, longitude: 104.75, zoomLevel: 1, move: 0, nextPoint: 184 });
    mapPoint.push({ latitude: 3, longitude: 105.75, zoomLevel: 1, move: 0, nextPoint: 185 });
    mapPoint.push({ latitude: 6, longitude: 105.75, zoomLevel: 1, move: 1, nextPoint: 186 });
    mapPoint.push({ latitude: 6.5, longitude: 106, zoomLevel: 1, move: 0, nextPoint: 187 });
    mapPoint.push({ latitude: 7, longitude: 110.5, zoomLevel: 1, move: 0, nextPoint: 188 });
    mapPoint.push({ latitude: 6.5, longitude: 111, zoomLevel: 1, move: 0, nextPoint: 189 });
    mapPoint.push({ latitude: 7.75, longitude: 114.25, zoomLevel: 1, move: 1, nextPoint: 190 });
    mapPoint.push({ latitude: 8, longitude: 116.25, zoomLevel: 1, move: 0, nextPoint: 191 });
    mapPoint.push({ latitude: 8, longitude: 119, zoomLevel: 1, move: 0, nextPoint: 192 });
    mapPoint.push({ latitude: 5.5, longitude: 120.25, zoomLevel: 1, move: 0, nextPoint: 193 });
    mapPoint.push({ latitude: 5.5, longitude: 119.25, zoomLevel: 1, move: 0, nextPoint: 194 });
    mapPoint.push({ latitude: 3.25, longitude: 119.25, zoomLevel: 1, move: 0, nextPoint: 195 });
    mapPoint.push({ latitude: 3.5, longitude: 118.75, zoomLevel: 1, move: 0, nextPoint: 196 });
    mapPoint.push({ latitude: 0.5, longitude: 119.75, zoomLevel: 1, move: 0, nextPoint: 197 });
    mapPoint.push({ latitude: -1, longitude: 120.75, zoomLevel: 1, move: 1, nextPoint: 198 });
    mapPoint.push({ latitude: -1, longitude: 119, zoomLevel: 1, move: 0, nextPoint: 199 });
    mapPoint.push({ latitude: -0.75, longitude: 118, zoomLevel: 1, move: 0, nextPoint: 200 });
    mapPoint.push({ latitude: 2, longitude: 116.25, zoomLevel: 1, move: 0, nextPoint: 201 });
    mapPoint.push({ latitude: 2.75, longitude: 116, zoomLevel: 1, move: 0, nextPoint: 202 });
    mapPoint.push({ latitude: 4, longitude: 114.5, zoomLevel: 1, move: 0, nextPoint: 203 });
    mapPoint.push({ latitude: 3.5, longitude: 111.75, zoomLevel: 1, move: 0, nextPoint: 204 });
    mapPoint.push({ latitude: 3, longitude: 110.25, zoomLevel: 1, move: 0, nextPoint: 205 });
    mapPoint.push({ latitude: -1, longitude: 109, zoomLevel: 1, move: 0, nextPoint: 206 });
    mapPoint.push({ latitude: -2.25, longitude: 109.5, zoomLevel: 1, move: 0, nextPoint: 207 });
    mapPoint.push({ latitude: -2, longitude: 111.25, zoomLevel: 1, move: 0, nextPoint: 208 });
    mapPoint.push({ latitude: -2.75, longitude: 111.75, zoomLevel: 1, move: 0, nextPoint: 209 });
    mapPoint.push({ latitude: -3.25, longitude: 113, zoomLevel: 1, move: 0, nextPoint: 210 });
    mapPoint.push({ latitude: -4.5, longitude: 114, zoomLevel: 1, move: 0, nextPoint: 211 });
    mapPoint.push({ latitude: -7, longitude: 117, zoomLevel: 1, move: 0, nextPoint: 212 });
    mapPoint.push({ latitude: -5.5, longitude: 119.75, zoomLevel: 1, move: 1, nextPoint: 213 });        // End of Borneo
    mapPoint.push({ latitude: -17.5, longitude: 122.5, zoomLevel: 1, move: 0, nextPoint: 214 });        // Start of Phillipines
    mapPoint.push({ latitude: -18.25, longitude: 120.75, zoomLevel: 1, move: 0, nextPoint: 215 });
    mapPoint.push({ latitude: -13, longitude: 121.5, zoomLevel: 1, move: 0, nextPoint: 216 });
    mapPoint.push({ latitude: -11.25, longitude: 125, zoomLevel: 1, move: 0, nextPoint: 217 });
    mapPoint.push({ latitude: -12, longitude: 125, zoomLevel: 1, move: 0, nextPoint: 218 });
    mapPoint.push({ latitude: -13.5, longitude: 122.75, zoomLevel: 1, move: 0, nextPoint: 219 });
    mapPoint.push({ latitude: -17.5, longitude: 122.5, zoomLevel: 1, move: 1, nextPoint: 220 });        // End of North Phillipines
    mapPoint.push({ latitude: -9.5, longitude: 126.75, zoomLevel: 1, move: 0, nextPoint: 221 });        // Beginning of South Phillipines
    mapPoint.push({ latitude: -5.75, longitude: 127, zoomLevel: 1, move: 0, nextPoint: 222 });
    mapPoint.push({ latitude: -5.75, longitude: 126, zoomLevel: 1, move: 0, nextPoint: 223 });
    mapPoint.push({ latitude: -6.75, longitude: 122.25, zoomLevel: 1, move: 0, nextPoint: 224 });
    mapPoint.push({ latitude: -9.5, longitude: 126.75, zoomLevel: 1, move: 1, nextPoint: 225 });
    mapPoint.push({ latitude: -5.5, longitude: 119.75, zoomLevel: 1, move: 0, nextPoint: 226 });
    mapPoint.push({ latitude: -3.25, longitude: 117.5, zoomLevel: 1, move: 0, nextPoint: 227 });
    mapPoint.push({ latitude: -1, longitude: 119, zoomLevel: 1, move: 1, nextPoint: 228 });
    mapPoint.push({ latitude: -1, longitude: 120.75, zoomLevel: 1, move: 0, nextPoint: 229 });
    mapPoint.push({ latitude: -1, longitude: 123.75, zoomLevel: 1, move: 0, nextPoint: 230 });
    mapPoint.push({ latitude: -2, longitude: 125, zoomLevel: 1, move: 0, nextPoint: 231 });
    mapPoint.push({ latitude: -1.75, longitude: 125.5, zoomLevel: 1, move: 0, nextPoint: 232 });
    mapPoint.push({ latitude: -0.75, longitude: 125, zoomLevel: 1, move: 0, nextPoint: 233 });
    mapPoint.push({ latitude: -0.5, longitude: 121.25, zoomLevel: 1, move: 0, nextPoint: 234 });
    mapPoint.push({ latitude: 1.25, longitude: 121, zoomLevel: 1, move: 0, nextPoint: 235 });
    mapPoint.push({ latitude: 0.75, longitude: 123.25, zoomLevel: 1, move: 0, nextPoint: 236 });
    mapPoint.push({ latitude: 2, longitude: 121.75, zoomLevel: 1, move: 0, nextPoint: 237 });
    mapPoint.push({ latitude: 4.5, longitude: 123.25, zoomLevel: 1, move: 0, nextPoint: 238 });
    mapPoint.push({ latitude: 5, longitude: 122.25, zoomLevel: 1, move: 0, nextPoint: 239 });
    mapPoint.push({ latitude: 5.5, longitude: 120.25, zoomLevel: 1, move: 1, nextPoint: 240 });
    mapPoint.push({ latitude: 8, longitude: 119, zoomLevel: 1, move: 1, nextPoint: 241 });
    mapPoint.push({ latitude: 0.75, longitude: 131, zoomLevel: 1, move: 0, nextPoint: 242 });
    mapPoint.push({ latitude: 1.5, longitude: 134, zoomLevel: 1, move: 0, nextPoint: 243 });
    mapPoint.push({ latitude: 3.75, longitude: 134.25, zoomLevel: 1, move: 0, nextPoint: 244 });
    mapPoint.push({ latitude: 2.5, longitude: 138, zoomLevel: 1, move: 0, nextPoint: 245 });
    mapPoint.push({ latitude: 6, longitude: 147.5, zoomLevel: 1, move: 0, nextPoint: 246 });
    mapPoint.push({ latitude: 10.25, longitude: 150.25, zoomLevel: 1, move: 0, nextPoint: 247 });
    mapPoint.push({ latitude: 10.25, longitude: 148, zoomLevel: 1, move: 0, nextPoint: 248 });
    mapPoint.push({ latitude: 8, longitude: 144.5, zoomLevel: 1, move: 0, nextPoint: 249 });
    mapPoint.push({ latitude: 9.25, longitude: 142.25, zoomLevel: 1, move: 0, nextPoint: 250 });
    mapPoint.push({ latitude: 8, longitude: 137.5, zoomLevel: 1, move: 0, nextPoint: 251 });
    mapPoint.push({ latitude: 3, longitude: 131, zoomLevel: 1, move: 0, nextPoint: 252 });
    mapPoint.push({ latitude: 0.75, longitude: 131, zoomLevel: 1, move: 1, nextPoint: 253 });
    mapPoint.push({ latitude: 10.5, longitude: 142, zoomLevel: 1, move: 0, nextPoint: 254 });
    mapPoint.push({ latitude: 19.25, longitude: 146.75, zoomLevel: 1, move: 0, nextPoint: 255 });
    mapPoint.push({ latitude: 21, longitude: 149.25, zoomLevel: 1, move: 0, nextPoint: 256 });
    mapPoint.push({ latitude: 25.5, longitude: 152.5, zoomLevel: 1, move: 0, nextPoint: 257 });
    mapPoint.push({ latitude: 28.75, longitude: 153.5, zoomLevel: 1, move: 0, nextPoint: 258 });
    mapPoint.push({ latitude: 33, longitude: 151.75, zoomLevel: 1, move: 0, nextPoint: 259 });
    mapPoint.push({ latitude: 37.5, longitude: 149.75, zoomLevel: 1, move: 0, nextPoint: 260 });
    mapPoint.push({ latitude: 38.5, longitude: 146.25, zoomLevel: 1, move: 0, nextPoint: 261 });
    mapPoint.push({ latitude: 38, longitude: 140.75, zoomLevel: 1, move: 1, nextPoint: 262 });
    mapPoint.push({ latitude: 40.75, longitude: 145, zoomLevel: 1, move: 0, nextPoint: 263 });
    mapPoint.push({ latitude: 40.75, longitude: 148.25, zoomLevel: 1, move: 0, nextPoint: 264 });
    mapPoint.push({ latitude: 43, longitude: 147.75, zoomLevel: 1, move: 1, nextPoint: 265 });      // Tasmania
    mapPoint.push({ latitude: 46, longitude: 166.5, zoomLevel: 1, move: 0, nextPoint: 266 });       // Start New Zealand
    mapPoint.push({ latitude: 44, longitude: 168.75, zoomLevel: 1, move: 0, nextPoint: 267 });
    mapPoint.push({ latitude: 43, longitude: 170.75, zoomLevel: 1, move: 0, nextPoint: 268 });
    mapPoint.push({ latitude: 42.25, longitude: 171.5, zoomLevel: 1, move: 0, nextPoint: 269 });
    mapPoint.push({ latitude: 40.5, longitude: 172.75, zoomLevel: 1, move: 1, nextPoint: 270 });
    mapPoint.push({ latitude: 39.5, longitude: 173.75, zoomLevel: 1, move: 0, nextPoint: 271 });
    mapPoint.push({ latitude: 39, longitude: 174.5, zoomLevel: 1, move: 0, nextPoint: 272 });
    mapPoint.push({ latitude: 37, longitude: 174.5, zoomLevel: 1, move: 0, nextPoint: 273 });
    mapPoint.push({ latitude: 35.5, longitude: 172.75, zoomLevel: 1, move: 0, nextPoint: 274 });
    mapPoint.push({ latitude: 38.5, longitude: 177, zoomLevel: 1, move: 0, nextPoint: 275 });
    mapPoint.push({ latitude: 37.5, longitude: 178, zoomLevel: 1, move: 0, nextPoint: 276 });
    mapPoint.push({ latitude: 38, longitude: 178.75, zoomLevel: 1, move: 0, nextPoint: 277 });
    mapPoint.push({ latitude: 39.25, longitude: 178, zoomLevel: 1, move: 0, nextPoint: 278 });
    mapPoint.push({ latitude: 41.5, longitude: 175.25, zoomLevel: 1, move: 0, nextPoint: 279 });
    mapPoint.push({ latitude: 41, longitude: 174.75, zoomLevel: 1, move: 0, nextPoint: 280 });
    mapPoint.push({ latitude: 40, longitude: 175, zoomLevel: 1, move: 0, nextPoint: 281 });
    mapPoint.push({ latitude: 39.75, longitude: 173.75, zoomLevel: 1, move: 0, nextPoint: 282 });
    mapPoint.push({ latitude: 39.5, longitude: 173.75, zoomLevel: 1, move: 1, nextPoint: 283 });
    mapPoint.push({ latitude: 40.5, longitude: 172.75, zoomLevel: 1, move: 0, nextPoint: 284 });
    mapPoint.push({ latitude: 41.75, longitude: 174.25, zoomLevel: 1, move: 0, nextPoint: 285 });
    mapPoint.push({ latitude: 43.75, longitude: 173, zoomLevel: 1, move: 0, nextPoint: 286 });
    mapPoint.push({ latitude: 44.5, longitude: 171.25, zoomLevel: 1, move: 0, nextPoint: 287 });
    mapPoint.push({ latitude: 45.75, longitude: 170.75, zoomLevel: 1, move: 1, nextPoint: 288 });
    mapPoint.push({ latitude: 46.75, longitude: 169, zoomLevel: 1, move: 1, nextPoint: 289 });
    mapPoint.push({ latitude: 45.75, longitude: 170.75, zoomLevel: 1, move: 0, nextPoint: 290 });
    mapPoint.push({ latitude: 46.75, longitude: 169, zoomLevel: 1, move: 0, nextPoint: 291 });      // End New Zealand
    mapPoint.push({ latitude: 46, longitude: 166.5, zoomLevel: 1, move: 1, nextPoint: 292 });       // Back to Tasmnia
    mapPoint.push({ latitude: 43.25, longitude: 146.5, zoomLevel: 1, move: 0, nextPoint: 293 });
    mapPoint.push({ latitude: 43, longitude: 147.75, zoomLevel: 1, move: 0, nextPoint: 294 });
    mapPoint.push({ latitude: 43.25, longitude: 146.5, zoomLevel: 1, move: 0, nextPoint: 295 });
    mapPoint.push({ latitude: 42.5, longitude: 145.25, zoomLevel: 1, move: 0, nextPoint: 296 });
    mapPoint.push({ latitude: 40.75, longitude: 144.75, zoomLevel: 1, move: 1, nextPoint: 297 });
    mapPoint.push({ latitude: 38, longitude: 140.75, zoomLevel: 1, move: 0, nextPoint: 298 });
    mapPoint.push({ latitude: 32.25, longitude: 133.5, zoomLevel: 1, move: 0, nextPoint: 299 });
    mapPoint.push({ latitude: 31.25, longitude: 131.25, zoomLevel: 1, move: 0, nextPoint: 300 });
    mapPoint.push({ latitude: 33.75, longitude: 123.25, zoomLevel: 1, move: 0, nextPoint: 301 });
    mapPoint.push({ latitude: 34, longitude: 120.25, zoomLevel: 1, move: 0, nextPoint: 302 });
    mapPoint.push({ latitude: 35, longitude: 118, zoomLevel: 1, move: 0, nextPoint: 303 });
    mapPoint.push({ latitude: 34, longitude: 115, zoomLevel: 1, move: 0, nextPoint: 304 });
    mapPoint.push({ latitude: 32, longitude: 116, zoomLevel: 1, move: 0, nextPoint: 305 });
    mapPoint.push({ latitude: 25.75, longitude: 113, zoomLevel: 1, move: 0, nextPoint: 306 });
    mapPoint.push({ latitude: 22, longitude: 114.25, zoomLevel: 1, move: 0, nextPoint: 307 });
    mapPoint.push({ latitude: 19.75, longitude: 120.25, zoomLevel: 1, move: 0, nextPoint: 308 });
    mapPoint.push({ latitude: 17.25, longitude: 122.25, zoomLevel: 1, move: 0, nextPoint: 309 });   // Australia NOrthern Territory
    mapPoint.push({ latitude: 13.75, longitude: 127, zoomLevel: 1, move: 0, nextPoint: 310 });
    mapPoint.push({ latitude: 15, longitude: 129.5, zoomLevel: 1, move: 0, nextPoint: 311 });
    mapPoint.push({ latitude: 12.5, longitude: 130.75, zoomLevel: 1, move: 0, nextPoint: 312 });
    mapPoint.push({ latitude: 12.25, longitude: 137.5, zoomLevel: 1, move: 0, nextPoint: 313 });
    mapPoint.push({ latitude: 14.75, longitude: 135.5, zoomLevel: 1, move: 0, nextPoint: 314 });
    mapPoint.push({ latitude: 17.5, longitude: 140.75, zoomLevel: 1, move: 0, nextPoint: 315 });
    mapPoint.push({ latitude: 10.5, longitude: 141.5, zoomLevel: 1, move: 0, nextPoint: 316 });
    mapPoint.push({ latitude: 10.5, longitude: 142, zoomLevel: 1, move: 1, nextPoint: 317 });
    mapPoint.push({ latitude: 8, longitude: 119, zoomLevel: 1, move: 0, nextPoint: 318 });
    mapPoint.push({ latitude: 8.75, longitude: 117.75, zoomLevel: 1, move: 0, nextPoint: 319 });
    mapPoint.push({ latitude: 8, longitude: 116.25, zoomLevel: 1, move: 1, nextPoint: 320 });
    mapPoint.push({ latitude: 7.75, longitude: 114.25, zoomLevel: 1, move: 0, nextPoint: 321 });
    mapPoint.push({ latitude: 7, longitude: 105.75, zoomLevel: 1, move: 0, nextPoint: 322 });
    mapPoint.push({ latitude: 6.5, longitude: 106, zoomLevel: 1, move: 1, nextPoint: 323 });
    mapPoint.push({ latitude: 6, longitude: 105.75, zoomLevel: 1, move: 0, nextPoint: 324 });
    mapPoint.push({ latitude: 5.75, longitude: 104.5, zoomLevel: 1, move: 0, nextPoint: 325 });
    mapPoint.push({ latitude: 2.5, longitude: 101.25, zoomLevel: 1, move: 0, nextPoint: 326 });
    mapPoint.push({ latitude: -1.75, longitude: 98.75, zoomLevel: 1, move: 0, nextPoint: 327 });
    mapPoint.push({ latitude: -5.25, longitude: 95.25, zoomLevel: 1, move: 1, nextPoint: 328 });
    mapPoint.push({ latitude: -5.5, longitude: 100.25, zoomLevel: 1, move: 0, nextPoint: 329 });
    mapPoint.push({ latitude: -7.25, longitude: 99.5, zoomLevel: 1, move: 0, nextPoint: 330 });
    mapPoint.push({ latitude: -8, longitude: 98.25, zoomLevel: 1, move: 0, nextPoint: 331 });
    mapPoint.push({ latitude: -11.5, longitude: 97.5, zoomLevel: 1, move: 0, nextPoint: 332 });
    mapPoint.push({ latitude: -16.75, longitude: 96.25, zoomLevel: 1, move: 0, nextPoint: 333 });
    mapPoint.push({ latitude: -16, longitude: 94.5, zoomLevel: 1, move: 0, nextPoint: 334 });
    mapPoint.push({ latitude: -17.5, longitude: 94.5, zoomLevel: 1, move: 0, nextPoint: 335 });
    mapPoint.push({ latitude: -19.25, longitude: 92.75, zoomLevel: 1, move: 0, nextPoint: 336 });
    mapPoint.push({ latitude: -22.25, longitude: 91.75, zoomLevel: 1, move: 0, nextPoint: 337 });
    mapPoint.push({ latitude: -22, longitude: 88, zoomLevel: 1, move: 0, nextPoint: 338 });
    mapPoint.push({ latitude: -20.25, longitude: 86.5, zoomLevel: 1, move: 0, nextPoint: 339 });
    mapPoint.push({ latitude: -17, longitude: 82.25, zoomLevel: 1, move: 0, nextPoint: 340 });      // India
    mapPoint.push({ latitude: -16.5, longitude: 82.5, zoomLevel: 1, move: 0, nextPoint: 341 });
    mapPoint.push({ latitude: -16.25, longitude: 81, zoomLevel: 1, move: 0, nextPoint: 342 });
    mapPoint.push({ latitude: -15.5, longitude: 80, zoomLevel: 1, move: 0, nextPoint: 343 });
    //mapPoint.push({ latitude: -11, longitude: 77, zoomLevel: 1, move: 0, nextPoint: 344 });
    mapPoint.push({ latitude: -15.375, longitude: 79.875, zoomLevel: 1, move: 0, nextPoint: 345 });
    mapPoint.push({ latitude: -11.5, longitude: 79.5, zoomLevel: 1, move: 0, nextPoint: 346 });
    mapPoint.push({ latitude: -10.5, longitude: 79.5, zoomLevel: 1, move: 1, nextPoint: 347 });
    mapPoint.push({ latitude: -10.5, longitude: 78.75, zoomLevel: 1, move: 1, nextPoint: 348 });
    mapPoint.push({ latitude: -10.5, longitude: 79.5, zoomLevel: 1, move: 0, nextPoint: 349 });
    mapPoint.push({ latitude: -10.5, longitude: 78.75, zoomLevel: 1, move: 1, nextPoint: 350 });
    mapPoint.push({ latitude: -9.75, longitude: 80, zoomLevel: 1, move: 0, nextPoint: 351 });
    mapPoint.push({ latitude: -7.25, longitude: 81.75, zoomLevel: 1, move: 0, nextPoint: 352 });
    mapPoint.push({ latitude: -6.75, longitude: 81.5, zoomLevel: 1, move: 0, nextPoint: 353 });
    mapPoint.push({ latitude: -6, longitude: 80.5, zoomLevel: 1, move: 0, nextPoint: 354 });
    mapPoint.push({ latitude: -6.25, longitude: 80.25, zoomLevel: 1, move: 0, nextPoint: 355 });
    mapPoint.push({ latitude: -8, longitude: 79.75, zoomLevel: 1, move: 0, nextPoint: 356 });
    mapPoint.push({ latitude: -9.75, longitude: 80, zoomLevel: 1, move: 1, nextPoint: 357 });
    mapPoint.push({ latitude: -10.5, longitude: 78.75, zoomLevel: 1, move: 0, nextPoint: 358 });
    mapPoint.push({ latitude: -9.25, longitude: 78.5, zoomLevel: 1, move: 0, nextPoint: 359 });
    mapPoint.push({ latitude: -8.75, longitude: 78.25, zoomLevel: 1, move: 0, nextPoint: 360 });
    mapPoint.push({ latitude: -8.25, longitude: 78, zoomLevel: 1, move: 0, nextPoint: 361 });
    mapPoint.push({ latitude: -8, longitude: 77.5, zoomLevel: 1, move: 0, nextPoint: 362 });
    mapPoint.push({ latitude: -8.75, longitude: 77, zoomLevel: 1, move: 0, nextPoint: 363 });
    mapPoint.push({ latitude: -9.5, longitude: 76.5, zoomLevel: 1, move: 0, nextPoint: 364 });
    mapPoint.push({ latitude: -13.5, longitude: 74.75, zoomLevel: 1, move: 0, nextPoint: 365 });
    mapPoint.push({ latitude: -14.75, longitude: 74.25, zoomLevel: 1, move: 0, nextPoint: 366 });
    mapPoint.push({ latitude: -15, longitude: 73.75, zoomLevel: 1, move: 0, nextPoint: 367 });
    mapPoint.push({ latitude: -16, longitude: 73.5, zoomLevel: 1, move: 0, nextPoint: 368 });
    mapPoint.push({ latitude: -19, longitude: 72.75, zoomLevel: 1, move: 0, nextPoint: 369 });
    mapPoint.push({ latitude: -21.25, longitude: 73, zoomLevel: 1, move: 0, nextPoint: 370 });
    mapPoint.push({ latitude: -20.75, longitude: 71, zoomLevel: 1, move: 0, nextPoint: 371 });
    mapPoint.push({ latitude: -25, longitude: 67, zoomLevel: 1, move: 0, nextPoint: 372 });
    mapPoint.push({ latitude: -25.25, longitude: 66.5, zoomLevel: 1, move: 0, nextPoint: 373 });
    mapPoint.push({ latitude: -25.75, longitude: 66.5, zoomLevel: 1, move: 0, nextPoint: 374 });
    mapPoint.push({ latitude: -25.25, longitude: 61.5, zoomLevel: 1, move: 0, nextPoint: 375 });
    mapPoint.push({ latitude: -25.75, longitude: 57.25, zoomLevel: 1, move: 0, nextPoint: 376 });
    mapPoint.push({ latitude: -27.25, longitude: 56.25, zoomLevel: 1, move: 0, nextPoint: 377 });
    mapPoint.push({ latitude: -26.5, longitude: 55, zoomLevel: 1, move: 0, nextPoint: 378 });
    mapPoint.push({ latitude: -28, longitude: 52, zoomLevel: 1, move: 0, nextPoint: 379 });
    mapPoint.push({ latitude: -29.5, longitude: 50.75, zoomLevel: 1, move: 0, nextPoint: 380 });
    mapPoint.push({ latitude: -30.5, longitude: 49.25, zoomLevel: 1, move: 0, nextPoint: 381 });
    mapPoint.push({ latitude: -29.5, longitude: 47, zoomLevel: 1, move: 0, nextPoint: 382 });
    mapPoint.push({ latitude: -26.25, longitude: 50, zoomLevel: 1, move: 0, nextPoint: 383 });
    mapPoint.push({ latitude: -24.75, longitude: 50.75, zoomLevel: 1, move: 0, nextPoint: 384 });
    mapPoint.push({ latitude: -25, longitude: 51, zoomLevel: 1, move: 0, nextPoint: 385 });
    mapPoint.push({ latitude: -24.75, longitude: 51.25, zoomLevel: 1, move: 0, nextPoint: 386 });
    mapPoint.push({ latitude: -24.25, longitude: 51.25, zoomLevel: 1, move: 0, nextPoint: 387 });
    mapPoint.push({ latitude: -24, longitude: 53, zoomLevel: 1, move: 0, nextPoint: 388 });
    mapPoint.push({ latitude: -26, longitude: 56.25, zoomLevel: 1, move: 0, nextPoint: 389 });
    mapPoint.push({ latitude: -24, longitude: 57, zoomLevel: 1, move: 0, nextPoint: 390 });
    mapPoint.push({ latitude: -23.5, longitude: 58.5, zoomLevel: 1, move: 0, nextPoint: 391 });
    mapPoint.push({ latitude: -22.25, longitude: 59.75, zoomLevel: 1, move: 0, nextPoint: 392 });
    mapPoint.push({ latitude: -19, longitude: 57.25, zoomLevel: 1, move: 0, nextPoint: 393 });
    mapPoint.push({ latitude: -15.75, longitude: 52.25, zoomLevel: 1, move: 0, nextPoint: 394 });
    mapPoint.push({ latitude: -12.75, longitude: 45, zoomLevel: 1, move: 0, nextPoint: 395 });
    mapPoint.push({ latitude: -13, longitude: 43, zoomLevel: 1, move: 0, nextPoint: 396 });
    mapPoint.push({ latitude: -17, longitude: 42.5, zoomLevel: 1, move: 0, nextPoint: 397 });
    mapPoint.push({ latitude: -20.25, longitude: 40.25, zoomLevel: 1, move: 0, nextPoint: 398 });
    mapPoint.push({ latitude: -20.5, longitude: 40, zoomLevel: 1, move: 0, nextPoint: 399 });
    mapPoint.push({ latitude: -21.5, longitude: 39.25, zoomLevel: 1, move: 0, nextPoint: 400 });
    mapPoint.push({ latitude: -27.75, longitude: 35.5, zoomLevel: 1, move: 0, nextPoint: 401 });
    mapPoint.push({ latitude: -28, longitude: 34.75, zoomLevel: 1, move: 0, nextPoint: 402 });
    mapPoint.push({ latitude: -29.25, longitude: 34.75, zoomLevel: 1, move: 0, nextPoint: 403 });
    mapPoint.push({ latitude: -27.5, longitude: 34.25, zoomLevel: 1, move: 0, nextPoint: 404 });
    mapPoint.push({ latitude: -30, longitude: 32.5, zoomLevel: 1, move: 0, nextPoint: 405 });
    mapPoint.push({ latitude: -22, longitude: 37, zoomLevel: 1, move: 0, nextPoint: 406 });
    mapPoint.push({ latitude: -18.75, longitude: 37.25, zoomLevel: 1, move: 0, nextPoint: 407 });
    mapPoint.push({ latitude: -18, longitude: 38, zoomLevel: 1, move: 0, nextPoint: 408 });
    mapPoint.push({ latitude: -15.25, longitude: 39.75, zoomLevel: 1, move: 0, nextPoint: 409 });
    mapPoint.push({ latitude: -12.5, longitude: 43, zoomLevel: 1, move: 0, nextPoint: 410 });
    mapPoint.push({ latitude: -10.5, longitude: 43.75, zoomLevel: 1, move: 0, nextPoint: 411 });
    mapPoint.push({ latitude: -10.5, longitude: 44.5, zoomLevel: 1, move: 0, nextPoint: 412 });
    mapPoint.push({ latitude: -11.75, longitude: 51, zoomLevel: 1, move: 0, nextPoint: 413 });
    mapPoint.push({ latitude: -1.75, longitude: 40.75, zoomLevel: 1, move: 0, nextPoint: 414 });
    mapPoint.push({ latitude: 7, longitude: 38.75, zoomLevel: 1, move: 0, nextPoint: 415 });
    mapPoint.push({ latitude: 11, longitude: 41, zoomLevel: 1, move: 0, nextPoint: 416 });
    mapPoint.push({ latitude: 15.5, longitude: 40.75, zoomLevel: 1, move: 0, nextPoint: 417 });
    mapPoint.push({ latitude: 20.25, longitude: 35, zoomLevel: 1, move: 0, nextPoint: 418 });
    mapPoint.push({ latitude: 25.25, longitude: 35.5, zoomLevel: 1, move: 0, nextPoint: 419 });
    mapPoint.push({ latitude: 26, longitude: 33.75, zoomLevel: 1, move: 0, nextPoint: 420 });
    mapPoint.push({ latitude: 28.5, longitude: 33.5, zoomLevel: 1, move: 0, nextPoint: 421 });
    mapPoint.push({ latitude: 33, longitude: 28, zoomLevel: 1, move: 0, nextPoint: 422 });
    mapPoint.push({ latitude: 34.5, longitude: 19.75, zoomLevel: 1, move: 0, nextPoint: 423 });
    mapPoint.push({ latitude: 33, longitude: 18, zoomLevel: 1, move: 0, nextPoint: 424 });
    mapPoint.push({ latitude: 32.5, longitude: 18.5, zoomLevel: 1, move: 1, nextPoint: 425 });      // South Africa
    mapPoint.push({ latitude: 12.5, longitude: 49.25, zoomLevel: 1, move: 0, nextPoint: 426 });     // Madagasga
    mapPoint.push({ latitude: 15.5, longitude: 50.25, zoomLevel: 1, move: 0, nextPoint: 427 });
    mapPoint.push({ latitude: 25, longitude: 47.25, zoomLevel: 1, move: 0, nextPoint: 428 });
    mapPoint.push({ latitude: 26, longitude: 45.5, zoomLevel: 1, move: 0, nextPoint: 429 });
    mapPoint.push({ latitude: 25, longitude: 43.75, zoomLevel: 1, move: 0, nextPoint: 430 });
    mapPoint.push({ latitude: 22.5, longitude: 42.75, zoomLevel: 1, move: 0, nextPoint: 431 });
    mapPoint.push({ latitude: 20, longitude: 43.75, zoomLevel: 1, move: 0, nextPoint: 432 });
    mapPoint.push({ latitude: 17.5, longitude: 44, zoomLevel: 1, move: 0, nextPoint: 433 });
    mapPoint.push({ latitude: 16.25, longitude: 44.25, zoomLevel: 1, move: 0, nextPoint: 434 });
    mapPoint.push({ latitude: 15.25, longitude: 47, zoomLevel: 1, move: 0, nextPoint: 435 });
    mapPoint.push({ latitude: 12.5, longitude: 49.25, zoomLevel: 1, move: 1, nextPoint: 436 });
    mapPoint.push({ latitude: 32.25, longitude: 18.75, zoomLevel: 1, move: 0, nextPoint: 437 });
    mapPoint.push({ latitude: 23, longitude: 14.5, zoomLevel: 1, move: 0, nextPoint: 438 });
    mapPoint.push({ latitude: 17.75, longitude: 11.75, zoomLevel: 1, move: 0, nextPoint: 439 });
    mapPoint.push({ latitude: 12.25, longitude: 13.5, zoomLevel: 1, move: 0, nextPoint: 440 });
    mapPoint.push({ latitude: 0.75, longitude: 8.75, zoomLevel: 1, move: 0, nextPoint: 441 });
    mapPoint.push({ latitude: -4.25, longitude: 10, zoomLevel: 1, move: 0, nextPoint: 442 });
    mapPoint.push({ latitude: -5, longitude: 9, zoomLevel: 1, move: 0, nextPoint: 443 });
    mapPoint.push({ latitude: -4.75, longitude: 5.75, zoomLevel: 1, move: 0, nextPoint: 444 });
    mapPoint.push({ latitude: -6.5, longitude: 3.5, zoomLevel: 1, move: 0, nextPoint: 445 });
    mapPoint.push({ latitude: -5, longitude: -1.75, zoomLevel: 1, move: 0, nextPoint: 446 });
    mapPoint.push({ latitude: -5, longitude: -7.75, zoomLevel: 1, move: 0, nextPoint: 447 });
    mapPoint.push({ latitude: -8.5, longitude: -13.25, zoomLevel: 1, move: 0, nextPoint: 448 });
    mapPoint.push({ latitude: -14.5, longitude: -17.5, zoomLevel: 1, move: 0, nextPoint: 449 });
    mapPoint.push({ latitude: -23.75, longitude: -16, zoomLevel: 1, move: 0, nextPoint: 450 });
    mapPoint.push({ latitude: -30.5, longitude: -10, zoomLevel: 1, move: 0, nextPoint: 451 });
    mapPoint.push({ latitude: -35.75, longitude: -5.75, zoomLevel: 1, move: 0, nextPoint: 452 });
    mapPoint.push({ latitude: -35.5, longitude: -5.5, zoomLevel: 1, move: 0, nextPoint: 453 });
    mapPoint.push({ latitude: -35.25, longitude: -2, zoomLevel: 1, move: 0, nextPoint: 454 });
    mapPoint.push({ latitude: -36.75, longitude: 3, zoomLevel: 1, move: 0, nextPoint: 455 });
    mapPoint.push({ latitude: -37, longitude: 11.25, zoomLevel: 1, move: 0, nextPoint: 456 });
    mapPoint.push({ latitude: -34.25, longitude: 10.25, zoomLevel: 1, move: 0, nextPoint: 457 });
    mapPoint.push({ latitude: -30.75, longitude: 19.75, zoomLevel: 1, move: 0, nextPoint: 458 });
    mapPoint.push({ latitude: -32.75, longitude: 22, zoomLevel: 1, move: 0, nextPoint: 459 });
    mapPoint.push({ latitude: -31.25, longitude: 33.5, zoomLevel: 1, move: 0, nextPoint: 460 });
    mapPoint.push({ latitude: -34.75, longitude: 36, zoomLevel: 1, move: 0, nextPoint: 461 });
    mapPoint.push({ latitude: -36.5, longitude: 36.25, zoomLevel: 1, move: 0, nextPoint: 462 });
    mapPoint.push({ latitude: -36.25, longitude: 32.5, zoomLevel: 1, move: 0, nextPoint: 463 });
    mapPoint.push({ latitude: -36.75, longitude: 30.75, zoomLevel: 1, move: 0, nextPoint: 464 });
    mapPoint.push({ latitude: -36.25, longitude: 30.5, zoomLevel: 1, move: 0, nextPoint: 465 });
    mapPoint.push({ latitude: -37, longitude: 27.5, zoomLevel: 1, move: 0, nextPoint: 466 });
    mapPoint.push({ latitude: -40, longitude: 26.25, zoomLevel: 1, move: 0, nextPoint: 467 });
    mapPoint.push({ latitude: -42.25, longitude: 33, zoomLevel: 1, move: 0, nextPoint: 468 });
    mapPoint.push({ latitude: -42.25, longitude: 35, zoomLevel: 1, move: 0, nextPoint: 469 });
    mapPoint.push({ latitude: -41, longitude: 39.75, zoomLevel: 1, move: 0, nextPoint: 470 });
    mapPoint.push({ latitude: -41.5, longitude: 41.5, zoomLevel: 1, move: 0, nextPoint: 471 });
    mapPoint.push({ latitude: -43, longitude: 41, zoomLevel: 1, move: 0, nextPoint: 472 });
    mapPoint.push({ latitude: -46.5, longitude: 30.75, zoomLevel: 1, move: 0, nextPoint: 473 });
    mapPoint.push({ latitude: -42.5, longitude: 27.5, zoomLevel: 1, move: 0, nextPoint: 474 });
    mapPoint.push({ latitude: -41.25, longitude: 27.5, zoomLevel: 1, move: 0, nextPoint: 475 });
    mapPoint.push({ latitude: -41, longitude: 27.75, zoomLevel: 1, move: 0, nextPoint: 476 });
    mapPoint.push({ latitude: -40.75, longitude: 23, zoomLevel: 1, move: 0, nextPoint: 477 });
    mapPoint.push({ latitude: -38, longitude: 23.75, zoomLevel: 1, move: 0, nextPoint: 478 });
    mapPoint.push({ latitude: -38.25, longitude: 21, zoomLevel: 1, move: 0, nextPoint: 479 });
    mapPoint.push({ latitude: -40.5, longitude: 19.25, zoomLevel: 1, move: 0, nextPoint: 480 });
    mapPoint.push({ latitude: -42, longitude: 19.5, zoomLevel: 1, move: 0, nextPoint: 481 });
    mapPoint.push({ latitude: -43.25, longitude: 16.5, zoomLevel: 1, move: 0, nextPoint: 482 });
    mapPoint.push({ latitude: -45.75, longitude: 13.75, zoomLevel: 1, move: 0, nextPoint: 483 });
    mapPoint.push({ latitude: -45.5, longitude: 12.25, zoomLevel: 1, move: 0, nextPoint: 484 });
    mapPoint.push({ latitude: -44, longitude: 12.5, zoomLevel: 1, move: 0, nextPoint: 485 });
    mapPoint.push({ latitude: -43.5, longitude: 13.5, zoomLevel: 1, move: 0, nextPoint: 486 });
    mapPoint.push({ latitude: -42.5, longitude: 14.25, zoomLevel: 1, move: 0, nextPoint: 487 });
    mapPoint.push({ latitude: -40.75, longitude: 18, zoomLevel: 1, move: 0, nextPoint: 488 });
    mapPoint.push({ latitude: -40, longitude: 18.75, zoomLevel: 1, move: 0, nextPoint: 489 });
    mapPoint.push({ latitude: -39.75, longitude: 18.5, zoomLevel: 1, move: 0, nextPoint: 490 });
    mapPoint.push({ latitude: -40.5, longitude: 17.25, zoomLevel: 1, move: 0, nextPoint: 491 });
    mapPoint.push({ latitude: -39.5, longitude: 16.5, zoomLevel: 1, move: 0, nextPoint: 492 });
    mapPoint.push({ latitude: -38.75, longitude: 17, zoomLevel: 1, move: 0, nextPoint: 493 });
    mapPoint.push({ latitude: -38, longitude: 16, zoomLevel: 1, move: 0, nextPoint: 494 });
    mapPoint.push({ latitude: -38.25, longitude: 15.75, zoomLevel: 1, move: 1, nextPoint: 495 });
    mapPoint.push({ latitude: -38.25, longitude: 15.5, zoomLevel: 1, move: 0, nextPoint: 496 });
    mapPoint.push({ latitude: -36.5, longitude: 15, zoomLevel: 1, move: 0, nextPoint: 497 });
    mapPoint.push({ latitude: -37.75, longitude: 12.5, zoomLevel: 1, move: 0, nextPoint: 498 });
    mapPoint.push({ latitude: -38.25, longitude: 15.5, zoomLevel: 1, move: 1, nextPoint: 499 });
    mapPoint.push({ latitude: -38.25, longitude: 15.75, zoomLevel: 1, move: 0, nextPoint: 500 });
    mapPoint.push({ latitude: -38.75, longitude: 16.25, zoomLevel: 1, move: 0, nextPoint: 501 });
    mapPoint.push({ latitude: -40, longitude: 15.75, zoomLevel: 1, move: 0, nextPoint: 502 });
    mapPoint.push({ latitude: -42, longitude: 12, zoomLevel: 1, move: 0, nextPoint: 503 });
    mapPoint.push({ latitude: -44, longitude: 10, zoomLevel: 1, move: 0, nextPoint: 504 });
    mapPoint.push({ latitude: -44.5, longitude: 9, zoomLevel: 1, move: 0, nextPoint: 505 });
    mapPoint.push({ latitude: -43.25, longitude: 6, zoomLevel: 1, move: 0, nextPoint: 506 });
    mapPoint.push({ latitude: -43.5, longitude: 3.75, zoomLevel: 1, move: 0, nextPoint: 507 });
    mapPoint.push({ latitude: -43, longitude: 3, zoomLevel: 1, move: 0, nextPoint: 508 });
    mapPoint.push({ latitude: -41.75, longitude: 2.75, zoomLevel: 1, move: 0, nextPoint: 509 });
    mapPoint.push({ latitude: -39.5, longitude: -0.5, zoomLevel: 1, move: 0, nextPoint: 510 });
    mapPoint.push({ latitude: -38.5, longitude: -0.5, zoomLevel: 1, move: 0, nextPoint: 511 });
    mapPoint.push({ latitude: -37.75, longitude: -1, zoomLevel: 1, move: 0, nextPoint: 512 });
    mapPoint.push({ latitude: -36.75, longitude: -2.25, zoomLevel: 1, move: 0, nextPoint: 513 });
    mapPoint.push({ latitude: -36.75, longitude: -4.25, zoomLevel: 1, move: 0, nextPoint: 514 });
    mapPoint.push({ latitude: -36, longitude: -5.5, zoomLevel: 1, move: 1, nextPoint: 515 });
    mapPoint.push({ latitude: -64.5, longitude: -14.75, zoomLevel: 1, move: 0, nextPoint: 516 });
    mapPoint.push({ latitude: -63.5, longitude: -18.5, zoomLevel: 1, move: 0, nextPoint: 517 });
    mapPoint.push({ latitude: -63.75, longitude: -22.75, zoomLevel: 1, move: 0, nextPoint: 518 });
    mapPoint.push({ latitude: -64, longitude: -22.75, zoomLevel: 1, move: 0, nextPoint: 519 });
    mapPoint.push({ latitude: -64.25, longitude: -21.75, zoomLevel: 1, move: 0, nextPoint: 520 });
    mapPoint.push({ latitude: -65, longitude: -21.75, zoomLevel: 1, move: 0, nextPoint: 521 });
    mapPoint.push({ latitude: -65, longitude: -24, zoomLevel: 1, move: 0, nextPoint: 522 });
    mapPoint.push({ latitude: -65.25, longitude: -24, zoomLevel: 1, move: 0, nextPoint: 523 });
    mapPoint.push({ latitude: -65.5, longitude: -22.75, zoomLevel: 1, move: 0, nextPoint: 524 });
    mapPoint.push({ latitude: -66.5, longitude: -22.75, zoomLevel: 1, move: 0, nextPoint: 525 });
    mapPoint.push({ latitude: -65.5, longitude: -21, zoomLevel: 1, move: 0, nextPoint: 526 });
    mapPoint.push({ latitude: -66.5, longitude: -16.75, zoomLevel: 1, move: 0, nextPoint: 527 });
    mapPoint.push({ latitude: -66.5, longitude: -16.25, zoomLevel: 1, move: 0, nextPoint: 528 });
    mapPoint.push({ latitude: -65.5, longitude: -13.5, zoomLevel: 1, move: 0, nextPoint: 529 });
    mapPoint.push({ latitude: -64.5, longitude: -14.75, zoomLevel: 1, move: 1, nextPoint: 530 });
    mapPoint.push({ latitude: -70, longitude: -23, zoomLevel: 1, move: 0, nextPoint: 531 });
    mapPoint.push({ latitude: -77.75, longitude: -21, zoomLevel: 1, move: 0, nextPoint: 532 });
    mapPoint.push({ latitude: -81, longitude: -13, zoomLevel: 1, move: 0, nextPoint: 533 });
    mapPoint.push({ latitude: -83, longitude: -27, zoomLevel: 1, move: 0, nextPoint: 534 });
    mapPoint.push({ latitude: -82, longitude: -50.75, zoomLevel: 1, move: 0, nextPoint: 535 });
    mapPoint.push({ latitude: -80, longitude: -66.75, zoomLevel: 1, move: 0, nextPoint: 536 });
    mapPoint.push({ latitude: -76.75, longitude: -70, zoomLevel: 1, move: 0, nextPoint: 537 });
    mapPoint.push({ latitude: -76.5, longitude: -61.75, zoomLevel: 1, move: 0, nextPoint: 538 });
    mapPoint.push({ latitude: -75.75, longitude: -60.25, zoomLevel: 1, move: 0, nextPoint: 539 });
    mapPoint.push({ latitude: -66, longitude: -53, zoomLevel: 1, move: 0, nextPoint: 540 });
    mapPoint.push({ latitude: -61.25, longitude: -46.75, zoomLevel: 1, move: 1, nextPoint: 541 });
    mapPoint.push({ latitude: -59.75, longitude: -43, zoomLevel: 1, move: 0, nextPoint: 542 });
    mapPoint.push({ latitude: -65, longitude: -40, zoomLevel: 1, move: 1, nextPoint: 543 });
    mapPoint.push({ latitude: -59.75, longitude: -43, zoomLevel: 1, move: 0, nextPoint: 544 });
    mapPoint.push({ latitude: -61.25, longitude: -46.75, zoomLevel: 1, move: 1, nextPoint: 545 });
    mapPoint.push({ latitude: -65, longitude: -40.25, zoomLevel: 1, move: 0, nextPoint: 546 });
    mapPoint.push({ latitude: -65.5, longitude: -37, zoomLevel: 1, move: 0, nextPoint: 547 });
    mapPoint.push({ latitude: -70, longitude: -23.25, zoomLevel: 1, move: 1, nextPoint: 548 });
    mapPoint.push({ latitude: -80, longitude: -69.5, zoomLevel: 1, move: 0, nextPoint: 549 });
    mapPoint.push({ latitude: -76.75, longitude: -79.25, zoomLevel: 1, move: 0, nextPoint: 550 });
    mapPoint.push({ latitude: -77.75, longitude: -87.25, zoomLevel: 1, move: 0, nextPoint: 551 });
    mapPoint.push({ latitude: -80, longitude: -70, zoomLevel: 1, move: 1, nextPoint: 552 });
    mapPoint.push({ latitude: -69, longitude: -102, zoomLevel: 1, move: 0, nextPoint: 553 });
    mapPoint.push({ latitude: -69, longitude: -113.25, zoomLevel: 1, move: 0, nextPoint: 554 });
    mapPoint.push({ latitude: -73.5, longitude: -118, zoomLevel: 1, move: 0, nextPoint: 555 });
    mapPoint.push({ latitude: -73.5, longitude: -105, zoomLevel: 1, move: 0, nextPoint: 556 });
    mapPoint.push({ latitude: -69, longitude: -102.25, zoomLevel: 1, move: 1, nextPoint: 557 });
    mapPoint.push({ latitude: -74, longitude: -93, zoomLevel: 1, move: 0, nextPoint: 558 });
    mapPoint.push({ latitude: -74, longitude: -75.75, zoomLevel: 1, move: 0, nextPoint: 559 });
    mapPoint.push({ latitude: -66.5, longitude: -61, zoomLevel: 1, move: 0, nextPoint: 560 });
    mapPoint.push({ latitude: -62, longitude: -61.25, zoomLevel: 1, move: 0, nextPoint: 561 });
    mapPoint.push({ latitude: -65, longitude: -78, zoomLevel: 1, move: 0, nextPoint: 562 });
    mapPoint.push({ latitude: -68, longitude: -73, zoomLevel: 1, move: 0, nextPoint: 563 });
    mapPoint.push({ latitude: -71, longitude: -78, zoomLevel: 1, move: 0, nextPoint: 564 });
    mapPoint.push({ latitude: -70.75, longitude: -87.75, zoomLevel: 1, move: 0, nextPoint: 565 });
    mapPoint.push({ latitude: -74, longitude: -92.75, zoomLevel: 1, move: 1, nextPoint: 566 });
    mapPoint.push({ latitude: -72, longitude: -94.75, zoomLevel: 1, move: 0, nextPoint: 567 });
    mapPoint.push({ latitude: -67.75, longitude: -98.5, zoomLevel: 1, move: 0, nextPoint: 568 });
    mapPoint.push({ latitude: -67.5, longitude: -114, zoomLevel: 1, move: 0, nextPoint: 569 });
    mapPoint.push({ latitude: -70.75, longitude: -129, zoomLevel: 1, move: 0, nextPoint: 570 });
    mapPoint.push({ latitude: -68.5, longitude: -135.25, zoomLevel: 1, move: 0, nextPoint: 571 });
    mapPoint.push({ latitude: -70.25, longitude: -151.25, zoomLevel: 1, move: 0, nextPoint: 572 });
    mapPoint.push({ latitude: -71.75, longitude: -155.5, zoomLevel: 1, move: 0, nextPoint: 573 });
    mapPoint.push({ latitude: -68.25, longitude: -166, zoomLevel: 1, move: 0, nextPoint: 574 });
    mapPoint.push({ latitude: -66, longitude: -161.5, zoomLevel: 1, move: 0, nextPoint: 575 });
    mapPoint.push({ latitude: -65.25, longitude: -167.75, zoomLevel: 1, move: 0, nextPoint: 576 });
    mapPoint.push({ latitude: -64.25, longitude: -166.5, zoomLevel: 1, move: 0, nextPoint: 577 });
    mapPoint.push({ latitude: -64.25, longitude: -161, zoomLevel: 1, move: 0, nextPoint: 578 });
    mapPoint.push({ latitude: -63.25, longitude: -161, zoomLevel: 1, move: 0, nextPoint: 579 });
    mapPoint.push({ latitude: -61.25, longitude: -165.75, zoomLevel: 1, move: 0, nextPoint: 580 });
    mapPoint.push({ latitude: -58.5, longitude: -157.5, zoomLevel: 1, move: 0, nextPoint: 581 });
    mapPoint.push({ latitude: -57, longitude: -158, zoomLevel: 1, move: 0, nextPoint: 582 });
    mapPoint.push({ latitude: -55, longitude: -164.5, zoomLevel: 1, move: 0, nextPoint: 583 });
    mapPoint.push({ latitude: -54.5, longitude: -164.5, zoomLevel: 1, move: 0, nextPoint: 584 });
    mapPoint.push({ latitude: -55.25, longitude: -159.75, zoomLevel: 1, move: 0, nextPoint: 585 });
    mapPoint.push({ latitude: -59, longitude: -154.25, zoomLevel: 1, move: 0, nextPoint: 586 });
    mapPoint.push({ latitude: -59.75, longitude: -140, zoomLevel: 1, move: 0, nextPoint: 587 });
    mapPoint.push({ latitude: -51.25, longitude: -130, zoomLevel: 1, move: 0, nextPoint: 588 });
    mapPoint.push({ latitude: -48.25, longitude: -125.25, zoomLevel: 1, move: 0, nextPoint: 589 });
    mapPoint.push({ latitude: -45.75, longitude: -124, zoomLevel: 1, move: 0, nextPoint: 590 });
    mapPoint.push({ latitude: -42.75, longitude: -124.75, zoomLevel: 1, move: 0, nextPoint: 591 });
    mapPoint.push({ latitude: -41.25, longitude: -124.25, zoomLevel: 1, move: 0, nextPoint: 592 });
    mapPoint.push({ latitude: -40.5, longitude: -124.5, zoomLevel: 1, move: 0, nextPoint: 593 });
    mapPoint.push({ latitude: -38, longitude: -123, zoomLevel: 1, move: 0, nextPoint: 594 });
    mapPoint.push({ latitude: -37.75, longitude: -122.5, zoomLevel: 1, move: 0, nextPoint: 595 });
    mapPoint.push({ latitude: -37, longitude: -121.5, zoomLevel: 1, move: 0, nextPoint: 596 });
    mapPoint.push({ latitude: -34.75, longitude: -120.5, zoomLevel: 1, move: 0, nextPoint: 597 });
    mapPoint.push({ latitude: -34, longitude: -118.25, zoomLevel: 1, move: 0, nextPoint: 598 });
    mapPoint.push({ latitude: -32.75, longitude: -117.25, zoomLevel: 1, move: 0, nextPoint: 599 });
    mapPoint.push({ latitude: -29.75, longitude: -116, zoomLevel: 1, move: 0, nextPoint: 600 });
    mapPoint.push({ latitude: -28.5, longitude: -114, zoomLevel: 1, move: 0, nextPoint: 601 });
    mapPoint.push({ latitude: -27.75, longitude: -115, zoomLevel: 1, move: 0, nextPoint: 602 });
    mapPoint.push({ latitude: -26, longitude: -112.75, zoomLevel: 1, move: 0, nextPoint: 603 });
    mapPoint.push({ latitude: -24.5, longitude: -112.75, zoomLevel: 1, move: 0, nextPoint: 604 });
    mapPoint.push({ latitude: -22.75, longitude: -110, zoomLevel: 1, move: 0, nextPoint: 605 });
    mapPoint.push({ latitude: -23, longitude: -109.25, zoomLevel: 1, move: 0, nextPoint: 606 });
    mapPoint.push({ latitude: -28.25, longitude: -112.75, zoomLevel: 1, move: 0, nextPoint: 607 });
    mapPoint.push({ latitude: -30, longitude: -114.75, zoomLevel: 1, move: 0, nextPoint: 608 });
    mapPoint.push({ latitude: -32.25, longitude: -114.75, zoomLevel: 1, move: 0, nextPoint: 609 });
    mapPoint.push({ latitude: -32, longitude: -113, zoomLevel: 1, move: 0, nextPoint: 610 });
    mapPoint.push({ latitude: -28, longitude: -111, zoomLevel: 1, move: 0, nextPoint: 611 });
    mapPoint.push({ latitude: -26, longitude: -109.25, zoomLevel: 1, move: 0, nextPoint: 612 });
    mapPoint.push({ latitude: -21.5, longitude: -105.25, zoomLevel: 1, move: 0, nextPoint: 613 });
    mapPoint.push({ latitude: -20.5, longitude: -105.75, zoomLevel: 1, move: 0, nextPoint: 614 });
    mapPoint.push({ latitude: -18.25, longitude: -103, zoomLevel: 1, move: 0, nextPoint: 615 });
    mapPoint.push({ latitude: -15.75, longitude: -96.75, zoomLevel: 1, move: 0, nextPoint: 616 });
    mapPoint.push({ latitude: -16.25, longitude: -94.75, zoomLevel: 1, move: 0, nextPoint: 617 });
    mapPoint.push({ latitude: -13.75, longitude: -91.75, zoomLevel: 1, move: 0, nextPoint: 618 });
    mapPoint.push({ latitude: -13.5, longitude: -87.5, zoomLevel: 1, move: 0, nextPoint: 619 });
    mapPoint.push({ latitude: -11.25, longitude: -85.75, zoomLevel: 1, move: 0, nextPoint: 620 });
    mapPoint.push({ latitude: -10, longitude: -85.25, zoomLevel: 1, move: 0, nextPoint: 621 });
    mapPoint.push({ latitude: -7.25, longitude: -80.75, zoomLevel: 1, move: 0, nextPoint: 622 });
    mapPoint.push({ latitude: -7.25, longitude: -80, zoomLevel: 1, move: 0, nextPoint: 623 });
    mapPoint.push({ latitude: -8, longitude: -80.25, zoomLevel: 1, move: 0, nextPoint: 624 });
    mapPoint.push({ latitude: -8.75, longitude: -79.25, zoomLevel: 1, move: 0, nextPoint: 625 });
    mapPoint.push({ latitude: -7, longitude: -77.5, zoomLevel: 1, move: 0, nextPoint: 626 });
    mapPoint.push({ latitude: -4, longitude: -77, zoomLevel: 1, move: 0, nextPoint: 627 });
    mapPoint.push({ latitude: -1, longitude: -80, zoomLevel: 1, move: 0, nextPoint: 628 });
    mapPoint.push({ latitude: 4.75, longitude: -80.5, zoomLevel: 1, move: 0, nextPoint: 629 });
    mapPoint.push({ latitude: 15.5, longitude: -75, zoomLevel: 1, move: 0, nextPoint: 630 });
    mapPoint.push({ latitude: 18.5, longitude: -70.25, zoomLevel: 1, move: 0, nextPoint: 631 });
    mapPoint.push({ latitude: 31, longitude: -71.5, zoomLevel: 1, move: 0, nextPoint: 632 });
    mapPoint.push({ latitude: 36.75, longitude: -73.25, zoomLevel: 1, move: 0, nextPoint: 633 });
    mapPoint.push({ latitude: 49.5, longitude: -75, zoomLevel: 1, move: 0, nextPoint: 634 });
    mapPoint.push({ latitude: 54, longitude: -73, zoomLevel: 1, move: 0, nextPoint: 635 });
    mapPoint.push({ latitude: 55.5, longitude: -68.25, zoomLevel: 1, move: 0, nextPoint: 636 });
    mapPoint.push({ latitude: 54.75, longitude: -65.25, zoomLevel: 1, move: 0, nextPoint: 637 });
    mapPoint.push({ latitude: 50.5, longitude: -69, zoomLevel: 1, move: 0, nextPoint: 638 });
    mapPoint.push({ latitude: 48.25, longitude: -66, zoomLevel: 1, move: 0, nextPoint: 639 });
    mapPoint.push({ latitude: 47.5, longitude: -66, zoomLevel: 1, move: 0, nextPoint: 640 });
    mapPoint.push({ latitude: 45.75, longitude: -67.75, zoomLevel: 1, move: 0, nextPoint: 641 });
    mapPoint.push({ latitude: 45, longitude: -65.25, zoomLevel: 1, move: 0, nextPoint: 642 });
    mapPoint.push({ latitude: 41, longitude: -65, zoomLevel: 1, move: 0, nextPoint: 643 });
    mapPoint.push({ latitude: 41, longitude: -62.5, zoomLevel: 1, move: 0, nextPoint: 644 });
    mapPoint.push({ latitude: 38.5, longitude: -62.25, zoomLevel: 1, move: 0, nextPoint: 645 });
    mapPoint.push({ latitude: 38, longitude: -57.5, zoomLevel: 1, move: 1, nextPoint: 646 });
    mapPoint.push({ latitude: 36.25, longitude: -56.75, zoomLevel: 1, move: 1, nextPoint: 647 });
    mapPoint.push({ latitude: 37.75, longitude: -57.25, zoomLevel: 1, move: 0, nextPoint: 648 });
    mapPoint.push({ latitude: 36.75, longitude: -56.5, zoomLevel: 1, move: 0, nextPoint: 649 });
    mapPoint.push({ latitude: 34.5, longitude: -58.25, zoomLevel: 1, move: 0, nextPoint: 650 });
    mapPoint.push({ latitude: 35, longitude: -55, zoomLevel: 1, move: 0, nextPoint: 651 });
    mapPoint.push({ latitude: 28.5, longitude: -48.75, zoomLevel: 1, move: 0, nextPoint: 652 });
    mapPoint.push({ latitude: 25.5, longitude: -48.5, zoomLevel: 1, move: 0, nextPoint: 653 });
    mapPoint.push({ latitude: 23, longitude: -43.25, zoomLevel: 1, move: 0, nextPoint: 654 });
    mapPoint.push({ latitude: 22.75, longitude: -42, zoomLevel: 1, move: 0, nextPoint: 655 });
    mapPoint.push({ latitude: 19.5, longitude: -39.5, zoomLevel: 1, move: 0, nextPoint: 656 });
    mapPoint.push({ latitude: 13, longitude: -39, zoomLevel: 1, move: 0, nextPoint: 657 });
    mapPoint.push({ latitude: 13, longitude: -38.5, zoomLevel: 1, move: 0, nextPoint: 658 });
    mapPoint.push({ latitude: 8, longitude: -35, zoomLevel: 1, move: 0, nextPoint: 659 });
    mapPoint.push({ latitude: 5, longitude: -35.75, zoomLevel: 1, move: 0, nextPoint: 660 });
    mapPoint.push({ latitude: 4.5, longitude: -37.25, zoomLevel: 1, move: 0, nextPoint: 661 });
    mapPoint.push({ latitude: 2.75, longitude: -40, zoomLevel: 1, move: 0, nextPoint: 662 });
    mapPoint.push({ latitude: 2.75, longitude: -42, zoomLevel: 1, move: 0, nextPoint: 663 });
    mapPoint.push({ latitude: 0, longitude: -50, zoomLevel: 1, move: 0, nextPoint: 664 });
    mapPoint.push({ latitude: -2, longitude: -50, zoomLevel: 1, move: 0, nextPoint: 665 });
    mapPoint.push({ latitude: -5.75, longitude: -53.25, zoomLevel: 1, move: 0, nextPoint: 666 });
    mapPoint.push({ latitude: -6.25, longitude: -57.5, zoomLevel: 1, move: 0, nextPoint: 667 });
    mapPoint.push({ latitude: -10.75, longitude: -63.25, zoomLevel: 1, move: 0, nextPoint: 668 });
    mapPoint.push({ latitude: -10.5, longitude: -68, zoomLevel: 1, move: 0, nextPoint: 669 });
    mapPoint.push({ latitude: -12.25, longitude: -72, zoomLevel: 1, move: 0, nextPoint: 670 });
    mapPoint.push({ latitude: -10.5, longitude: -75.5, zoomLevel: 1, move: 0, nextPoint: 671 });
    mapPoint.push({ latitude: -8, longitude: -77, zoomLevel: 1, move: 0, nextPoint: 672 });
    mapPoint.push({ latitude: -9.25, longitude: -78.25, zoomLevel: 1, move: 0, nextPoint: 673 });
    mapPoint.push({ latitude: -9.5, longitude: -79.75, zoomLevel: 1, move: 0, nextPoint: 674 });
    mapPoint.push({ latitude: -8.75, longitude: -81.25, zoomLevel: 1, move: 0, nextPoint: 675 });
    mapPoint.push({ latitude: -11.5, longitude: -83.75, zoomLevel: 1, move: 0, nextPoint: 676 });
    mapPoint.push({ latitude: -15, longitude: -83, zoomLevel: 1, move: 0, nextPoint: 677 });
    mapPoint.push({ latitude: -15.75, longitude: -85, zoomLevel: 1, move: 0, nextPoint: 678 });
    mapPoint.push({ latitude: -15.75, longitude: -88.5, zoomLevel: 1, move: 0, nextPoint: 679 });
    mapPoint.push({ latitude: -21.75, longitude: -87, zoomLevel: 1, move: 0, nextPoint: 680 });
    mapPoint.push({ latitude: -21.75, longitude: -90.5, zoomLevel: 1, move: 0, nextPoint: 681 });
    mapPoint.push({ latitude: -19.25, longitude: -90.75, zoomLevel: 1, move: 0, nextPoint: 682 });
    mapPoint.push({ latitude: -18, longitude: -94.5, zoomLevel: 1, move: 0, nextPoint: 683 });
    mapPoint.push({ latitude: -19.25, longitude: -96.25, zoomLevel: 1, move: 0, nextPoint: 684 });
    mapPoint.push({ latitude: -22.25, longitude: -97.75, zoomLevel: 1, move: 0, nextPoint: 685 });
    mapPoint.push({ latitude: -26.25, longitude: -97.25, zoomLevel: 1, move: 0, nextPoint: 686 });
    mapPoint.push({ latitude: -27.75, longitude: -97.5, zoomLevel: 1, move: 0, nextPoint: 687 });
    mapPoint.push({ latitude: -30, longitude: -94, zoomLevel: 1, move: 0, nextPoint: 688 });
    mapPoint.push({ latitude: -29.25, longitude: -90.25, zoomLevel: 1, move: 0, nextPoint: 689 });
    mapPoint.push({ latitude: -30.75, longitude: -88, zoomLevel: 1, move: 0, nextPoint: 690 });
    mapPoint.push({ latitude: -29.75, longitude: -85, zoomLevel: 1, move: 0, nextPoint: 691 });
    mapPoint.push({ latitude: -30.25, longitude: -84, zoomLevel: 1, move: 0, nextPoint: 692 });
    mapPoint.push({ latitude: -29, longitude: -82.5, zoomLevel: 1, move: 0, nextPoint: 693 });
    mapPoint.push({ latitude: -28, longitude: -82.75, zoomLevel: 1, move: 0, nextPoint: 694 });
    mapPoint.push({ latitude: -26.25, longitude: -81.75, zoomLevel: 1, move: 0, nextPoint: 695 });
    mapPoint.push({ latitude: -25.25, longitude: -80.75, zoomLevel: 1, move: 0, nextPoint: 696 });
    mapPoint.push({ latitude: -25.25, longitude: -79.75, zoomLevel: 1, move: 0, nextPoint: 697 });
    mapPoint.push({ latitude: -26.75, longitude: -80, zoomLevel: 1, move: 0, nextPoint: 698 });
    mapPoint.push({ latitude: -30.75, longitude: -81.5, zoomLevel: 1, move: 0, nextPoint: 699 });
    mapPoint.push({ latitude: -32.75, longitude: -78.75, zoomLevel: 1, move: 0, nextPoint: 700 });
    mapPoint.push({ latitude: -33.75, longitude: -77.75, zoomLevel: 1, move: 0, nextPoint: 701 });
    mapPoint.push({ latitude: -34.75, longitude: -76.75, zoomLevel: 1, move: 0, nextPoint: 702 });
    mapPoint.push({ latitude: -35.25, longitude: -75.5, zoomLevel: 1, move: 0, nextPoint: 703 });
    mapPoint.push({ latitude: -37, longitude: -76, zoomLevel: 1, move: 0, nextPoint: 704 });
    mapPoint.push({ latitude: -40.75, longitude: -74, zoomLevel: 1, move: 0, nextPoint: 705 });
    mapPoint.push({ latitude: -41.75, longitude: -70, zoomLevel: 1, move: 0, nextPoint: 706 });
    mapPoint.push({ latitude: -42.25, longitude: -71, zoomLevel: 1, move: 0, nextPoint: 707 });
    mapPoint.push({ latitude: -42.75, longitude: -70.25, zoomLevel: 1, move: 0, nextPoint: 708 });
    mapPoint.push({ latitude: -45.25, longitude: -65.5, zoomLevel: 1, move: 0, nextPoint: 709 });
    mapPoint.push({ latitude: -45.25, longitude: -63.25, zoomLevel: 1, move: 0, nextPoint: 710 });
    mapPoint.push({ latitude: -43.75, longitude: -66, zoomLevel: 1, move: 0, nextPoint: 711 });
    mapPoint.push({ latitude: -43.5, longitude: -65.5, zoomLevel: 1, move: 1, nextPoint: 712 });
    mapPoint.push({ latitude: -44.5, longitude: -63.5, zoomLevel: 1, move: 1, nextPoint: 713 });
    mapPoint.push({ latitude: -43.5, longitude: -65.5, zoomLevel: 1, move: 0, nextPoint: 714 });
    mapPoint.push({ latitude: -44.5, longitude: -63.5, zoomLevel: 1, move: 0, nextPoint: 715 });
    mapPoint.push({ latitude: -45.25, longitude: -61, zoomLevel: 1, move: 0, nextPoint: 716 });
    mapPoint.push({ latitude: -46.25, longitude: -61, zoomLevel: 1, move: 0, nextPoint: 717 });
    mapPoint.push({ latitude: -47, longitude: -60.25, zoomLevel: 1, move: 0, nextPoint: 718 });
    mapPoint.push({ latitude: -45.75, longitude: -62.75, zoomLevel: 1, move: 0, nextPoint: 719 });
    mapPoint.push({ latitude: -46.25, longitude: -64.5, zoomLevel: 1, move: 0, nextPoint: 720 });
    mapPoint.push({ latitude: -49, longitude: -64.5, zoomLevel: 1, move: 0, nextPoint: 721 });
    mapPoint.push({ latitude: -49, longitude: -66.75, zoomLevel: 1, move: 0, nextPoint: 722 });
    mapPoint.push({ latitude: -46.25, longitude: -71.25, zoomLevel: 1, move: 0, nextPoint: 723 });
    mapPoint.push({ latitude: -49.25, longitude: -67.5, zoomLevel: 1, move: 0, nextPoint: 724 });
    mapPoint.push({ latitude: -50.25, longitude: -66.75, zoomLevel: 1, move: 0, nextPoint: 725 });
    mapPoint.push({ latitude: -50.25, longitude: -60, zoomLevel: 1, move: 0, nextPoint: 726 });
    mapPoint.push({ latitude: -52.25, longitude: -55.5, zoomLevel: 1, move: 1, nextPoint: 727 });
    mapPoint.push({ latitude: -51.5, longitude: -55.5, zoomLevel: 1, move: 0, nextPoint: 728 });
    mapPoint.push({ latitude: -51.5, longitude: -56, zoomLevel: 1, move: 0, nextPoint: 729 });
    mapPoint.push({ latitude: -47.5, longitude: -59.25, zoomLevel: 1, move: 0, nextPoint: 730 });
    mapPoint.push({ latitude: -47, longitude: -55.5, zoomLevel: 1, move: 0, nextPoint: 731 });
    mapPoint.push({ latitude: -46.75, longitude: -53, zoomLevel: 1, move: 0, nextPoint: 732 });
    mapPoint.push({ latitude: -47.75, longitude: -52.75, zoomLevel: 1, move: 0, nextPoint: 733 });
    mapPoint.push({ latitude: -49.75, longitude: -54, zoomLevel: 1, move: 0, nextPoint: 734 });
    mapPoint.push({ latitude: -50, longitude: -56.25, zoomLevel: 1, move: 0, nextPoint: 735 });
    mapPoint.push({ latitude: -51.5, longitude: -55.5, zoomLevel: 1, move: 1, nextPoint: 736 });
    mapPoint.push({ latitude: -52.25, longitude: -55.5, zoomLevel: 1, move: 0, nextPoint: 737 });
    mapPoint.push({ latitude: -53.5, longitude: -55.75, zoomLevel: 1, move: 0, nextPoint: 738 });
    mapPoint.push({ latitude: -55.5, longitude: -60.25, zoomLevel: 1, move: 0, nextPoint: 739 });
    mapPoint.push({ latitude: -60.5, longitude: -64.5, zoomLevel: 1, move: 0, nextPoint: 740 });
    mapPoint.push({ latitude: -58.5, longitude: -66.75, zoomLevel: 1, move: 0, nextPoint: 741 });
    mapPoint.push({ latitude: -59.25, longitude: -70, zoomLevel: 1, move: 0, nextPoint: 742 });
    mapPoint.push({ latitude: -61, longitude: -69.75, zoomLevel: 1, move: 0, nextPoint: 743 });
    mapPoint.push({ latitude: -63.25, longitude: -74, zoomLevel: 1, move: 0, nextPoint: 744 });
    mapPoint.push({ latitude: -63.25, longitude: -77.5, zoomLevel: 1, move: 0, nextPoint: 745 });
    mapPoint.push({ latitude: -58.5, longitude: -78, zoomLevel: 1, move: 0, nextPoint: 746 });
    mapPoint.push({ latitude: -57.75, longitude: -76.75, zoomLevel: 1, move: 0, nextPoint: 747 });
    mapPoint.push({ latitude: -56.25, longitude: -76.25, zoomLevel: 1, move: 0, nextPoint: 748 });
    mapPoint.push({ latitude: -54.75, longitude: -79.75, zoomLevel: 1, move: 0, nextPoint: 749 });
    mapPoint.push({ latitude: -52.25, longitude: -78.5, zoomLevel: 1, move: 0, nextPoint: 750 });
    mapPoint.push({ latitude: -51.5, longitude: -79.75, zoomLevel: 1, move: 0, nextPoint: 751 });
    mapPoint.push({ latitude: -53, longitude: -82.5, zoomLevel: 1, move: 0, nextPoint: 752 });
    mapPoint.push({ latitude: -55.25, longitude: -82.25, zoomLevel: 1, move: 0, nextPoint: 753 });
    mapPoint.push({ latitude: -56, longitude: -87.75, zoomLevel: 1, move: 0, nextPoint: 754 });
    mapPoint.push({ latitude: -57, longitude: -92.5, zoomLevel: 1, move: 0, nextPoint: 755 });
    mapPoint.push({ latitude: -58.75, longitude: -93.25, zoomLevel: 1, move: 0, nextPoint: 756 });
    mapPoint.push({ latitude: -58.75, longitude: -94, zoomLevel: 1, move: 0, nextPoint: 757 });
    mapPoint.push({ latitude: -61.25, longitude: -94.25, zoomLevel: 1, move: 0, nextPoint: 758 });
    mapPoint.push({ latitude: -64, longitude: -92, zoomLevel: 1, move: 1, nextPoint: 759 });
    mapPoint.push({ latitude: -64, longitude: -91.5, zoomLevel: 1, move: 0, nextPoint: 760 });
    mapPoint.push({ latitude: -65.25, longitude: -90.25, zoomLevel: 1, move: 0, nextPoint: 761 });
    mapPoint.push({ latitude: -64.25, longitude: -86, zoomLevel: 1, move: 0, nextPoint: 762 });
    mapPoint.push({ latitude: -64, longitude: -91.5, zoomLevel: 1, move: 1, nextPoint: 763 });
    mapPoint.push({ latitude: -64, longitude: -92, zoomLevel: 1, move: 0, nextPoint: 764 });
    mapPoint.push({ latitude: -66.5, longitude: -86.5, zoomLevel: 1, move: 0, nextPoint: 765 });
    mapPoint.push({ latitude: -66.75, longitude: -84, zoomLevel: 1, move: 0, nextPoint: 766 });
    mapPoint.push({ latitude: -68.25, longitude: -82, zoomLevel: 1, move: 0, nextPoint: 767 });
    mapPoint.push({ latitude: -69, longitude: -83.25, zoomLevel: 1, move: 0, nextPoint: 768 });
    mapPoint.push({ latitude: -70, longitude: -83.25, zoomLevel: 1, move: 0, nextPoint: 769 });
    mapPoint.push({ latitude: -70.25, longitude: -87, zoomLevel: 1, move: 0, nextPoint: 770 });
    mapPoint.push({ latitude: -68.75, longitude: -88.5, zoomLevel: 1, move: 0, nextPoint: 771 });
    mapPoint.push({ latitude: -68.25, longitude: -91.25, zoomLevel: 1, move: 0, nextPoint: 772 });
    mapPoint.push({ latitude: -69.75, longitude: -93.75, zoomLevel: 1, move: 0, nextPoint: 773 });
    mapPoint.push({ latitude: -71.75, longitude: -93.25, zoomLevel: 1, move: 0, nextPoint: 774 });
    mapPoint.push({ latitude: -72, longitude: -94.75, zoomLevel: 1, move: 1, nextPoint: 775 });         // End of Canada
    mapPoint.push({ latitude: -50.75, longitude: -2, zoomLevel: 8, move: 0, nextPoint: 776 });          // Back to Britain
    mapPoint.push({ latitude: -50.75, longitude: -1.5, zoomLevel: 8, move: 0, nextPoint: 777 });
    mapPoint.push({ latitude: -50.875, longitude: -1.375, zoomLevel: 8, move: 0, nextPoint: 778 });
    mapPoint.push({ latitude: -50.75, longitude: -1.125, zoomLevel: 8, move: 0, nextPoint: 779 });
    mapPoint.push({ latitude: -50.75, longitude: -0.875, zoomLevel: 8, move: 0, nextPoint: 780 });
    mapPoint.push({ latitude: -50.625, longitude: -0.625, zoomLevel: 8, move: 0, nextPoint: 781 });
    mapPoint.push({ latitude: -50.75, longitude: -0.125, zoomLevel: 8, move: 0, nextPoint: 782 });
    mapPoint.push({ latitude: -50.75, longitude: 0.25, zoomLevel: 8, move: 0, nextPoint: 783 });
    mapPoint.push({ latitude: -51, longitude: 0.75, zoomLevel: 8, move: 0, nextPoint: 784 });
    mapPoint.push({ latitude: -51, longitude: 1, zoomLevel: 8, move: 0, nextPoint: 785 });
    mapPoint.push({ latitude: -51.125, longitude: 1, zoomLevel: 8, move: 0, nextPoint: 786 });
    mapPoint.push({ latitude: -51.125, longitude: 1.375, zoomLevel: 8, move: 0, nextPoint: 787 });
    mapPoint.push({ latitude: -51.375, longitude: 1.375, zoomLevel: 8, move: 0, nextPoint: 788 });
    mapPoint.push({ latitude: -51.375, longitude: 1, zoomLevel: 8, move: 0, nextPoint: 789 });
    mapPoint.push({ latitude: -51.5, longitude: 0.75, zoomLevel: 8, move: 0, nextPoint: 790 });
    mapPoint.push({ latitude: -51.5, longitude: 0.375, zoomLevel: 8, move: 0, nextPoint: 791 });
    mapPoint.push({ latitude: -51.5, longitude: 0.75, zoomLevel: 8, move: 0, nextPoint: 792 });
    mapPoint.push({ latitude: -51.625, longitude: 1, zoomLevel: 8, move: 0, nextPoint: 793 });
    mapPoint.push({ latitude: -51.75, longitude: 1, zoomLevel: 8, move: 0, nextPoint: 794 });
    mapPoint.push({ latitude: -51.75, longitude: 1.125, zoomLevel: 1, move: 0, nextPoint: 795 });
    mapPoint.push({ latitude: -52, longitude: 1.5, zoomLevel: 1, move: 0, nextPoint: 0 });

    return (mapPoint);
}
}