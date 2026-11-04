'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useKeyboard } from './use-keyboard';
import { log } from '@/utils/log';

export const useGlobe = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const rotationVelocityRef = useRef({ x: 0.0008, y: 0.0012 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (container.querySelector('canvas')) return;

    log.info('Initializing globe');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.3;

    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    const nodeCount = 2500;
    const radius = 2.5;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      positions.push(x, y, z);
      colors.push(0, 0.67, 1);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.015,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });

    const particles = new THREE.Points(geometry, material);
    group.add(particles);

    const core = new THREE.Group();
    const sphereGeometry = new THREE.SphereGeometry(0.34, 64, 64);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x8afaff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    core.add(sphere);

    const glowGeometry = new THREE.SphereGeometry(0.85, 64, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x008cff,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    core.add(glow);

    const innerGlowGeometry = new THREE.SphereGeometry(0.55, 64, 64);
    const innerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x16dfff,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
    core.add(innerGlow);
    group.add(core);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      const pulse = (Math.sin(time * 1.8) + 1) / 2;
      sphere.scale.setScalar(1 + pulse * 0.14);
      glow.scale.setScalar(1 + pulse * 0.16);
      innerGlow.scale.setScalar(1 + pulse * 0.12);
      group.rotation.x += rotationVelocityRef.current.x;
      group.rotation.y += rotationVelocityRef.current.y;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      controls.dispose();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      glowGeometry.dispose();
      glowMaterial.dispose();
      innerGlowGeometry.dispose();
      innerGlowMaterial.dispose();
      renderer.dispose();
      groupRef.current = null;
    };
  }, []);

  const rotationAmount = 0.005;

  const keyMap = {
    ArrowUp: () => {
      log.trace('Rotating up');
      rotationVelocityRef.current.x += rotationAmount;
    },
    ArrowDown: () => {
      log.trace('Rotating down');
      rotationVelocityRef.current.x -= rotationAmount;
    },
    ArrowLeft: () => {
      log.trace('Rotating left');
      rotationVelocityRef.current.y -= rotationAmount;
    },
    ArrowRight: () => {
      log.trace('Rotating right');
      rotationVelocityRef.current.y += rotationAmount;
    },
  };

  useKeyboard(keyMap);

  return { containerRef, groupRef };
};
