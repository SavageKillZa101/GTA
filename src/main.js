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
        document.body.appendChild(this.renderer.domElement);

        this.input = new Input();
        this.world = new World(this.scene);
        this.player = new Player(this.scene, this.camera);
        
        this.wantedLevel = 0;
        this.enemies = []; // Cops/Enemies go here

        this.animate();
    }

    // Call this when you want to trigger a chase
    setWantedLevel(level) {
        this.wantedLevel = level;
        document.getElementById('wanted-stars').innerHTML = '★'.repeat(level);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const dt = this.clock.getDelta();

        // 1. Update Player (Fixed Scale happens inside Player.js)
        this.player.update(dt, this.input.keys, this.input.mouse);

        // 2. Chase Logic: Only chase if Wanted
        if (this.wantedLevel > 0 && !this.player.isDead) {
            this.enemies.forEach(npc => {
                const dist = npc.position.distanceTo(this.player.position);
                
                // Move towards player
                const dir = new THREE.Vector3().subVectors(this.player.position, npc.position).normalize();
                npc.position.addScaledVector(dir, 10 * dt);
                npc.lookAt(this.player.position);

                // FIX: Attack Cooldown (Prevents dying in 1 hit)
                if (dist < 3) {
                    const now = Date.now();
                    if (!npc.lastHit || now - npc.lastHit > 1000) {
                        this.player.takeDamage(15);
                        npc.lastHit = now;
                    }
                }
            });
        }

        this.updateMinimap();
        this.renderer.render(this.scene, this.camera);
    }

    updateMinimap() {
        const canvas = document.getElementById('minimap-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Player dot
        ctx.fillStyle = "#00ff00";
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, 5, 0, Math.PI*2);
        ctx.fill();
    }
}

new Game();
