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

        // Page Detection
        const title = document.title.toLowerCase();
        this.theme = 'sentry'; // default
        if (title.includes('about')) this.theme = 'architecture';
        else if (title.includes('insights')) this.theme = 'matrix';
        else if (title.includes('contact')) this.theme = 'pulse';
        else if (title.includes('services')) this.theme = 'shields';

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
        this.createHero();

        this.ambientLight = new THREE.AmbientLight(0x0d1b2a, 0.4);
        this.scene.add(this.ambientLight);

        this.spotLight = new THREE.PointLight(0x70e000, 0, 50);
        this.spotLight.position.set(0, 5, 2);
        this.scene.add(this.spotLight);

        this.startLoadSequence();
    }

    createAtmosphere() {
        const waveGeo = new THREE.PlaneGeometry(400, 400, 32, 32);
        const waveMat = new THREE.MeshBasicMaterial({ color: 0x0d1b2a, wireframe: true, transparent: true, opacity: 0.15 });
        this.waves = new THREE.Mesh(waveGeo, waveMat);
        this.waves.rotation.x = -Math.PI / 2.5;
        this.waves.position.z = -20;
        this.waves.position.y = 5;
        this.scene.add(this.waves);

        // Network Group
        this.networkGroup = new THREE.Group();
        for (let i = 0; i < 20; i++) {
            const points = [
                new THREE.Vector3(Math.random() * 80 - 40, Math.random() * 40, Math.random() * 80 - 80),
                new THREE.Vector3(Math.random() * 80 - 40, Math.random() * 40, Math.random() * 80 - 80)
            ];
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const lineMat = new THREE.LineBasicMaterial({ color: 0x1a3a1a, transparent: true, opacity: 0.25 });
            this.networkGroup.add(new THREE.Line(lineGeo, lineMat));
        }
        this.scene.add(this.networkGroup);

        // CINEMATIC DUST PARTICLES
        const partGeo = new THREE.BufferGeometry();
        const vertices = [];
        for (let i = 0; i < 3000; i++) {
            vertices.push(
                Math.random() * 150 - 75,
                Math.random() * 80 - 10,
                Math.random() * 150 - 100
            );
        }
        partGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const partMat = new THREE.PointsMaterial({
            size: 0.1,
            color: 0x70e000,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending
        });
        this.nearParticles = new THREE.Points(partGeo, partMat);
        this.scene.add(this.nearParticles);
    }

    createGrid() {
        this.grid = new THREE.GridHelper(500, 50, 0x70e000, 0x112211);
        this.grid.material.transparent = true;
        this.grid.material.opacity = 0.35;
        this.scene.add(this.grid);

        const lineGeo = new THREE.PlaneGeometry(500, 500, 50, 50);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0x70e000, wireframe: true, transparent: true, opacity: 0.12 });
        this.glowGrid = new THREE.Mesh(lineGeo, lineMat);
        this.glowGrid.rotation.x = -Math.PI / 2;
        this.scene.add(this.glowGrid);
    }

    createHero() {
        this.heroContainer = new THREE.Group();

        // Custom Fresnel/Rim Shader for Silhouette
        const silhouetteMat = new THREE.ShaderMaterial({
            uniforms: {
                rimColor: { value: new THREE.Color(0x70e000) },
                rimPower: { value: 3.5 }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    vViewPosition = -mvPosition.xyz;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 rimColor;
                uniform float rimPower;
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                void main() {
                    vec3 normal = normalize(vNormal);
                    vec3 viewDir = normalize(vViewPosition);
                    float rim = 1.0 - max(dot(viewDir, normal), 0.0);
                    rim = pow(rim, rimPower);
                    gl_FragColor = vec4(mix(vec3(0.0), rimColor, rim), 1.0);
                }
            `
        });

        const accentMat = new THREE.MeshBasicMaterial({ color: 0x70e000, wireframe: true, transparent: true, opacity: 0.6 });

        if (this.theme === 'sentry') {
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), silhouetteMat);
            head.position.y = 1.6;
            const shoulders = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.1, 16), silhouetteMat);
            shoulders.position.y = 1.4;
            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.22, 1.0, 16), silhouetteMat);
            body.position.y = 0.95;
            this.leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.9, 0.14), silhouetteMat);
            this.rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.9, 0.14), silhouetteMat);
            this.leftArm.geometry.translate(0, -0.4, 0);
            this.rightArm.geometry.translate(0, -0.4, 0);
            this.leftArm.position.set(-0.45, 1.35, 0);
            this.rightArm.position.set(0.45, 1.35, 0);
            this.leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.0, 0.16), silhouetteMat);
            this.rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.0, 0.16), silhouetteMat);
            this.leftLeg.position.set(-0.2, 0.5, 0);
            this.rightLeg.position.set(0.2, 0.5, 0);
            this.heroContainer.add(head, shoulders, body, this.leftArm, this.rightArm, this.leftLeg, this.rightLeg);

            // CYBER-SCANNER PULSE RINGS (Replaced Torch)
            this.scannerGroup = new THREE.Group();
            this.scannerRings = [];
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0x70e000,
                transparent: true,
                opacity: 0.4,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });

            for (let i = 0; i < 3; i++) {
                const ringGeo = new THREE.RingGeometry(0.1, 0.18, 64);
                const ring = new THREE.Mesh(ringGeo, ringMat.clone());
                ring.rotation.x = -Math.PI / 2;
                ring.position.y = 0.05;
                this.scannerGroup.add(ring);
                this.scannerRings.push(ring);
            }
            this.heroContainer.add(this.scannerGroup);
        } else if (this.theme === 'architecture') {
            const core = new THREE.Mesh(new THREE.IcosahedronGeometry(7, 1), accentMat);
            const frame = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), accentMat);
            this.heroContainer.add(core, frame);
            this.heroContainer.position.y = 5.0;
        } else if (this.theme === 'matrix') {
            const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(8.5, 0), accentMat);
            const rings = new THREE.Group();
            for (let i = 0; i < 5; i++) {
                const r = new THREE.Mesh(new THREE.TorusGeometry(12, 0.1, 16, 64), accentMat);
                r.rotation.x = Math.random() * Math.PI;
                r.rotation.y = Math.random() * Math.PI;
                rings.add(r);
            }
            this.heroContainer.add(crystal, rings);
            this.heroContainer.position.y = 5.0;
        } else if (this.theme === 'pulse') {
            const hub = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 16), accentMat);
            const satellites = new THREE.Group();
            for (let i = 0; i < 15; i++) {
                const s = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.0), accentMat);
                s.position.set(Math.cos(i) * 12, Math.sin(i) * 12, (Math.random() - 0.5) * 15);
                satellites.add(s);
            }
            this.heroContainer.add(hub, satellites);
            this.heroObjectGroup = satellites;
            this.heroContainer.position.y = 5.0;
        } else if (this.theme === 'shields') {
            const shield = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 7.5, 1.5, 6), accentMat);
            shield.rotation.x = Math.PI / 2;
            const orbit = new THREE.Mesh(new THREE.TorusGeometry(14, 0.4, 16, 100), accentMat);
            this.heroContainer.add(shield, orbit);
            this.heroContainer.position.y = 6.0;
        }

        this.scene.add(this.heroContainer);
    }

    startLoadSequence() {
        const duration = 2500;
        const startTime = Date.now();
        const fade = () => {
            const progress = Math.min((Date.now() - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            this.ambientLight.intensity = ease * 0.8;
            this.spotLight.intensity = ease * 2.0;
            this.grid.material.opacity = ease * 0.35;
            if (progress < 1) requestAnimationFrame(fade);
        };
        fade();
    }

    setupSectionObserver() {
        this.sections = Array.from(document.querySelectorAll('main > section, main .service-pillar, main .insight-grid-wrap, main .about-hero'));
        if (this.sections.length === 0) this.sections = Array.from(document.querySelectorAll('main > div'));

        const observer = new IntersectionObserver((entries) => {
            let maxRatio = 0;
            let activeSection = null;
            entries.forEach(entry => {
                if (entry.intersectionRatio > maxRatio) {
                    maxRatio = entry.intersectionRatio;
                    activeSection = entry.target;
                }
            });
            if (activeSection) {
                const index = this.sections.indexOf(activeSection);
                this.targetOpacity = (index % 2 === 0) ? 0.65 : 0;
            }
        }, { threshold: [0.1, 0.5, 0.9] });

        this.sections.forEach(s => observer.observe(s));
    }

    onScroll() {
        const h = document.documentElement;
        this.targetScrollPos = h.scrollTop / (h.scrollHeight - h.clientHeight);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const delta = this.clock.getDelta();
        this.scrollPos += (this.targetScrollPos - this.scrollPos) * (this.lerpFactor * delta);
        this.canvasOpacity += (this.targetOpacity - this.canvasOpacity) * Math.min(3 * delta, 1);
        this.canvas.style.opacity = this.canvasOpacity;

        const scrollFactor = this.scrollPos * Math.PI * 2;

        if (this.waves) {
            this.waves.position.y = 5 + Math.sin(scrollFactor * 2) * 0.3;
            this.waves.rotation.z = scrollFactor * 0.1;
        }
        this.networkGroup.rotation.y = scrollFactor * 0.2;
        this.nearParticles.position.z = this.scrollPos * 60; // Dynamic drift

        const walkPhase = Math.sin(this.scrollPos * 60);
        this.heroContainer.position.z = -this.scrollPos * 40;
        this.heroContainer.position.y = (this.theme === 'sentry' ? 0 : 2.5) + Math.sin(scrollFactor) * 0.15;

        // CYBER-SCANNER LOGIC
        if (this.theme === 'sentry') {
            const velocity = Math.abs(this.targetScrollPos - this.scrollPos);
            if (velocity > 0.0001) {
                this.leftLeg.rotation.x = walkPhase * 0.5;
                this.rightLeg.rotation.x = -walkPhase * 0.5;
                this.leftArm.rotation.x = -walkPhase * 0.4;
                this.rightArm.rotation.x = walkPhase * 0.4;
            }

            if (this.scannerRings) {
                const scannerPulse = (this.scrollPos * 250);
                this.scannerRings.forEach((ring, i) => {
                    const phase = (scannerPulse + i * 15) % 60;
                    const scale = phase * 0.5;
                    ring.scale.set(scale, scale, 1);
                    ring.material.opacity = Math.max(0, 0.4 * (1 - phase / 60));
                });

                // Particle Detection Glow
                if (this.nearParticles) {
                    this.nearParticles.material.opacity = 0.25 + Math.abs(Math.sin(scannerPulse * 0.1)) * 0.4;
                }
            }
        } else {
            this.heroContainer.rotation.y = scrollFactor * 0.5;
            if (this.heroObjectGroup) this.heroObjectGroup.rotation.y = scrollFactor * 0.7;
        }

        this.camera.position.z = 15 - this.scrollPos * 30;
        this.camera.position.x = Math.sin(this.scrollPos * Math.PI) * 2.5;
        this.camera.lookAt(0, 3, -this.scrollPos * 25);
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('load', () => {
    if (typeof THREE !== 'undefined') new CinematicEngine('sequence-canvas');
});
