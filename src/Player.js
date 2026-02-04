import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.mesh = null;
        
        // Physics State
        this.position = new THREE.Vector3(0, 1, 0);
        this.velocity = new THREE.Vector3();
        this.yaw = 0; // Horizontal rotation
        this.pitch = 0; // Vertical rotation
        
        // Constants
        this.speed = 12;
        this.jumpForce = 15;
        this.gravity = -40;
        this.onGround = false;

        this.loadModel();
    }

    loadModel() {
        const loader = new GLTFLoader();
        // Vite will look in the /public/assets folder
        loader.load('/assets/RiggedFigure.glb', (gltf) => {
            this.mesh = gltf.scene;
            this.mesh.scale.set(20, 20, 20);
            this.scene.add(this.mesh);
        });
    }

    update(dt, keys, mouse) {
        if (!this.mesh) return;

        this.handleRotation(mouse);
        this.handleMovement(dt, keys);
        this.applyPhysics(dt);
        this.updateCamera();
        
        // Sync the 3D model with our physics position
        this.mesh.position.copy(this.position);
    }

    handleRotation(mouse) {
        // mouse.x and mouse.y come from your Input.js listener
        this.yaw -= mouse.x * 0.002;
        this.pitch -= mouse.y * 0.002;
        this.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.pitch));
    }

    handleMovement(dt, keys) {
        const moveDir = new THREE.Vector3();
        
        if (keys['w']) moveDir.z -= 1;
        if (keys['s']) moveDir.z += 1;
        if (keys['a']) moveDir.x -= 1;
        if (keys['d']) moveDir.x += 1;

        if (moveDir.length() > 0) {
            moveDir.normalize();
            // Rotate movement relative to where the camera is facing
            moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
            
            const currentSpeed = keys['shift'] ? this.speed * 2 : this.speed;
            this.position.addScaledVector(moveDir, currentSpeed * dt);

            // Make the character face the direction of movement
            const targetRotation = Math.atan2(moveDir.x, moveDir.z);
            this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, targetRotation, dt * 10);
        }

        if (keys[' '] && this.onGround) {
            this.velocity.y = this.jumpForce;
            this.onGround = false;
        }
    }

    applyPhysics(dt) {
        // Apply gravity
        this.velocity.y += this.gravity * dt;
        this.position.y += this.velocity.y * dt;

        // Simple floor collision (y=0)
        if (this.position.y <= 1) {
            this.position.y = 1;
            this.velocity.y = 0;
            this.onGround = true;
        }
    }

    updateCamera() {
        // Third-person camera offset
        const offset = new THREE.Vector3(0, 5, 12); 
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        
        const targetCameraPos = this.position.clone().add(offset);
        this.camera.position.lerp(targetCameraPos, 0.1); // Smooth follow
        this.camera.lookAt(this.position.clone().add(new THREE.Vector3(0, 2, 0)));
    }
}
