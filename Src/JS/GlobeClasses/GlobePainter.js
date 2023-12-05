import * as THREE from 'three';

export class GlobePainter {
    #renderer = null;
    #scene = null;
    #camera = null;
    #globe = null;

    constructor(canvas, options) {
        console.log("GlobePainter.constructor()");
        this.#renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas});
        this.#scene = new THREE.Scene();

        // Draw globe sphere
        const earthGeometry = new THREE.SphereGeometry(6371, 32, 32);
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
        if (options.pointLight) {
            const pointLightColour = 0xffffdd;
            const pointerLight = new THREE.PointLight(pointLightColour, 0.9);
            pointerLight.position.set(0,5000,15800);
            this.#scene.add(pointerLight);
        }

        // Set the camera
        const aspect = canvas.width / canvas.height;  // the canvas default
        const near = 10;
        const far = 300000;
        this.#camera = new THREE.PerspectiveCamera(46, aspect, near, far);
        this.#camera.position.z = 35000;
        
        this.redrawScene();
    }

    redrawScene() {
         this.#renderer.render( this.#scene, this.#camera );
    }
    rotateGlobe(longitudeRotationAngle) {
        this.#globe.rotation.y += longitudeRotationAngle * Math.PI /180 ;
        this.redrawScene();
    }
}