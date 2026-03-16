import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Country } from '../../pages/WorldPage';

interface GlobeProps {
  countries: Country[];
  onCountryClick: (country: Country) => void;
}

const GlobeComponent: React.FC<GlobeProps> = ({ countries, onCountryClick }) => {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points | null>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0003;
    }
  });

  useEffect(() => {
    if (!groupRef.current) return;

    // Clear existing points
    const pointsToRemove = groupRef.current.children.filter((child) => child instanceof THREE.Points);
    pointsToRemove.forEach((points) => groupRef.current?.remove(points));

    // Create markers for countries
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];

    countries.forEach((country) => {
      const [lat, lon] = country.coordinates;
      const latRad = (lat * Math.PI) / 180;
      const lonRad = (lon * Math.PI) / 180;

      const x = Math.cos(latRad) * Math.cos(lonRad);
      const y = Math.sin(latRad);
      const z = Math.cos(latRad) * Math.sin(lonRad);

      positions.push(x * 1.01, y * 1.01, z * 1.01);
      colors.push(1, 0.6, 0); // Orange color
    });

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

    const material = new THREE.PointsMaterial({
      size: 0.08,
      sizeAttenuation: true,
      vertexColors: true,
    });

    const points = new THREE.Points(geometry, material);
    pointsRef.current = points;
    groupRef.current.add(points);

    // Create clickable spheres for interaction
    countries.forEach((country) => {
      const [lat, lon] = country.coordinates;
      const latRad = (lat * Math.PI) / 180;
      const lonRad = (lon * Math.PI) / 180;

      const x = Math.cos(latRad) * Math.cos(lonRad);
      const y = Math.sin(latRad);
      const z = Math.cos(latRad) * Math.sin(lonRad);

      const sphereGeom = new THREE.SphereGeometry(0.05, 8, 8);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: 0xff9900,
        emissive: 0xff6600,
        metalness: 0.7,
        roughness: 0.2,
      });

      const sphere = new THREE.Mesh(sphereGeom, sphereMat);
      sphere.position.set(x * 1.01, y * 1.01, z * 1.01);
      (sphere as any).userData.country = country;

      groupRef.current?.add(sphere);
    });
  }, [countries]);

  return (
    <group ref={groupRef}>
      {/* Ambient Light */}
      <ambientLight intensity={0.8} />

      {/* Directional Light */}
      <directionalLight position={[5, 5, 5]} intensity={1} />

      {/* Stars Background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Globe */}
      <Sphere args={[1, 64, 64]} castShadow>
        <meshStandardMaterial
          map={new THREE.CanvasTexture(createGlobeTexture())}
          metalness={0.3}
          roughness={0.8}
        />
      </Sphere>

      {/* Wireframe */}
      <Sphere args={[1.001, 32, 32]}>
        <meshBasicMaterial wireframe color="#00a8e8" transparent opacity={0.1} />
      </Sphere>
    </group>
  );
};

// Create a simple globe texture
function createGlobeTexture(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Ocean
  ctx.fillStyle = '#1e90ff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Land (simplified)
  ctx.fillStyle = '#2ecc71';
  
  // Draw some continents roughly
  // South America
  ctx.fillRect(canvas.width * 0.25, canvas.height * 0.4, canvas.width * 0.15, canvas.height * 0.4);
  // Africa
  ctx.fillRect(canvas.width * 0.45, canvas.height * 0.3, canvas.width * 0.15, canvas.height * 0.45);
  // Europe
  ctx.fillRect(canvas.width * 0.45, canvas.height * 0.15, canvas.width * 0.1, canvas.height * 0.15);
  // North America
  ctx.fillRect(canvas.width * 0.1, canvas.height * 0.2, canvas.width * 0.15, canvas.height * 0.35);
  // Asia
  ctx.fillRect(canvas.width * 0.55, canvas.height * 0.2, canvas.width * 0.3, canvas.height * 0.4);

  return canvas;
}

export default GlobeComponent;
