import * as THREE from 'three';
import { World } from './World.js';
import { Player } from './Player.js';
import { Input } from './Input.js';

class Game {
    constructor() {
        // 1. Core Engine Setup
        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        // 2. Initialize Sub-Systems
        this.input = new Input();
        this.world = new World(this.scene);
        this.player = new Player(this.scene, this.camera);

        // 3. Start the Loop
        window.addEventListener('resize', () => this.onWindowResize());
        this.animate();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // delta (dt) is the time passed since the last frame (~0.016s for 60fps)
        const dt = this.clock.getDelta();

        // 4. Update Game Logic
        this.player.update(dt, this.input.keys, this.input.mouse);
        this.world.update(dt, this.player.position);

        // 5. Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the engine
new Game();
