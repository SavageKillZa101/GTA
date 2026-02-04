import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.mesh = null;
        
        // --- Fix 1: Stats & HUD ---
        this.health = 100;
        this.money = 500;
        this.isDead = false;

        // --- Fix 2: Better Scaling & Physics ---
        this.position = new THREE.Vector3(0, 1, 0);
        this.velocity = new THREE.Vector3();
        this.yaw = 0;
        this.speed = 10; // Lowered for better control
        this.onGround = true;

        this.loadModel();
    }

    loadModel() {
        const loader = new GLTFLoader();
        // Vite path (assumes RiggedFigure.glb is in public/)
        loader.load('/RiggedFigure.glb', (gltf) => {
            this.mesh = gltf.scene;
            
            // --- Fix 3: Size adjustment ---
            // If your character was massive, reduce 20.0 to 1.0 or 2.0
            this.mesh.scale.set(1.5, 1.5, 1.5); 
            
            this.scene.add(this.mesh);
        });
    }

    takeDamage(amount) {
        if (this.isDead) return;
        this.health -= amount;
        
        // Update the HUD we made in index.html
        const healthEl = document.getElementById('health');
        if (healthEl) {
            healthEl.textContent = Math.ceil(this.health);
            healthEl.style.color = this.health < 30 ? '#ff0000' : '#2b9e2b';
        }

        if (this.health <= 0) this.die();
    }

    die() {
        this.isDead = true;
        alert("WASTED");
        window.location.reload(); // Quick restart
    }

    update(dt, keys, mouse) {
        if (!this.mesh || this.isDead) return;

        this.handleRotation(mouse);
        this.handleMovement(dt, keys);
        
        // Gravity logic
        this.velocity.y -= 30 * dt; 
        this.position.y += this.velocity.y * dt;

        if (this.position.y <= 0) {
            this.position.y = 0;
            this.velocity.y = 0;
            this.onGround = true;
        }

        this.mesh.position.copy(this.position);
        this.updateCamera(dt);
    }

    handleRotation(mouse) {
        this.yaw -= mouse.x * 0.002;
    }

    handleMovement(dt, keys) {
        let moveDir = new THREE.Vector3();
        if (keys['w']) moveDir.z -= 1;
        if (keys['s']) moveDir.z += 1;
        if (keys['a']) moveDir.x -= 1;
        if (keys['d']) moveDir.x += 1;

        if (moveDir.length() > 0) {
            moveDir.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
            this.position.addScaledVector(moveDir, this.speed * dt);
            
            // Make mesh face the direction of movement
            const angle = Math.atan2(moveDir.x, moveDir.z);
            this.mesh.rotation.y = angle;
        }
    }

    updateCamera(dt) {
        const offset = new THREE.Vector3(0, 3, 6); // Closer camera for smaller character
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        this.camera.position.lerp(this.position.clone().add(offset), 0.1);
        this.camera.lookAt(this.position.x, this.position.y + 1.5, this.position.z);
    }
}
