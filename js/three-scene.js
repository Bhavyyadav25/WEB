/**
 * Three.js Background Scene
 * Creates an immersive particle system with interactive effects
 */

class ThreeScene {
    constructor() {
        this.canvas = document.getElementById('bg-canvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });

        this.particles = null;
        this.particleCount = 2000;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        // Renderer setup
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x0a0a0b, 0);

        // Camera position
        this.camera.position.z = 50;

        // Create particles
        this.createParticles();

        // Create geometric shapes
        this.createGeometry();

        // Add floating orbs
        this.createOrbs();

        // Event listeners
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('scroll', () => this.onScroll());

        // Start animation
        this.animate();
    }

    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);
        const sizes = new Float32Array(this.particleCount);

        const color1 = new THREE.Color(0x6366f1); // Primary accent
        const color2 = new THREE.Color(0x8b5cf6); // Secondary accent
        const color3 = new THREE.Color(0x06b6d4); // Cyan accent

        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;

            // Position
            positions[i3] = (Math.random() - 0.5) * 200;
            positions[i3 + 1] = (Math.random() - 0.5) * 200;
            positions[i3 + 2] = (Math.random() - 0.5) * 200;

            // Color - mix between accent colors
            const mixRatio = Math.random();
            const selectedColor = mixRatio < 0.33 ? color1 : mixRatio < 0.66 ? color2 : color3;
            colors[i3] = selectedColor.r;
            colors[i3 + 1] = selectedColor.g;
            colors[i3 + 2] = selectedColor.b;

            // Size
            sizes[i] = Math.random() * 2 + 0.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Shader material for particles
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uMouse: { value: new THREE.Vector2(0, 0) },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float uTime;
                uniform vec2 uMouse;
                uniform float uPixelRatio;

                void main() {
                    vColor = color;

                    vec3 pos = position;

                    // Wave effect
                    pos.y += sin(pos.x * 0.05 + uTime * 0.5) * 2.0;
                    pos.x += cos(pos.y * 0.05 + uTime * 0.3) * 2.0;

                    // Mouse influence
                    float distanceToMouse = length(pos.xy - uMouse * 50.0);
                    float mouseInfluence = 1.0 - smoothstep(0.0, 30.0, distanceToMouse);
                    pos.z += mouseInfluence * 10.0;

                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;

                    // Size attenuation
                    gl_PointSize = size * uPixelRatio * (100.0 / -mvPosition.z);
                }
            `,
            fragmentShader: `
                varying vec3 vColor;

                void main() {
                    // Circular particle
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);

                    if (dist > 0.5) discard;

                    // Soft edges
                    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

                    gl_FragColor = vec4(vColor, alpha * 0.8);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createGeometry() {
        // Wireframe torus
        const torusGeometry = new THREE.TorusGeometry(15, 5, 16, 100);
        const torusMaterial = new THREE.MeshBasicMaterial({
            color: 0x6366f1,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        this.torus = new THREE.Mesh(torusGeometry, torusMaterial);
        this.torus.position.set(40, 20, -30);
        this.scene.add(this.torus);

        // Wireframe icosahedron
        const icoGeometry = new THREE.IcosahedronGeometry(12, 1);
        const icoMaterial = new THREE.MeshBasicMaterial({
            color: 0x8b5cf6,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        this.icosahedron = new THREE.Mesh(icoGeometry, icoMaterial);
        this.icosahedron.position.set(-40, -20, -20);
        this.scene.add(this.icosahedron);

        // Wireframe octahedron
        const octGeometry = new THREE.OctahedronGeometry(10, 0);
        const octMaterial = new THREE.MeshBasicMaterial({
            color: 0x06b6d4,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        this.octahedron = new THREE.Mesh(octGeometry, octMaterial);
        this.octahedron.position.set(30, -30, -40);
        this.scene.add(this.octahedron);
    }

    createOrbs() {
        this.orbs = [];
        const orbCount = 5;

        for (let i = 0; i < orbCount; i++) {
            const geometry = new THREE.SphereGeometry(Math.random() * 2 + 1, 32, 32);
            const material = new THREE.MeshBasicMaterial({
                color: i % 2 === 0 ? 0x6366f1 : 0x8b5cf6,
                transparent: true,
                opacity: 0.3
            });

            const orb = new THREE.Mesh(geometry, material);
            orb.position.set(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 50 - 20
            );

            orb.userData = {
                speed: Math.random() * 0.5 + 0.2,
                amplitude: Math.random() * 20 + 10,
                phase: Math.random() * Math.PI * 2
            };

            this.orbs.push(orb);
            this.scene.add(orb);
        }
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        if (this.particles) {
            this.particles.material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
        }
    }

    onMouseMove(event) {
        this.targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
        this.targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onScroll() {
        const scrollY = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const scrollProgress = scrollY / maxScroll;

        // Rotate camera based on scroll
        this.camera.position.y = -scrollProgress * 30;
        this.camera.rotation.x = scrollProgress * 0.3;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const elapsedTime = this.clock.getElapsedTime();

        // Smooth mouse movement
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        // Update particles
        if (this.particles) {
            this.particles.material.uniforms.uTime.value = elapsedTime;
            this.particles.material.uniforms.uMouse.value.set(this.mouseX, this.mouseY);
            this.particles.rotation.y = elapsedTime * 0.02;
            this.particles.rotation.x = this.mouseY * 0.1;
        }

        // Rotate geometric shapes
        if (this.torus) {
            this.torus.rotation.x = elapsedTime * 0.1;
            this.torus.rotation.y = elapsedTime * 0.15;
        }

        if (this.icosahedron) {
            this.icosahedron.rotation.x = elapsedTime * 0.12;
            this.icosahedron.rotation.y = elapsedTime * 0.08;
        }

        if (this.octahedron) {
            this.octahedron.rotation.x = elapsedTime * 0.15;
            this.octahedron.rotation.z = elapsedTime * 0.1;
        }

        // Animate orbs
        this.orbs.forEach((orb) => {
            const { speed, amplitude, phase } = orb.userData;
            orb.position.y += Math.sin(elapsedTime * speed + phase) * 0.05;
            orb.position.x += Math.cos(elapsedTime * speed * 0.5 + phase) * 0.03;
        });

        // Camera follows mouse slightly
        this.camera.position.x = this.mouseX * 5;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.threeScene = new ThreeScene();
});
