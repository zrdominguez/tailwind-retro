import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const GridBackground = () => {
  const materialRef = useRef();

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    uniform float uTime;

    void main() {
      vec2 uv = vUv * 2.0 - 1.0;

      // Fake perspective by scaling y
      uv.y /= (1.0 - uv.y * 0.5);

      // Create motion in z (forward)
      float speed = 2.0;
      float z = uTime * speed + uv.y * 10.0;

      // Grid
      float lineX = smoothstep(0.01, 0.015, abs(fract(uv.x * 10.0) - 0.5));
      float lineY = smoothstep(0.01, 0.015, abs(fract(z) - 0.5));
      float grid = max(lineX, lineY);

      // Fade near edges
      float fade = 1.0 - smoothstep(0.8, 1.0, length(uv));

      vec3 color = mix(vec3(0.0), vec3(1.0, 0.2, 0.7), grid) * fade;
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const uniforms = {
    time: { value: 0 },
  };

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[100, 100]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={2} // DoubleSide
      />
    </mesh>
  );
};

export default GridBackground;
