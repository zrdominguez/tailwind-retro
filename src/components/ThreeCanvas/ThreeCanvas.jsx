import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { gsap } from "gsap";
import * as TWEEN from '@tweenjs/tween.js';
import { Group as TweenGroup } from '@tweenjs/tween.js';
import { useNavigate } from "react-router-dom";
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';





const logos = [
  ["/logos/dreamcast.png", "/logos/genesis.png" ],
  ["/logos/gameboy.png", "/logos/gba.png"],
  ["/logos/psone.png", "logos/ps2.png"],
  ["/logos/nintendo_nes_original/scene.gltf", "/logos/snes.png"],
  ["/logos/saturn.png", "/logos/atari.png"],
  ["/logos/pc.png", "logos/xbox.png"],
]


const ThreeCanvas = () => {
  const navigate = useNavigate();
  const tweenGroup = new TweenGroup();
  const mountRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

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
      {consoleName: "nes" ,path: 'https://zechariahdbucket.s3.us-east-2.amazonaws.com/3dConsoleModels/nintendo_nes_original/scene.gltf', id: 49},
      {consoleName: "sega-saturn", path:'/', id: 107},
      // '/models/console2/scene.gltf',
      // '/models/console3/scene.gltf',
      // etc...
    ];

    function computeCirclePosition(index, total, radius) {
      const angle = (index / total) * Math.PI * 2;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      const y = 0;
      return new THREE.Vector3(x, y, z);
    }

    const originalPositions = new Map();
    //Keep track of how many models were loaded
    const totalModels = modelPaths.length;
    let modelsLoaded = 0;

    modelPaths.forEach(({consoleName, path, id}, index) => {
      loader.load(path, (gltf) => {
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
        //const offset = model.position.clone();

        // Position on circle
        //const angle = (index / modelPaths.length) * Math.PI * 2;
        const pos = computeCirclePosition(index, modelPaths.length, radius);
        model.position.copy(pos);
        //originalPositions.set(fallback, pos.clone());



        // Face the center
        model.lookAt(0, 0, 0);
        if (path.includes("sega_saturn")) {
          model.rotation.y += Math.PI; // flip horizontally
          model.rotation.x += Math.PI; // flip vertically
        }

        model.userData.consoleName = consoleName;
        model.userData.id = id;

        // Save original pos
        originalPositions.set(model, model.position.clone());
        logoGroup.add(model);
        modelsLoaded++;

        if (modelsLoaded === totalModels) setIsReady(true);

      }, undefined, (error) => {
        console.error(`Error loading model at ${path}:`, error);
        const fallback = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshStandardMaterial({ color: 0xff69b4 })
        );

        // Optional: Add some fallback text or icon
        // Position, scale, rotate if needed
        const pos = computeCirclePosition(index, modelPaths.length, radius);
        fallback.position.copy(pos);
        originalPositions.set(fallback, pos.clone());

        // Add to the same group
        logoGroup.add(fallback);

        // Add 3D Text for console name
        const loaderFont = new FontLoader();
        loaderFont.load('/fonts/helvetiker_regular.typeface.json', (font) => {
          const textGeo = new TextGeometry(consoleName,  {
            font: font,
            size: 0.4,          // Reasonable text size
            height: 0.01,       // Very shallow extrusion to avoid stretching
            curveSegments: 12,  // Smooth curves
          });

          textGeo.computeBoundingBox();
          const centerOffsetX = -0.1*(textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
          const textMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0x444444,     // Optional glow
            metalness: 0.3,         // Metallic finish
            roughness: 0.6,
          });

          const textMesh = new THREE.Mesh(textGeo, textMat);

          textMesh.scale.set(1, 1, 0);             // Neutral scale
          textMesh.rotation.set(0, -Math.PI/2, 0); // Rotate flat on XZ-plane if fallback is on floor

          // Position text nicely above fallback object
          textMesh.position.set(centerOffsetX, 0.5, 0);   // Adjust height (Y) as needed
          textMesh.translateX(-1.4);

          fallback.add(textMesh); // Add text as child of fallback
        });




        modelsLoaded++;
        if (modelsLoaded === totalModels) setIsReady(true);
      });
    })

    // Raycaster & Mouse
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isPaused = false;
    let targetRotationY = 0
    let pausedObject = null;

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

        if (!isPaused || clickedMesh !== pausedObject) {
          // First click (or different object) - pause and focus
          isPaused = true;
          pausedObject = clickedMesh;

          const pos = clickedMesh.position; // local position (logoGroup space)
          const angle = Math.atan2(pos.x, pos.z); // angle around Y
          targetRotationY = -angle;

          new TWEEN.Tween(logoGroup.rotation, tweenGroup)
            .to({ y: targetRotationY }, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
        } else {
          // Second click on the same object - navigate
          const consoleId = clickedMesh.userData.id || '';
          consoleId ? navigate(`/games/${consoleId}`) : navigate('/');
        }
      } else {
        // Clicked empty space - resume rotation
        isPaused = false;
        pausedObject = null;
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

    let shouldAnimate = true;

    const animate = () => {
      if(!shouldAnimate) return;
      requestAnimationFrame(animate);
      try{
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

      }catch(err){
        console.error('Something went wrong!!', err)
        shouldAnimate = false;
      }
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
      {!isReady &&
        <div
        className="absolute inset-0 flex items-center justify-center z-50 transition-opacity duration-500"
        style={{background: 'radial-gradient(circle at center, #1e1e2f 0%, #0a0f1c 100%)'}}
        >
          <h1 className="loading text-xl flex items-center justify-self-center">Loading
            <span className="dot ml-1">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </h1>
        </div>
      }
      <div ref={mountRef} className={`w-full h-60vh absolute inset-0`} />
    </div>
  )
};

export default ThreeCanvas;
