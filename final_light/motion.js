class CinematicEngine {
    constructor(canvasId) {
        this.container = document.querySelector('.hero');
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });

        this.scrollPos = 0;
        this.targetScrollPos = 0;
        this.clock = new THREE.Clock();
        this.lerpFactor = 2.5; // Controls the smoothness of the scroll follow

        this.init();
        this.animate();

        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Camera positioning
        this.camera.position.set(0, 3, 12);
        this.camera.lookAt(0, 2, 0);

        // 1. Particle Atmosphere (3 Layers)
        this.createAtmosphere();

        // 2. Reactive Grid Floor
        this.createGrid();

        // 3. Silhouette (The Man)
        this.createSilhouette();

        // Lighting System
        this.ambientLight = new THREE.AmbientLight(0x0a192f, 0.2);
        this.scene.add(this.ambientLight);

        this.spotLight = new THREE.PointLight(0x38bdf8, 0, 50);
        this.spotLight.position.set(0, 5, 2);
        this.scene.add(this.spotLight);

        // Load Sequence
        this.startLoadSequence();
    }

    createAtmosphere() {
        // Layer 1: Far background waves
        const waveGeo = new THREE.PlaneGeometry(100, 100, 32, 32);
        const waveMat = new THREE.MeshBasicMaterial({
            color: 0x0a192f,
            wireframe: true,
            transparent: true,
            opacity: 0.2
        });
        this.waves = new THREE.Mesh(waveGeo, waveMat);
        this.waves.rotation.x = -Math.PI / 2.5;
        this.waves.position.z = -20;
        this.waves.position.y = 5;
        this.scene.add(this.waves);

        // Layer 2: Mid layer network lines
        this.networkGroup = new THREE.Group();
        for (let i = 0; i < 20; i++) {
            const points = [
                new THREE.Vector3(Math.random() * 40 - 20, Math.random() * 20, Math.random() * 40 - 40),
                new THREE.Vector3(Math.random() * 40 - 20, Math.random() * 20, Math.random() * 40 - 40)
            ];
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const lineMat = new THREE.LineBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.3 });
            this.networkGroup.add(new THREE.Line(lineGeo, lineMat));
        }
        this.scene.add(this.networkGroup);

        // Layer 3: Near particles
        const partGeo = new THREE.BufferGeometry();
        const vertices = [];
        for (let i = 0; i < 1000; i++) {
            vertices.push(Math.random() * 60 - 30, Math.random() * 30, Math.random() * 60 - 30);
        }
        partGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const partMat = new THREE.PointsMaterial({ size: 0.05, color: 0x38bdf8, transparent: true, opacity: 0.3 });
        this.nearParticles = new THREE.Points(partGeo, partMat);
        this.scene.add(this.nearParticles);
    }

    startLoadSequence() {
        const duration = 2500;
        const startTime = Date.now();
        const fade = () => {
            const progress = Math.min((Date.now() - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);

            this.ambientLight.intensity = ease * 0.6;
            this.spotLight.intensity = ease * 2.0;
            this.grid.material.opacity = ease * 0.15;

            if (progress < 1) requestAnimationFrame(fade);
        };
        fade();
    }

    createGrid() {
        const size = 100;
        const divisions = 50;
        this.grid = new THREE.GridHelper(size, divisions, 0x38bdf8, 0x1e293b);
        this.grid.material.transparent = true;
        this.grid.material.opacity = 0.2;
        this.scene.add(this.grid);

        const lineGeo = new THREE.PlaneGeometry(size, size, divisions, divisions);
        const lineMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        this.glowGrid = new THREE.Mesh(lineGeo, lineMat);
        this.glowGrid.rotation.x = -Math.PI / 2;
        this.scene.add(this.glowGrid);
    }

    createSilhouette() {
        this.character = new THREE.Group();
        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), material);
        head.position.y = 1.3;

        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.8, 16), material);
        body.position.y = 0.8;

        this.leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.1), material);
        this.rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.1), material);
        this.leftLeg.position.set(-0.1, 0.3, 0);
        this.rightLeg.position.set(0.1, 0.3, 0);

        this.character.add(head, body, this.leftLeg, this.rightLeg);
        this.scene.add(this.character);
    }

    onScroll() {
        const h = document.documentElement, b = document.body;
        this.targetScrollPos = (h.scrollTop || b.scrollTop) / (h.scrollHeight - h.clientHeight);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();

        // Frame-rate independent smooth scroll interpolation
        this.scrollPos += (this.targetScrollPos - this.scrollPos) * (this.lerpFactor * delta);

        // 1. Atmosphere Motion
        if (this.waves) {
            this.waves.position.y = 5 + Math.sin(elapsedTime * 0.4) * 0.3;
            this.waves.rotation.z = elapsedTime * 0.015;
        }
        this.networkGroup.rotation.y = elapsedTime * 0.04;
        this.nearParticles.position.z = this.scrollPos * 40;

        // 2. Character "Walking" Animation
        const velocity = Math.abs(this.targetScrollPos - this.scrollPos);
        if (velocity > 0.0001) {
            const walkSpeed = 12 + velocity * 50;
            this.leftLeg.rotation.x = Math.sin(elapsedTime * walkSpeed) * 0.5;
            this.rightLeg.rotation.x = Math.cos(elapsedTime * walkSpeed) * 0.5;
            this.glowGrid.material.opacity = 0.15 + Math.sin(elapsedTime * 8) * 0.05;
        } else {
            this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, 5 * delta);
            this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, 5 * delta);
            this.glowGrid.material.opacity = THREE.MathUtils.lerp(this.glowGrid.material.opacity, 0.05, 2 * delta);
        }

        // 3. Cinematic Camera Narrative
        this.camera.position.z = 12 - this.scrollPos * 20;
        this.camera.position.x = Math.sin(this.scrollPos * Math.PI) * 1.5;
        this.camera.lookAt(0, 2, -this.scrollPos * 15);

        this.character.position.z = -this.scrollPos * 25;

        this.renderer.render(this.scene, this.camera);
    }
}

// Ensure Three.js is loaded before initializing
window.addEventListener('load', () => {
    if (typeof THREE !== 'undefined') {
        new CinematicEngine('sequence-canvas');
    }
});
