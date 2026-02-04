import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.cityModel = null;
        
        this.initLights();
        this.initEnvironment();
        this.loadCity();
    }

    initLights() {
        // Soft white light everywhere
        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambient);

        // Sunlight that creates shadows
        this.sun = new THREE.DirectionalLight(0xffffff, 1.2);
        this.sun.position.set(100, 200, 100);
        this.sun.castShadow = true;

        // Optimize shadows for a large city
        this.sun.shadow.camera.left = -500;
        this.sun.shadow.camera.right = 500;
        this.sun.shadow.camera.top = 500;
        this.sun.shadow.camera.bottom = -500;
        this.sun.shadow.mapSize.width = 2048; 
        this.sun.shadow.mapSize.height = 2048;

        this.scene.add(this.sun);
    }

    initEnvironment() {
        // Sky color and Fog (Fog hides the edge of the world)
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.002);

        // Simple Ground Plane as a backup/base
        const groundGeo = new THREE.PlaneGeometry(2000, 2000);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    loadCity() {
        const loader = new GLTFLoader();
        
        // Path to your city model in /public/assets/
        loader.load('/assets/Project.glb', (gltf) => {
            this.cityModel = gltf.scene;
            this.cityModel.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            this.scene.add(this.cityModel);
            console.log("City loaded successfully");
        }, 
        (xhr) => {
            // Optional: Loading progress logic here
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
            console.error("Error loading city, creating procedural buildings instead...");
            this.createProceduralCity();
        });
    }

    createProceduralCity() {
        // If the GLB fails, we generate blocks so the player isn't in a void
        for (let i = 0; i < 50; i++) {
            const h = 20 + Math.random() * 50;
            const geo = new THREE.BoxGeometry(15, h, 15);
            const mat = new THREE.MeshStandardMaterial({ color: 0x555555 });
            const b = new THREE.Mesh(geo, mat);
            
            b.position.set(
                (Math.random() - 0.5) * 400,
                h / 2,
                (Math.random() - 0.5) * 400
            );
            b.castShadow = true;
            b.receiveShadow = true;
            this.scene.add(b);
        }
    }

    update(dt, playerPosition) {
        // Here you can handle "City AI" or day/night cycles
        // For example: Move the sun slowly
        // this.sun.position.x = Math.sin(Date.now() * 0.0001) * 200;
    }
}
