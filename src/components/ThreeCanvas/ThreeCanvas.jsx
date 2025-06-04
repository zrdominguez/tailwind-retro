import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { gsap } from "gsap";
import * as TWEEN from '@tweenjs/tween.js';
import { Group as TweenGroup } from '@tweenjs/tween.js';
import { useNavigate } from "react-router-dom";
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';


const ThreeCanvas = () => {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');
  dracoLoader.setDecoderConfig({ type: 'js' });
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
    loader.setDRACOLoader(dracoLoader);
    const radius = 5;

    const modelPaths = [
      {consoleName: "NES" , path: 'https://zechariahdbucket.s3.us-east-2.amazonaws.com/3dConsoleModels/nes_original_draco.glb', id: 49},
      {consoleName: "Sega Saturn", path:'https://zechariahdbucket.s3.us-east-2.amazonaws.com/3dConsoleModels/sega_saturn_draco.glb', id: 107},
      {consoleName: "PS1", path:'https://zechariahdbucket.s3.us-east-2.amazonaws.com/3dConsoleModels/psx_draco.glb', id: 27},
      {consoleName: "Xbox", path:'https://zechariahdbucket.s3.us-east-2.amazonaws.com/3dConsoleModels/xbox_draco.glb', id: 80},
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

    //Keep track of all models original postitions
    const originalPositions = new Map();

    //Wrap model loading into a promise
    function loadModel(path, consoleName, id) {
      return new Promise((resolve) => {
        loader.load(
          path,
          (gltf) => {
            const model = gltf.scene;
            model.traverse((child) => {
              if (child.isMesh) {
                child.userData = { consoleName, id };
              }
            });

            // Normalize model scale to fit in 1x1x1 cube
            const bbox = new THREE.Box3().setFromObject(model);
            const size = new THREE.Vector3();
            bbox.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 1 / maxDim;
            model.scale.setScalar(scale);

            // Recalculate bounding box *after* scaling
            bbox.setFromObject(model);
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            model.position.sub(center); // Center model in pivot
            resolve(model);
          },
          undefined,
          (err) => {
            console.error(`Error loading model ${consoleName}`, err);
            resolve(null); // Fail gracefully
          }
        );
      })
    }

    //Load and attach models in parallel
    (async () => {
      const promises = modelPaths.map(async ({ path, consoleName, id }, index) => {
         // Set up pivot and fallback immediately
        const pivot = new THREE.Object3D();

        // Create and attach a fallback cube
        const fallback = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshStandardMaterial({ color: 0xff69b4 })
        );
        fallback.userData = { consoleName, id };
        pivot.add(fallback);

        const pos = computeCirclePosition(index, modelPaths.length, radius);
        pivot.position.copy(pos);
        originalPositions.set(pivot, pos.clone());
        logoGroup.add(pivot);

        // Start loading async
        return loadModel(path, consoleName, id).then((model) => {
          if (model) {
            pivot.remove(fallback);
            pivot.add(model);
          }
        });


        // const model = await loadModel(path, consoleName, id);

        // if (model) {
        //   pivot.remove(fallback);
        //   pivot.add(model);
        // }

        // return true; // Count as loaded
      });

      await Promise.all(promises);
      setIsReady(true); // Done loading everything
    })();

    // modelPaths.forEach(({path, consoleName, id}, index) => {
    // // Create pivot (parent) for centering and positioning
    // const pivot = new THREE.Object3D();

    // // Create default cube as fallback
    // const defaultCube = new THREE.Mesh(
    //   new THREE.BoxGeometry(1, 1, 1),
    //   new THREE.MeshStandardMaterial({ color: 0xff69b4 }) // Hot pink
    // );

    // defaultCube.userData = { consoleName, id };

    // // Optional: You can center the cube if needed, though BoxGeometry is already centered
    // pivot.add(defaultCube);

    // // Position the pivot in the circle layout
    // const pos = computeCirclePosition(index, modelPaths.length, radius);
    // pivot.position.copy(pos);
    // originalPositions.set(pivot, pos.clone());

    // // Add pivot to logoGroup immediately
    // logoGroup.add(pivot);

    // // Load the AWS model
    // loader.load(
    //   path,
    //   (gltf) => {
    //     const model = gltf.scene;
    //     model.traverse((child) => {
    //        if (child.isMesh) {
    //         child.userData = { consoleName, id };
    //       }
    //     });
    //     // Normalize size
    //     const box = new THREE.Box3().setFromObject(model);
    //     const size = new THREE.Vector3();
    //     box.getSize(size);
    //     const maxDim = Math.max(size.x, size.y, size.z);
    //     const scale = 1 / maxDim;
    //     model.scale.setScalar(scale);


    //     // Compute bounding box and center the model
    //     const bbox = new THREE.Box3().setFromObject(model);
    //     const center = new THREE.Vector3();
    //     bbox.getCenter(center);
    //     model.position.sub(center); // Center it to pivot

    //     // Remove the default cube and add model
    //     pivot.remove(defaultCube);

    //     pivot.add(model);

    //     modelsLoaded++
    //     if(totalModels === modelsLoaded) setIsReady(true);
    //   },
    //   undefined, // onProgress (optional)
    //   (error) => {
    //     console.error(`Error loading model at ${path}:`, error);
    //     // The default cube stays since model failed
    //     modelsLoaded++
    //     if(totalModels === modelsLoaded) setIsReady(true);
    //   });
    // });

    // Raycaster & Mouse
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isPaused = false;
    let targetRotationY = 0
    let pausedObject = null;


    const handleClick = (event) => {
      // 🖱️ 1. Convert the mouse click to normalized device coordinates (-1 to +1)
      const bounds = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

      // 📡 2. Set up raycasting from the camera using the mouse position
      raycaster.setFromCamera(mouse, camera);

      // 🔍 3. Get all intersected objects (true = recursive into children)
      const intersects = raycaster.intersectObjects(logoGroup.children, true);

      // ❌ 4. If nothing was clicked, unpause and reset
      if (intersects.length === 0) {
        isPaused = false;
        pausedObject = null;
        return;
      }

      // 🎯 5. Get the actual mesh that was hit by the ray
      const meshHit = intersects[0].object;

      // 🧠 6. Get any metadata you stored on the mesh (like console ID)
      const clickedData = meshHit.userData || {};
      const { id } = clickedData;

      // 🪜 7. Climb up the object hierarchy until you reach the direct child of logoGroup
      //      This is useful because your models are grouped under a "pivot" object for positioning
      let clickedPivot = meshHit;
      while (clickedPivot.parent && clickedPivot.parent !== logoGroup) {
        clickedPivot = clickedPivot.parent;
      }

      // ⏸️ 8. If we’re not paused or clicked a new item, rotate to center the object
      if (!isPaused || clickedPivot !== pausedObject) {
        isPaused = true;
        pausedObject = clickedPivot;

        // 📍 9. Get the clicked object's position within the group
        const localPos = clickedPivot.position.clone();

        // 🔄 10. Calculate the angle needed to rotate the group so the item faces forward (Z direction)
        const angle = Math.atan2(localPos.x, localPos.z);
        targetRotationY = -angle;

        // ❌ 11. Stop any existing rotation animations (tweens)
        tweenGroup.getAll().forEach((tween) => tween.stop());

        // 🌀 12. Animate the rotation of the group to center the clicked object
        new TWEEN.Tween(logoGroup.rotation, tweenGroup)
          .to({ y: targetRotationY }, 1000)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();

      } else {
        // 🚪 13. If already centered and clicked again, navigate to the game detail page
        id ? navigate(`/games/${id}`) : navigate('/');
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
          model.rotation.y += 0.01;  // Adjust speed as desired
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
