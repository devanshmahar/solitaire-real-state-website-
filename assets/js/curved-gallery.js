
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("curved-gallery-container");
    if (!container || typeof THREE === "undefined") return;

    const scene = new THREE.Scene();
    // Use dark background matching the user screenshot
    scene.background = new THREE.Color(0x050505);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Position camera inside the cylinder looking at the edge, or slightly outside
    camera.position.z = 0; 
    camera.position.y = 0;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group to hold all curved images
    const group = new THREE.Group();
    scene.add(group);

    // Adding a subtle grid helper on the floor to match the "hacker/3d" aesthetic in their screenshot
    const gridHelper = new THREE.GridHelper(50, 50, 0x333333, 0x222222);
    gridHelper.position.y = -3.5;
    scene.add(gridHelper);

    const textureLoader = new THREE.TextureLoader();
    const images = [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
        "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80",
        "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=800&q=80",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
        "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
        "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80"
    ];

    const numImages = images.length;
    const radius = 8; // Size of the ring
    const height = 5.5; // Height of the images
    
    // Calculate the angle for each segment
    const segmentAngle = (Math.PI * 2) / numImages;
    // Leave a small gap between panels by making thetaLength slightly smaller than segmentAngle
    const gap = 0.05; 
    const thetaLength = segmentAngle - gap;

    images.forEach((url, i) => {
        textureLoader.load(url, (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            
            // Create a curved plane using a slice of a cylinder
            const geometry = new THREE.CylinderGeometry(
                radius, radius, height, 
                32, 1, true, 
                0, thetaLength
            );
            
            // Flip the geometry so it faces inwards if camera is inside, 
            // but we want camera inside looking out, so we keep it as is, 
            // but we map texture correctly.
            geometry.scale(-1, 1, 1); // Flip horizontally so textures arent mirrored from inside

            const material = new THREE.MeshBasicMaterial({ 
                map: texture,
                side: THREE.DoubleSide,
                transparent: true
            });

            const mesh = new THREE.Mesh(geometry, material);
            
            // Rotate each panel to its correct position in the ring
            // We shift it by thetaLength/2 so the center of the panel aligns with the angle
            mesh.rotation.y = (i * segmentAngle) + (thetaLength / 2);
            
            group.add(mesh);
        });
    });

    // Move group so camera is inside the ring
    group.position.z = 0;
    
    // Interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotation = 0;
    let autoRotateSpeed = 0.002;

    container.addEventListener("mousedown", (e) => {
        isDragging = true;
        previousMousePosition = { x: e.offsetX, y: e.offsetY };
        container.style.cursor = "grabbing";
    });
    
    container.addEventListener("mousemove", (e) => {
        if (isDragging) {
            const deltaMove = {
                x: e.offsetX - previousMousePosition.x
            };
            targetRotation += deltaMove.x * 0.005;
            previousMousePosition = { x: e.offsetX, y: e.offsetY };
        }
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
        container.style.cursor = "grab";
    });
    
    // Touch support
    container.addEventListener("touchstart", (e) => {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, {passive: true});
    
    container.addEventListener("touchmove", (e) => {
        if (isDragging) {
            const deltaMove = {
                x: e.touches[0].clientX - previousMousePosition.x
            };
            targetRotation += deltaMove.x * 0.005;
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    }, {passive: true});
    
    window.addEventListener("touchend", () => {
        isDragging = false;
    });

    container.style.cursor = "grab";

    const animate = () => {
        requestAnimationFrame(animate);
        
        if (!isDragging) {
            targetRotation += autoRotateSpeed;
        }
        
        group.rotation.y += (targetRotation - group.rotation.y) * 0.1;
        
        renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        // Move camera back on mobile to see the whole ring
        if (window.innerWidth < 768) {
            camera.position.z = 15;
        } else {
            camera.position.z = 0;
        }
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    // Call once to set initial state
    handleResize();
    window.addEventListener("resize", handleResize);
});

