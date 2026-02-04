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

        // Wanted Level & AI Management
        this.wantedLevel = 0;
        this.enemies = []; // Ensure World.js pushes NPCs here
        
        window.addEventListener('resize', () => this.onWindowResize());
        this.animate();
    }

    updateWantedUI() {
        const stars = document.getElementById('wanted-stars');
        stars.innerHTML = '★'.repeat(this.wantedLevel);
    }

    // Call this if the player attacks an NPC
    commitCrime() {
        if (this.wantedLevel === 0) {
            this.wantedLevel = 1;
            this.updateWantedUI();
        }
    }

    updateMinimap() {
        const canvas = document.getElementById('minimap-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Player (Green)
        ctx.fillStyle = "#00ff00";
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 5, 0, Math.PI * 2);
        ctx.fill();

        // Enemies/Cops (Red) - Only show if wanted
        if (this.wantedLevel > 0) {
            this.enemies.forEach(npc => {
                const relX = (npc.position.x - this.player.position.x) + (canvas.width / 2);
                const relZ = (npc.position.z - this.player.position.z) + (canvas.height / 2);
                ctx.fillStyle = "#ff0000";
                ctx.fillRect(relX, relZ, 4, 4);
            });
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const dt = this.clock.getDelta();

        this.player.update(dt, this.input.keys, this.input.mouse);

        // Wanted Logic: Enemies only chase if wantedLevel > 0
        if (this.wantedLevel > 0 && !this.player.isDead) {
            this.enemies.forEach(npc => {
                const dist = npc.position.distanceTo(this.player.position);
                
                // Chase
                const dir = new THREE.Vector3().subVectors(this.player.position, npc.position).normalize();
                npc.position.addScaledVector(dir, 10 * dt);
                npc.lookAt(this.player.position);

                // Attack Cooldown (Prevents instant death)
                if (dist < 3) {
                    const now = Date.now();
                    if (!npc.lastHit || now - npc.lastHit > 1200) {
                        this.player.takeDamage(15);
                        npc.lastHit = now;
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
