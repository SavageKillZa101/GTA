import * as THREE from 'three';
import { World } from './World.js';
import { Player } from './Player.js';
import { Input } from './Input.js';

class Game {
    constructor() {
        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        this.input = new Input();
        this.world = new World(this.scene);
        this.player = new Player(this.scene, this.camera);

        // Wanted Level System
        this.wantedLevel = 0;
        this.enemies = []; // This should be populated by your World.js
        
        window.addEventListener('resize', () => this.onWindowResize());
        this.animate();
    }

    updateWantedUI() {
        const stars = document.getElementById('wanted-stars');
        stars.innerHTML = '★'.repeat(this.wantedLevel);
    }

    // Call this function if player hits an NPC or steals a car
    triggerCrime() {
        if (this.wantedLevel === 0) {
            this.wantedLevel = 1;
            this.updateWantedUI();
            console.log("Wanted! Police are responding.");
        }
    }

    updateMinimap() {
        const canvas = document.getElementById('minimap');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Player dot (Green)
        ctx.fillStyle = "#00ff00";
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw Cops (Red dots) if wanted
        if (this.wantedLevel > 0) {
            this.enemies.forEach(cop => {
                const relX = (cop.position.x - this.player.position.x) + (canvas.width / 2);
                const relZ = (cop.position.z - this.player.position.z) + (canvas.height / 2);
                ctx.fillStyle = "#ff0000";
                ctx.fillRect(relX, relZ, 4, 4);
            });
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const dt = this.clock.getDelta();

        // 1. Update Player
        this.player.update(dt, this.input.keys, this.input.mouse);

        // 2. Enemy/Cop Logic
        if (this.wantedLevel > 0) {
            this.enemies.forEach(cop => {
                const dist = cop.position.distanceTo(this.player.position);
                
                // Only chase if player is alive
                if (!this.player.isDead) {
                    const dir = new THREE.Vector3().subVectors(this.player.position, cop.position).normalize();
                    cop.position.addScaledVector(dir, 8 * dt); // Cop speed
                    cop.lookAt(this.player.position);

                    // Damage with cooldown (prevents instant death)
                    if (dist < 2.5) {
                        const now = Date.now();
                        if (!cop.lastHit || now - cop.lastHit > 1000) {
                            this.player.takeDamage(15);
                            cop.lastHit = now;
                        }
                    }
                }
            });
        }

        this.updateMinimap();
        this.input.clearMouse();
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

new Game();
