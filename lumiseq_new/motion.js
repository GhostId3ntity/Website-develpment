class CinematicEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas || typeof THREE === 'undefined') return;

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
        this.lerpFactor = 2.5;

        // Current opacity target
        this.canvasOpacity = 0;
        this.targetOpacity = 0;

        this.init();
        this.animate();
        this.setupSectionObserver();

        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.camera.position.set(0, 3, 12);
        this.camera.lookAt(0, 2, 0);

        this.createAtmosphere();
        this.createGrid();
        this.createSilhouette();

        this.ambientLight = new THREE.AmbientLight(0x0d1b2a, 0.2);
        this.scene.add(this.ambientLight);

        this.spotLight = new THREE.PointLight(0x70e000, 0, 50);
        this.spotLight.position.set(0, 5, 2);
        this.scene.add(this.spotLight);

        this.startLoadSequence();
    }

    createAtmosphere() {
        const waveGeo = new THREE.PlaneGeometry(100, 100, 32, 32);
        const waveMat = new THREE.MeshBasicMaterial({ color: 0x0d1b2a, wireframe: true, transparent: true, opacity: 0.2 });
        this.waves = new THREE.Mesh(waveGeo, waveMat);
        this.waves.rotation.x = -Math.PI / 2.5;
        this.waves.position.z = -20;
        this.waves.position.y = 5;
        this.scene.add(this.waves);

        this.networkGroup = new THREE.Group();
        for (let i = 0; i < 20; i++) {
            const points = [
                new THREE.Vector3(Math.random() * 40 - 20, Math.random() * 20, Math.random() * 40 - 40),
                new THREE.Vector3(Math.random() * 40 - 20, Math.random() * 20, Math.random() * 40 - 40)
            ];
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const lineMat = new THREE.LineBasicMaterial({ color: 0x1a3a1a, transparent: true, opacity: 0.3 });
            this.networkGroup.add(new THREE.Line(lineGeo, lineMat));
        }
        this.scene.add(this.networkGroup);

        const partGeo = new THREE.BufferGeometry();
        const vertices = [];
        for (let i = 0; i < 1000; i++) {
            vertices.push(Math.random() * 60 - 30, Math.random() * 30, Math.random() * 60 - 30);
        }
        partGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const partMat = new THREE.PointsMaterial({ size: 0.05, color: 0x70e000, transparent: true, opacity: 0.25 });
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
        this.grid = new THREE.GridHelper(100, 50, 0x70e000, 0x112211);
        this.grid.material.transparent = true;
        this.grid.material.opacity = 0.2;
        this.scene.add(this.grid);

        const lineGeo = new THREE.PlaneGeometry(100, 100, 50, 50);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0x70e000, wireframe: true, transparent: true, opacity: 0.07 });
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

    // ── Section Tracker: show cinematic on odd sections ──────────────────
    setupSectionObserver() {
        this.sections = Array.from(document.querySelectorAll('main > section'));
        this.sectionStates = new Map();

        const observer = new IntersectionObserver((entries) => {
            // Update our internal map of how much of each section is visible
            entries.forEach(entry => {
                this.sectionStates.set(entry.target, entry.intersectionRatio);
            });

            this.checkActiveSection();
        }, {
            // Check visibility at 5% increments for smooth tracking
            threshold: Array.from({ length: 21 }, (_, i) => i * 0.05)
        });

        this.sections.forEach(s => {
            this.sectionStates.set(s, 0); // Initialize map
            observer.observe(s);
        });
    }

    checkActiveSection() {
        let maxRatio = 0;
        let activeSection = null;

        // Find which section currently has the highest visibility ratio
        for (const [section, ratio] of this.sectionStates.entries()) {
            if (ratio > maxRatio) {
                maxRatio = ratio;
                activeSection = section;
            }
        }

        if (activeSection) {
            const index = this.sections.indexOf(activeSection);
            // Even indexes (0, 2, 4...) are the 1st, 3rd, 5th sections visually
            const isOddSection = index % 2 === 0;
            this.targetOpacity = isOddSection ? 0.55 : 0;
        }
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

        this.scrollPos += (this.targetScrollPos - this.scrollPos) * (this.lerpFactor * delta);

        // Smooth canvas opacity crossfade
        this.canvasOpacity += (this.targetOpacity - this.canvasOpacity) * Math.min(3 * delta, 1);
        this.canvas.style.opacity = this.canvasOpacity;

        if (this.waves) {
            this.waves.position.y = 5 + Math.sin(elapsedTime * 0.4) * 0.3;
            this.waves.rotation.z = elapsedTime * 0.015;
        }
        this.networkGroup.rotation.y = elapsedTime * 0.04;
        this.nearParticles.position.z = this.scrollPos * 40;

        const velocity = Math.abs(this.targetScrollPos - this.scrollPos);
        if (velocity > 0.0001) {
            const walkSpeed = 12 + velocity * 50;
            this.leftLeg.rotation.x = Math.sin(elapsedTime * walkSpeed) * 0.5;
            this.rightLeg.rotation.x = Math.cos(elapsedTime * walkSpeed) * 0.5;
            this.glowGrid.material.opacity = 0.1 + Math.sin(elapsedTime * 8) * 0.04;
        } else {
            this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, 5 * delta);
            this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, 5 * delta);
            this.glowGrid.material.opacity = THREE.MathUtils.lerp(this.glowGrid.material.opacity, 0.04, 2 * delta);
        }

        this.camera.position.z = 12 - this.scrollPos * 20;
        this.camera.position.x = Math.sin(this.scrollPos * Math.PI) * 1.5;
        this.camera.lookAt(0, 2, -this.scrollPos * 15);
        this.character.position.z = -this.scrollPos * 25;

        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('load', () => {
    if (typeof THREE !== 'undefined') {
        new CinematicEngine('sequence-canvas');
    }
});
