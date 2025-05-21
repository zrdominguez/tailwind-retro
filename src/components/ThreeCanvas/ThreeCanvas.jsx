import { useEffect, useRef } from "react";
import * as THREE from "three";

const logos = [
  ["/logos/dreamcast.png", "/logos/genesis.png" ],
  ["/logos/gameboy.png", "/logos/gba.png"],
  ["/logos/psone.png", "logos/ps2.png"],
  ["/logos/nes.png", "/logos/snes.png"],
  ["/logos/saturn.png", "/logos/atari.png"],
  ["/logos/pc.png", "logos/xbox.png"],
]

const ThreeCanvas = () => {
  const mountRef = useRef(null);
  //const rendererRef = useRef();

  useEffect(() => {
     const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    //scene.background = new THREE.Color(0x111111);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      1000
    );
    camera.position.z = 8;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);
    //rendererRef.current = renderer;

    // Geometry
    // const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    // const material = new THREE.MeshStandardMaterial({
    //   color: 0xff1493,
    //   metalness: 0.5,
    //   roughness: 0.1,
    // });
    // const knot = new THREE.Mesh(geometry, material);
    // scene.add(knot);

    // Light
    const light = new THREE.AmbientLight(0xffffff, 1);
    const backlight = new THREE.AmbientLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    backlight.position.set(5, 5, -5);
    scene.add(light);
    // scene.add(backlight);

    //Group to rotate
    const logoGroup = new THREE.Group();

    const radius = 5;
    const loader = new THREE.TextureLoader();

    logos.forEach((logo, index) => {
      loader.load(logo[0], texture1 => {
        loader.load(logo[1], texture2 => {

        //clean up the texture so the images look crisper
        texture1.minFilter = THREE.LinearFilter;
        texture1.magFilter = THREE.LinearFilter;
        texture1.anisotropy = renderer.capabilities.getMaxAnisotropy();


        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.MeshBasicMaterial({
          map: texture1,
          transparent: true,
          opacity: 1,
          side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);

        const angle = (index / logos.length) * Math.PI * 2;
        mesh.position.x = radius * Math.cos(angle);
        mesh.position.z = radius * Math.sin(angle);
        mesh.lookAt(0, 0, 0);

        mesh.userData = {
          textures: [texture1, texture2],
          currentIndex: 0
        };

        logoGroup.add(mesh);
        });
      });
    });

    scene.add(logoGroup);

    const triggerLogoFade = (mesh) => {
      const { textures, currentIndex } = mesh.userData;
      const nextIndex = (currentIndex + 1) % textures.length;

      let opacity = 1;
      const fadeOut = () => {
        opacity -= 0.05;
        mesh.material.opacity = opacity;
        if (opacity <= 0) {
          mesh.material.map = textures[nextIndex];
          mesh.userData.currentIndex = nextIndex;
          fadeIn();
        } else {
          requestAnimationFrame(fadeOut);
        }
      };

      const fadeIn = () => {
        opacity += 0.05;
        mesh.material.opacity = opacity;
        if (opacity < 1) {
          requestAnimationFrame(fadeIn);
        }
      };

      fadeOut();
    };

    setInterval(() => {
      const children = logoGroup.children;
      if (children.length > 0) {
        const randomIndex = Math.floor(Math.random() * children.length);
        const mesh = children[randomIndex];
        if (mesh.userData.textures.length > 1) {
          triggerLogoFade(mesh);
        }
      }
    }, 4000);

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);
      logoGroup.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    // const handleResize = () => {
    //   const width = mount.clientWidth;
    //   const height = mount.clientHeight;
    //   camera.aspect = width / height;
    //   camera.updateProjectionMatrix();
    //   renderer.setSize(width, height);
    // };

    //window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      // window.removeEventListener("resize", handleResize);
      // mount.removeChild(renderer.domElement);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-[60vh]"
    />
  );
};

export default ThreeCanvas;
