import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { gsap } from "gsap";
import * as TWEEN from '@tweenjs/tween.js';
import { Group as TweenGroup } from '@tweenjs/tween.js';




const logos = [
  ["/logos/dreamcast.png", "/logos/genesis.png" ],
  ["/logos/gameboy.png", "/logos/gba.png"],
  ["/logos/psone.png", "logos/ps2.png"],
  ["/logos/nintendo_nes_original/scene.gltf", "/logos/snes.png"],
  ["/logos/saturn.png", "/logos/atari.png"],
  ["/logos/pc.png", "logos/xbox.png"],
]


const ThreeCanvas = () => {
  const tweenGroup = new TweenGroup();
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const logoGroup = new THREE.Group();
    scene.add(logoGroup);

    const loader = new GLTFLoader();
    const radius = 5;

    const modelPaths = [
      '/logos/nintendo_nes_original/scene.gltf',
      '/logos/sega_saturn/scene.gltf',
      // '/models/console2/scene.gltf',
      // '/models/console3/scene.gltf',
      // etc...
    ];

    const originalPositions = new Map();

    modelPaths.forEach((modelPath, index) => {
      loader.load(modelPath, (gltf) => {
        const model = gltf.scene;

        // Normalize size
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1 / maxDim;
        model.scale.setScalar(scale);

        // Center model
        box.setFromObject(model); // Update after scaling
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center); // move pivot to center

        // Position on circle
        const angle = (index / modelPaths.length) * Math.PI * 2;
        model.position.x = radius * Math.cos(angle);
        model.position.z = radius * Math.sin(angle);

        // Face the center
        model.lookAt(0, 0, 0);
        if (modelPath.includes("sega_saturn")) {
          model.rotation.y += Math.PI; // flip horizontally
          model.rotation.x += Math.PI; // flip vertically
        }

        // Save original pos
        originalPositions.set(model, model.position.clone());

        logoGroup.add(model);
      });
    });

    // Raycaster & Mouse
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isPaused = false;
    let targetRotationY = 0
    let INTERSECTED = null;

    const handleClick = (event) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(logoGroup.children, true);

      if (intersects.length > 0) {
        let clickedMesh = intersects[0].object;
        while (clickedMesh.parent && clickedMesh.parent !== logoGroup) {
          clickedMesh = clickedMesh.parent; // climb up to logoGroup child
        }

        isPaused = true;

        // Get object's position relative to logoGroup center
        const pos = clickedMesh.position; // local position (logoGroup space)
        const angle = Math.atan2(pos.x, pos.z); // angle around Y

        // Compute how much to rotate logoGroup so this angle aligns with front (Z axis)
        targetRotationY = -angle;

        new TWEEN.Tween(logoGroup.rotation, tweenGroup)
          .to({ y: targetRotationY }, 1000)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();
      } else {
        isPaused = false;
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // const onMouseMove = (event) => {
    //   const rect = mount.getBoundingClientRect();
    //   mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
    //   mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;
    // };

    // mount.addEventListener('mousemove', onMouseMove);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      if (!isPaused) {
        logoGroup.rotation.y += 0.005;
      } else {
      // Stay at target rotation to avoid drifting
      logoGroup.rotation.y = targetRotationY;
      }

      tweenGroup.update();

      // 🎈 Floaty + Wobbly Animation
      logoGroup.children.forEach((model, index) => {
        // Gentle float up and down
        const floatHeight = 0.1 * Math.sin(elapsed * 2 + index);
        model.position.y = originalPositions.get(model).y + floatHeight;

        // Optional gentle wobble
        model.rotation.x = 0.05 * Math.sin(elapsed * 1.5 + index);
        model.rotation.z = 0.05 * Math.cos(elapsed * 1.5 + index);
      });

      //renderer.render(scene, camera);
      // Raycasting
      //raycaster.setFromCamera(mouse, camera);
      //const intersects = raycaster.intersectObjects(logoGroup.children, true);

      // if (intersects.length > 0) {
      //   const target = intersects[0].object.parent;

      //   if (INTERSECTED !== target) {
      //     // Reset the previous object
      //     if (INTERSECTED) {
      //       const originalPos = originalPositions.get(INTERSECTED);
      //       if(originalPos){
      //         gsap.to(INTERSECTED.position, { y: originalPos.y, duration: 0.3 });
      //         gsap.to(INTERSECTED.scale, { x: 0.5, y: 0.5, z: 0.5, duration: 0.3 });
      //       }
      //     }

      //     // Animate the new target
      //     INTERSECTED = target;
      //     gsap.to(INTERSECTED.position, { y: INTERSECTED.position.y + 0.2, duration: 0.3 });
      //     gsap.to(INTERSECTED.scale, { x: 0.6, y: 0.6, z: 0.6, duration: 0.3 });
      //   }
      // } else {
      //   if (INTERSECTED) {
      //     const originalPos = originalPositions.get(INTERSECTED);
      //     if(originalPos){
      //       gsap.to(INTERSECTED.position, { y: originalPos.y, duration: 0.3 });
      //       gsap.to(INTERSECTED.scale, { x: 0.5, y: 0.5, z: 0.5, duration: 0.3 });
      //       INTERSECTED = null;
      //     }
      //   }
      // }

      logoGroup.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      //mount.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative w-full h-[60vh]">
      <div ref={mountRef} className="w-full h-[60vh] absolute inset-0" />
    </div>
  )
};

export default ThreeCanvas;
