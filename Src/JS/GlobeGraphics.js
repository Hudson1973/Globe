//import {loadMap} from './GlobeLoadMap.js';
//import {rotatePointAroundGlobe, gcsToCartesian, globeRadius} from './GlobeRotate.js';
import * as THREE from 'three';
import { PhysicalConstaints} from './PhysicalConstaints.js';  

export class GlobeGraphics {
    #physics = null;
    #controller = null;
    #renderer = null;
    #scene = null;
    #material = null;
    #camera = null;
    #light = null;
    #fov = 46;
    #distance = 35000;
    objects = [];

    mapImageFile = 'Images/2_no_clouds_4k.jpg';

    constructor(canvas) {
        console.log("GlobeGraphics.constructor()");

        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer({canvas: canvas});
        renderer.setSize(window.innerWidth, window.innerHeight);
    
        // Earth geometry
        const earthGeometry = new THREE.SphereGeometry(6371, 32, 32);
        const earthMaterial = new THREE.MeshPhongMaterial({
            //wireframe: true
        });
        const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earthMesh);
    
        // Let there be light
        const ambientlight = new THREE.AmbientLight(0xffffdd, 0.2);
        scene.add(ambientlight);
    
        // Add camera
        const aspect = window.innerWidth / window.innerHeight;  // the canvas default
        const near = 10;
        const far = 300000;
        const camera = new THREE.PerspectiveCamera(46, aspect, 
            near, far);
        camera.position.z = 35000;

        renderer.render( scene, camera );
    
          /*console.log(canvas);
        this.#physics = new PhysicalConstaints();
        this.#renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas});
        console.log("this.#renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas})");

        const aspect = window.innerWidth / window.innerHeight;  // the canvas default
        const near = 10;
        const far = 300000;
        this.#camera = new THREE.PerspectiveCamera(this.#fov, aspect, near, far);
        console.log("this.#camera = new THREE.PerspectiveCamera(this.#fov, aspect, near, far);");
        this.#camera.position.set(0,0, this.#distance);                     
        this.#camera.lookAt( 0, 0, 0 );
        this.#scene = new THREE.Scene();

        this.#material = new THREE.MeshPhongMaterial(); 
        const textureLoader = new THREE.TextureLoader();
        const earthTexture = textureLoader.load(this.mapImageFile);
        this.#material.setValues({map: earthTexture});

        const geometry = new THREE.SphereGeometry( this.radius, 32, 16 ); 
        const sphere = new THREE.Mesh(geometry, this.#material ); 
        this.#scene.add(sphere);
        this.objects.push(sphere);

        // plot points on the three.gs globe
        let lastPointMove = 0;
        let arrIndex = 0;
        let points = [];

        /*let cartesianCoods = {
            xPoint : 0,
            yPoint : 0,
            zPoint : 0 
        }*/

        /*this.mapData.forEach((mapPoint) => {
            // cartesianCoods are around a 0,0,0 origin, so some of them will be -ve
            cartesianCoods = gcsToCartesian(this.mapData[arrIndex].latitude, this.mapData[arrIndex].longitude, this.radius);
            lastPointMove = this.mapData[arrIndex].move;
            points.push( new THREE.Vector3(cartesianCoods.xPoint, cartesianCoods.yPoint, cartesianCoods.zPoint));
            arrIndex++;
        });
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial( { color: 0xffff50, 
                                                            linewidth: 1 } );
        const line = new THREE.Line( lineGeometry, lineMaterial );

        this.#scene.add( line );
        this.objects.push(line);

        const color = 0xFFFFDD;
        const intensity = 0.8;
        const ambientLight = true;
        
        if (ambientLight) {
            console.log("this.#light = new THREE.DirectionalLight(color, intensity)");
            this.#light = new THREE.DirectionalLight(color, intensity);
            this.#light.position.set(0, 10, 100);
        } else {
            console.log("this.#light = new THREE.PointLight ( color, intensity, 50000)");
            this.#light = new THREE.PointLight ( color, intensity, 50000);
            this.#light.position.set(this.#physics.sunPosition.x, this.#physics.sunPosition.y, this.#physics.sunPosition.z);
        }
        
        this.#scene.add(this.#light);

        // Rotete globe to noon GMt (GMT longitude is x = 0 through globe)
        //line.rotation.y = Math.PI /2;
        sphere.rotation.y = Math.PI + (this.mapImageLongRotation * Math.PI /180 );*/

        //this.animate();
        this.redrawScene(); 
    }

    redrawScene() {
        console.log("GlobeGraphics.redrawScene()");
        this.redrawGlobe();

    }

    redrawGlobe() {
        console.log("GlobeGraphics.redrawGlobe()");
        this.#renderer.render( this.#scene, this.#camera );
    }
}                                                                                                                                                                                           