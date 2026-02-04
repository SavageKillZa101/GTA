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

        this.wantedLevel = 0;
        this.enemies = []; // Cops go here
        this.lastDamageTime = 0; // Fixes instant death

        this.animate();
    }

    // Call this when the player steals a car or hits a pedestrian
    addWantedStar() {
        if(this.wantedLevel < 5) {
            this.wantedLevel++;
            document.getElementById('wanted-stars').innerHTML = '★'.repeat(this.wantedLevel);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const dt = this.clock.getDelta();

        this.player.update(dt, this.input.keys, this.input.mouse);

        // --- POLICE CHASE LOGIC ---
        if (this.wantedLevel > 0 && !this.player.isDead) {
            this.enemies.forEach(cop => {
                const dist = cop.position.distanceTo(this.player.position);
                
                // Cops only chase if player is within range or wanted
                const moveDir = new THREE.Vector3().subVectors(this.player.position, cop.position).normalize();
                cop.position.addScaledVector(moveDir, 9 * dt);
                cop.lookAt(this.player.position);

                // DAMAGE COOLDOWN: Can only be hit once every 1 second
                if (dist < 3 && Date.now() - this.lastDamageTime > 1000) {
                    this.player.takeDamage(20);
                    this.lastDamageTime = Date.now();
                }
            });
        }

        this.updateMinimap();
        this.input.clearMouse();
        this.renderer.render(this.scene, this.camera);
    }

    updateMinimap() {
        const canvas = document.getElementById('minimap-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw Player (Green Dot)
        ctx.fillStyle = "#00ff00";
        ctx.beginPath(); ctx.arc(canvas.width/2, canvas.height/2, 5, 0, Math.PI*2); ctx.fill();

        // Draw Cops (Red Dots)
        if(this.wantedLevel > 0) {
            ctx.fillStyle = "#ff0000";
            this.enemies.forEach(e => {
                const x = (e.position.x - this.player.position.x) + 100;
                const z = (e.position.z - this.player.position.z) + 75;
                ctx.fillRect(x, z, 4, 4);
            });
        }
    }
}

new Game();
