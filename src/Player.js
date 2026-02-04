import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.mesh = null;
        this.health = 100;
        this.isDead = false;
        
        // Physics constants
        this.position = new THREE.Vector3(0, 1, 0);
        this.velocity = new THREE.Vector3();
        this.yaw = 0;
        this.speed = 10; 

        this.loadModel();
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load('/RiggedFigure.glb', (gltf) => {
            this.mesh = gltf.scene;
            // FIX: Smaller scale so you aren't a giant
            this.mesh.scale.set(1.5, 1.5, 1.5); 
            this.scene.add(this.mesh);
        });
    }

    takeDamage(amount) {
        if (this.isDead) return;
        this.health -= amount;
        
        // Update HUD
        const healthEl = document.getElementById('health');
        if (healthEl) healthEl.textContent = Math.ceil(this.health);

        if (this.health <= 0) this.die();
    }

    die() {
        this.isDead = true;
        // Show a "Wasted" overlay instead of an alert
        const hud = document.getElementById('hud');
        hud.innerHTML += `<div id="wasted" style="position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); color:red; font-size:100px; font-weight:bold; text-shadow: 5px 5px #000;">WASTED</div>`;
        
        // Respawn after 3 seconds
        setTimeout(() => this.respawn(), 3000);
    }

    respawn() {
        this.health = 100;
        this.isDead = false;
        this.position.set(0, 1, 0); // Back to start
        
        // Clean up UI
        const wastedText = document.getElementById('wasted');
        if (wastedText) wastedText.remove();
        
        const healthEl = document.getElementById('health');
        if (healthEl) healthEl.textContent = "100";
    }

    update(dt, keys, mouse) {
        if (!this.mesh || this.isDead) return;

        // Rotation and Movement
        this.yaw -= mouse.x * 0.002;
        let moveDir = new THREE.Vector3();
        if (keys['w']) moveDir.z -= 1;
        if (keys['s']) moveDir.z += 1;
        if (keys['a']) moveDir.x -= 1;
        if (keys['d']) moveDir.x += 1;

        if (moveDir.length() > 0) {
            moveDir.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
            this.position.addScaledVector(moveDir, this.speed * dt);
            this.mesh.rotation.y = Math.atan2(moveDir.x, moveDir.z);
        }

        // Simple Gravity
        this.velocity.y -= 30 * dt;
        this.position.y += this.velocity.y * dt;
        if (this.position.y < 0) {
            this.position.y = 0;
            this.velocity.y = 0;
        }

        this.mesh.position.copy(this.position);
    }
}
