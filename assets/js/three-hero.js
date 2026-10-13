document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('three-hero-container');
    if (!container || typeof THREE === 'undefined') return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Setup Scene
    const scene = new THREE.Scene();
    
    // Setup Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Setup Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Create Abstract Architectural Shape
    // We'll create a group of wireframe boxes to simulate an abstract building structure
    const group = new THREE.Group();
    
    const material = new THREE.LineBasicMaterial({ 
        color: 0xA9812F, // Brass color
        transparent: true,
        opacity: 0.3
    });

    const boxGeo1 = new THREE.EdgesGeometry(new THREE.BoxGeometry(2, 4, 2));
    const box1 = new THREE.LineSegments(boxGeo1, material);
    group.add(box1);

    const boxGeo2 = new THREE.EdgesGeometry(new THREE.BoxGeometry(3, 2, 3));
    const box2 = new THREE.LineSegments(boxGeo2, material);
    box2.position.y = -1;
    group.add(box2);

    const boxGeo3 = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.5, 3, 1.5));
    const box3 = new THREE.LineSegments(boxGeo3, material);
    box3.position.y = 2;
    group.add(box3);

    // Add some random floating particles (dust/light)
    const particleCount = 100;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for(let i=0; i<particleCount * 3; i++) {
        particlePositions[i] = (Math.random() - 0.5) * 10;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xC9A75A, // Light brass
        size: 0.05,
        transparent: true,
        opacity: 0.6
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Position Group
    group.position.x = 2; // Shift right
    scene.add(group);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    if (!prefersReducedMotion) {
        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX - windowHalfX);
            mouseY = (event.clientY - windowHalfY);
        });
    }

    // Animation Loop
    const animate = () => {
        if (!prefersReducedMotion) {
            requestAnimationFrame(animate);

            // Rotate main structure slowly
            group.rotation.y += 0.002;
            group.rotation.x += 0.001;

            // Rotate particles slowly
            particles.rotation.y -= 0.001;

            // Parallax based on mouse movement
            targetX = mouseX * 0.001;
            targetY = mouseY * 0.001;
            
            group.rotation.y += 0.05 * (targetX - group.rotation.y);
            group.rotation.x += 0.05 * (targetY - group.rotation.x);
        } else {
            // Static render if reduced motion
            group.rotation.y = 0.5;
            group.rotation.x = 0.2;
        }

        renderer.render(scene, camera);
    };

    if (!prefersReducedMotion) {
        animate();
    } else {
        renderer.render(scene, camera);
    }

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

});
