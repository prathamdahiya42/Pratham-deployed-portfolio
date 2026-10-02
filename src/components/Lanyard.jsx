import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer, Float, PresentationControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import './Lanyard.css';

const cardGLB = '/assets/lanyard/card.glb';

// 1x1 transparent pixel fallback
const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// The card model's front face is UV-mapped to the LEFT half and back face to RIGHT half
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

export default function Lanyard({
  position = [0, 0, 14],
  fov = 26,
  transparent = true,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
}) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="lanyard-wrapper" style={{ cursor: 'grab' }}>
      <Canvas
        camera={{ position: position, fov: fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent, antialias: true }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI * 0.8} />
        <directionalLight position={[5, 10, 7]} intensity={1.5} />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} />

        {/* Presentation Controls: Smooth 360-degree interactive rotation on mouse/touch drag */}
        <PresentationControls
          global={false}
          cursor={true}
          snap={false}
          speed={1.8}
          zoom={1}
          polar={[-Math.PI / 4, Math.PI / 4]}
          azimuth={[-Infinity, Infinity]}
          config={{ mass: 1, tension: 170, friction: 26 }}
        >
          {/* Subtle floating zero-gravity idle motion */}
          <Float
            speed={2.2}
            rotationIntensity={0.3}
            floatIntensity={0.5}
            floatingRange={[-0.12, 0.12]}
          >
            <Suspense fallback={null}>
              <CardBadge
                isMobile={isMobile}
                frontImage={frontImage}
                backImage={backImage}
                imageFit={imageFit}
              />
            </Suspense>
          </Float>
        </PresentationControls>

        {/* Ambient floor shadow */}
        <ContactShadows
          position={[0, -2.6, 0]}
          opacity={0.45}
          scale={7}
          blur={2.5}
          far={5}
        />

        {/* High-end studio environment lighting */}
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="#ffffff"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="#ffffff"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={4}
            color="#ea580c"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={8}
            color="#a78bfa"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

function CardBadge({ isMobile = false, frontImage = null, backImage = null, imageFit = 'cover' }) {
  const cardGroup = useRef();
  const { nodes, materials } = useGLTF(cardGLB);

  const frontTex = useTexture(frontImage || BLANK_PIXEL);
  const backTex = useTexture(backImage || BLANK_PIXEL);

  // Composite front/back textures onto the card's UV atlas
  const cardMap = useMemo(() => {
    const baseMap = materials.base?.map;
    if (!baseMap) return null;
    if (!frontImage && !backImage) return baseMap;

    const baseImg = baseMap.image;
    if (!baseImg) return baseMap;
    const W = baseImg.width || 1024;
    const H = baseImg.height || 1024;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return baseMap;
    ctx.drawImage(baseImg, 0, 0, W, H);

    const drawFitted = (img, rect) => {
      const rx = rect.x * W;
      const ry = rect.y * H;
      const rw = rect.w * W;
      const rh = rect.h * H;
      const pick = imageFit === 'contain' ? Math.min : Math.max;
      const scale = pick(rw / img.width, rh / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = rx + (rw - dw) / 2;
      const dy = ry + (rh - dh) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    };

    if (frontImage && frontTex?.image) drawFitted(frontTex.image, FRONT_UV_RECT);
    if (backImage && backTex?.image) drawFitted(backTex.image, BACK_UV_RECT);

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [frontImage, backImage, imageFit, frontTex, backTex, materials.base?.map]);

  return (
    <group
      ref={cardGroup}
      scale={2.7}
      position={[0, 0, 0]}
    >
      {/* 3D Card Geometry */}
      <mesh geometry={nodes.card.geometry}>
        <meshPhysicalMaterial
          map={cardMap}
          map-anisotropy={16}
          clearcoat={isMobile ? 0.3 : 1}
          clearcoatRoughness={0.15}
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>

      {/* Top Metallic Clip & Clamp (Badge holder fixture without ribbon) */}
      <mesh
        geometry={nodes.clip.geometry}
        material={materials.metal}
        material-roughness={0.25}
        material-metalness={0.9}
      />
      <mesh
        geometry={nodes.clamp.geometry}
        material={materials.metal}
        material-roughness={0.25}
        material-metalness={0.9}
      />
    </group>
  );
}

useGLTF.preload(cardGLB);
