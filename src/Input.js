export class Input {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.isLocked = false;

        // 1. Keyboard Listeners
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // 2. Mouse Movement Listener
        window.addEventListener('mousemove', (e) => {
            if (this.isLocked) {
                // We use movementX/Y because the cursor is hidden
                this.mouse.x = e.movementX;
                this.mouse.y = e.movementY;
            }
        });

        // 3. Pointer Lock (Click to play)
        document.addEventListener('pointerlockchange', () => {
            this.isLocked = document.pointerLockElement !== null;
        });

        window.addEventListener('mousedown', () => {
            if (!this.isLocked) {
                document.body.requestPointerLock();
            }
        });
    }

    // This is called at the end of every frame in main.js
    // to prevent the mouse movement from "sticking"
    clearMouse() {
        this.mouse.x = 0;
        this.mouse.y = 0;
    }
}
