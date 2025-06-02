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
      {consoleName: "NES" ,path: 'https://zechariahdbucket.s3.us-east-2.amazonaws.com/3dConsoleModels/nintendo_nes_original/scene.gltf', id: 49},
      {consoleName: "Sega Saturn", path:'https://zechariahdbucket.s3.us-east-2.amazonaws.com/3dConsoleModels/sega_saturn/scene.gltf', id: 107},
      {consoleName: "PS1", path:'https://zechariahdbucket.s3.us-east-2.amazonaws.com/3dConsoleModels/playstation_one/scene.gltf', id: 27},
      {consoleName: "Xbox", path:'https://zechariahdbucket.s3.us-east-2.amazonaws.com/3dConsoleModels/xbox/scene.gltf', id: 80},
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

        //Center model
        // Compute bounding box and center
        const bbox = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        bbox.getCenter(center);

        // Move model so center is at (0,0,0)
        model.position.sub(center);

        // box.setFromObject(model); // Update after scaling
        // const center = new THREE.Vector3();
        // box.getCenter(center);
        // model.position.sub(center); // move pivot to center


        // Add debug marker
        const sphereGeo = new THREE.SphereGeometry(0.05, 16, 16);
        const sphereMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const marker = new THREE.Mesh(sphereGeo, sphereMat);
        marker.position.copy(center);
        logoGroup.add(marker);

        // Position on circle
        const pos = computeCirclePosition(index, modelPaths.length, radius);
        model.position.add(pos);

        // Face the center
        model.lookAt(0, 0, 0);

        if (consoleName === "Sega Saturn") {
          //model.rotation.y -= 0.89; // flip horizontally
          model.rotation.x += Math.PI; // flip vertically
        }
        else if(consoleName == "PS1"){
          model.rotation.y += Math.PI;
          //model.translateY(-1)
        }else if(consoleName == "Xbox"){
          model.rotation.y += Math.PI;
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
        // Create fallback cube
        const fallback = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshStandardMaterial({ color: 0xff69b4 })
        );

        // Position fallback cube in the circular layout
        const pos = computeCirclePosition(index, modelPaths.length, radius);
        fallback.position.copy(pos);
        originalPositions.set(fallback, pos.clone());

        // Add fallback cube to the scene group
        logoGroup.add(fallback);

        // Load font and add 3D text for console name
        const loaderFont = new FontLoader();
        loaderFont.load('/fonts/helvetiker_regular.typeface.json', (font) => {
          const textGeo = new TextGeometry(consoleName, {
            font: font,
            size: 0.4,
            height: 0.01,
            curveSegments: 12,
          });

          // Compute bounding boxes
          textGeo.computeBoundingBox();
          const textSize = new THREE.Vector3();
          textGeo.boundingBox.getSize(textSize);
          const textCenter = new THREE.Vector3();
          textGeo.boundingBox.getCenter(textCenter);

          const fallbackBox = new THREE.Box3().setFromObject(fallback);
          const fallbackSize = new THREE.Vector3();
          fallbackBox.getSize(fallbackSize);
          const fallbackCenter = new THREE.Vector3();
          fallbackBox.getCenter(fallbackCenter);
          textGeo.translate(-textCenter.x, -textCenter.y, -textCenter.z);

          // Create text mesh
          const textMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0x444444,
            metalness: 0.3,
            roughness: 0.6,
          });
          const textMesh = new THREE.Mesh(textGeo, textMat);

          // Position text centered above fallback cube
          textMesh.position.copy(fallbackCenter);                 // Start at fallback center
          textMesh.position.y += fallbackSize.y / 2 + textSize.y / 2 ;  // Slight gap above cube
          textMesh.position.x = textCenter.x - 2;                   // Center text horizontally
          textMesh.position.z = 0;
          textMesh.scale.set(1, 1, 0)

          // Optional: Rotate text to face camera or desired direction
          textMesh.rotation.y = -Math.PI / 2; // Adjust based on fallback orientation


          // Add text to fallback cube
          fallback.add(textMesh);
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

    // const handleClick = (event) => {
    //   const bounds = renderer.domElement.getBoundingClientRect();
    //   mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    //   mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

    //   raycaster.setFromCamera(mouse, camera);
    //   const intersects = raycaster.intersectObjects(logoGroup.children, true);

    //   if (intersects.length > 0) {
    //     let clickedMesh = intersects[0].object;
    //     while (clickedMesh.parent && clickedMesh.parent !== logoGroup) {
    //       clickedMesh = clickedMesh.parent; // climb up to logoGroup child
    //     }

    //     if (!isPaused || clickedMesh !== pausedObject) {
    //       // First click (or different object) - pause and focus
    //       isPaused = true;
    //       pausedObject = clickedMesh;

    //       const pos = clickedMesh.position; // local position (logoGroup space)
    //       const angle = Math.atan2(pos.x, pos.z); // angle around Y
    //       clickedMesh.updateWorldMatrix(true, false);
    //       targetRotationY = -angle;

    //       new TWEEN.Tween(logoGroup.rotation, tweenGroup)
    //         .to({ y: targetRotationY }, 1000)
    //         .easing(TWEEN.Easing.Quadratic.Out)
    //         .start();
    //     } else {
    //       // Second click on the same object - navigate
    //       const consoleId = clickedMesh.userData.id || '';
    //       consoleId ? navigate(`/games/${consoleId}`) : navigate('/');
    //     }
    //   } else {
    //     // Clicked empty space - resume rotation
    //     isPaused = false;
    //     pausedObject = null;
    //   }
    // };

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
        isPaused = true;
        pausedObject = clickedMesh;

        // ✅ Get the object's position in the group's local space
        const localPos = clickedMesh.position.clone();

        // ✅ Calculate angle around Y axis based on local X and Z
        const angle = Math.atan2(localPos.x, localPos.z);

        // 🔥 Set the target rotation for the group
        targetRotationY = -angle;

        // 🔥 Clear existing tweens in the group
        tweenGroup.getAll().forEach((tween) => tween.stop());

        // 🔥 Smoothly rotate the group to bring the clicked object to center
        new TWEEN.Tween(logoGroup.rotation, tweenGroup)
          .to({ y: targetRotationY }, 1000)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();
      } else {
        // Second click: navigate
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
          model.position.y = (originalPositions.get(model)?.y ?? 0) + floatHeight;
          // Optional gentle wobble
          model.rotation.x = 0.05 * Math.sin(elapsed * 1.5 + index);
          model.rotation.z = 0.05 * Math.cos(elapsed * 1.5 + index);
        });

        renderer.render(scene, camera);

      }catch(err){
        console.error('Something went wrong!!', err)
        shouldAnimate = false;
      }
    };
    animate();

    return () => {
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
