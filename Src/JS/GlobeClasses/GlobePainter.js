import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {SolarSystemConstants} from './SolarSystemConstants.js'

export class GlobePainter {
    #renderer = null;
    #scene = null;
    #camera = null;
    #globe = null;
    #controls = null;
    #earthView = null;

    // initial camera values


    constructor(canvas, options, view) {
        console.log("GlobePainter.constructor()");
        this.#earthView = view;

        this.#renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas});
        document.body.appendChild( this.#renderer.domElement );

        this.#scene = new THREE.Scene();

        // Draw globe sphere
        const earthGeometry = new THREE.SphereGeometry(SolarSystemConstants.earthRadius, 32, 32);
        const earthMaterial = new THREE.MeshPhongMaterial({
            //wireframe: true
        });
        if (options.drawEarthTexture) {
            const textureLoader = new THREE.TextureLoader();
            const earthTexture = textureLoader.load(options.imageMap);
            const earthBumps = textureLoader.load(options.bumpMap);
            earthMaterial.setValues({
                map: earthTexture,
                bumpMap: earthBumps,
                bumpScale: 200.0
            });
        }
        this.#globe = new THREE.Mesh(earthGeometry, earthMaterial);
        this.#scene.add(this.#globe);

        // Shine a light on it   
        if (options.ambientLight) {
             const ambientlight = new THREE.AmbientLight(0xddddff, 0.08);
            this.#scene.add(ambientlight);
        }
        if (options.sunLight) {
            const pointLightColour = 0xffffdd;
            const pointerLight = new THREE.PointLight(pointLightColour, 0.9);
            pointerLight.position.set(0,5000,18800);
            this.#scene.add(pointerLight);
        }

        // Set the camera
        const aspect = canvas.width / canvas.height;  // the canvas default
        const near = 10;
        const far = 300000;
        this.#camera = new THREE.PerspectiveCamera(view.fieldOfView, aspect, near, far);
        this.#camera.position.z = view.distance;

        // Set up controls for orbits and flybys
        this.#controls = new OrbitControls( this.#camera, this.#renderer.domElement );
        this.#controls.autoRotate = false;
        this.#controls.update();
        console.log("End of GlobePainter constructor");
    }

    AnimateScene() {
        this.redrawScene();
        this.#controls.update();
        this.#earthView.updatePosition(this.#camera.position);
        requestAnimationFrame( this.AnimateScene.bind(this));
      };

    redrawScene() {
         this.#renderer.render( this.#scene, this.#camera );
    }
    rotateGlobe(longitudeRotationAngle, latitudeRotationAngle) {
        this.#globe.rotation.y += longitudeRotationAngle * Math.PI /180 ;

        // Rotate camera around the x axis
        this.redrawScene();
    }
}