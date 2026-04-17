'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import * as THREE from 'three';
import dynamic from 'next/dynamic';

// ─── Sphere state type ───────────────────────────────────────────────────────

export type SphereState = 'idle' | 'active' | 'listening' | 'responding';

const STATE_MAP: Record<SphereState, number> = {
  idle: 0,
  active: 1,
  listening: 2,
  responding: 3,
};

// ─── GLSL Shaders ───────────────────────────────────────────────────────────

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uTime;
  uniform float uState;      // 0 idle, 1 active, 2 listening, 3 responding
  uniform float uAudioLevel; // 0..1

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise2(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // Base breath (idle)
    float breathMul = 1.0;
    if (uState > 0.5 && uState < 1.5) breathMul = 1.6;            // active
    if (uState > 1.5 && uState < 2.5) breathMul = 1.8 + uAudioLevel * 2.0; // listening
    if (uState > 2.5) breathMul = 2.0;                             // responding

    float breath = (sin(uTime * 0.65) * 0.022 + sin(uTime * 1.3) * 0.008) * breathMul;
    float n = noise2(uv * 5.0 + uTime * 0.12) * 0.012;
    vec3 displaced = position * (1.0 + breath + n);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uState;
  uniform float uAudioLevel;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }
  float fbm(vec2 p) {
    float v=0.0, a=0.5;
    for(int i=0;i<5;i++){v+=a*noise(p);p*=2.1;a*=0.47;}
    return v;
  }

  void main() {
    float t = uTime * 0.22;

    // State flags
    float isActive    = step(0.5, uState) * step(uState, 1.5);
    float isListening = step(1.5, uState) * step(uState, 2.5);
    float isResponding= step(2.5, uState);

    // ── Spherical coordinates from world-space position ──────────────────────
    vec3 np = normalize(vPosition);
    float lat = acos(clamp(np.y, -1.0, 1.0)) / 3.14159;
    float lon = (atan(np.z, np.x) / 6.28318) + 0.5;

    vec2 sp = vec2(lon + t * 0.018, lat);

    // ── Lat/Lon circuit grid ─────────────────────────────────────────────────
    vec2 gridUV  = sp * vec2(18.0, 9.0);
    vec2 gf      = fract(gridUV);
    float lw     = 0.038;
    float gx     = 1.0 - smoothstep(0.0, lw, gf.x) - smoothstep(1.0-lw, 1.0, gf.x);
    float gy     = 1.0 - smoothstep(0.0, lw, gf.y) - smoothstep(1.0-lw, 1.0, gf.y);
    float gridLine = clamp(gx + gy, 0.0, 1.0);

    float nodeD  = min(min(length(gf), length(gf - vec2(1,0))),
                       min(length(gf - vec2(0,1)), length(gf - vec2(1,1))));
    float node   = 1.0 - smoothstep(0.0, 0.14, nodeD);

    vec2  nodeId = floor(gridUV);
    float hotSeed = hash(nodeId) * 6.28318;
    float hot = 0.5 + 0.5 * sin(uTime * (0.8 + hash(nodeId + 5.3) * 1.2) + hotSeed);
    float nodeHot = node * hot;

    float pulsePhase = fract(t * 0.4 + hash(nodeId) * 4.0);
    float pulseLine  = (1.0 - smoothstep(0.0, 0.12, abs(gf.x - pulsePhase))) * step(0.5, hot);
    float pulseV     = (1.0 - smoothstep(0.0, 0.12, abs(gf.y - fract(t * 0.3 + hash(nodeId) * 3.0))));
    float dataPulse  = clamp(pulseLine + pulseV * 0.5, 0.0, 1.0) * gridLine;

    // ── Energy plasma (ambient depth) ────────────────────────────────────────
    float n1    = fbm(sp * 2.8 + vec2(t * 0.55, t * 0.22));
    float n2    = fbm(sp * 5.0 - vec2(t * 0.3, t * 0.45) + n1 * 0.35);
    float plasma = n1 * 0.55 + n2 * 0.45;

    // ── Pulse rings emanating from centre ────────────────────────────────────
    float coreDist = length(vUv - 0.5) * 2.0;

    // Ring frequency boosted by state
    float ringFreq = 0.55
      + isListening * (0.9 + uAudioLevel * 2.0)
      + isResponding * 1.3
      + isActive * 0.35;

    float ringAmp = 1.5
      + isListening * (1.0 + uAudioLevel * 3.0)
      + isResponding * 1.2;

    float r1 = mod(t * ringFreq,       1.0);
    float r2 = mod(t * ringFreq + 0.5, 1.0);

    // Responding: invert direction (rings travel outward faster, starting near centre)
    float rDir = mix(1.0, -1.0, isResponding);
    float rr1 = mix(r1, 1.0 - r1, isResponding);
    float rr2 = mix(r2, 1.0 - r2, isResponding);

    float rings = 0.0;
    rings += (1.0 - smoothstep(0.0, 0.035, abs(coreDist - rr1))) * (1.0 - rr1) * ringAmp;
    rings += (1.0 - smoothstep(0.0, 0.035, abs(coreDist - rr2))) * (1.0 - rr2) * ringAmp;
    rDir;

    // ── Palette ──────────────────────────────────────────────────────────────
    vec3 cVoid   = vec3(0.008, 0.007, 0.035);
    vec3 cDeep   = vec3(0.05,  0.04,  0.18);
    vec3 cGrid   = vec3(0.18,  0.22,  0.75);
    vec3 cIndigo = vec3(0.388, 0.400, 0.945);
    vec3 cCyan   = vec3(0.024, 0.714, 0.831);
    vec3 cHot    = vec3(0.80,  0.92,  1.00);
    vec3 cViolet = vec3(0.55,  0.20,  0.95);

    // Active: tint indigo toward violet
    vec3 cIndigoTinted = mix(cIndigo, mix(cIndigo, cViolet, 0.55), isActive);

    vec3 col = mix(cVoid, cDeep, plasma * 0.5);

    col = mix(col, cGrid,          gridLine * 0.85);
    col = mix(col, cIndigoTinted,  node     * 0.75 * (0.4 + hot * 0.6));
    col += cCyan   * nodeHot  * 0.5;
    col += cHot    * pow(nodeHot, 3.0) * 0.35;

    col += cCyan * dataPulse * 0.7;
    col += cHot  * dataPulse * dataPulse * 0.4;

    col += cIndigoTinted * pow(plasma, 3.5) * 0.45;
    col += cCyan         * pow(plasma, 6.0) * 0.3;

    col += cCyan * rings * 0.55;
    col += cHot  * rings * rings * 0.35;

    // ── Fresnel rim ──────────────────────────────────────────────────────────
    vec3  eyeDir = normalize(vec3(0.0, 0.0, 1.0));
    float NdotV  = abs(dot(normalize(vNormal), eyeDir));
    float fresnel = 1.0 - NdotV;
    float rim1   = pow(fresnel, 1.6);
    float rim2   = pow(fresnel, 4.0);
    col += cCyan * rim1 * 1.8;
    col += cHot  * rim2 * 0.8;
    col += cIndigoTinted * pow(1.0 - NdotV, 3.0) * 0.6;

    // ── Mouse proximity shimmer ───────────────────────────────────────────────
    float mDist = length(vUv - (uMouse * 0.5 + 0.5));
    float mShim = (1.0 - smoothstep(0.0, 0.32, mDist)) * 0.3;
    col += cCyan * mShim;

    // ── Bright pulsing core ───────────────────────────────────────────────────
    float corePulse = 0.5 + 0.5 * sin(uTime * (1.4 + isActive * 0.9 + isListening * 2.0 + isResponding * 1.3));
    float coreGlow  = (1.0 - smoothstep(0.0, 0.35, coreDist));
    float coreHot   = (1.0 - smoothstep(0.0, 0.12, coreDist));
    col += cIndigoTinted * coreGlow * 0.45 * (0.7 + 0.3 * corePulse);
    col += cCyan         * coreHot  * 0.5  * corePulse;
    col += cHot          * (1.0 - smoothstep(0.0, 0.05, coreDist)) * 0.6 * corePulse;

    // Responding: extra overall glow boost
    col *= mix(1.0, 1.4, isResponding);

    // ── Gamma / tone ──────────────────────────────────────────────────────────
    col = pow(max(col, vec3(0.0)), vec3(0.82));

    gl_FragColor = vec4(col, 0.96);
  }
`;

// ─── Energy Orb mesh ─────────────────────────────────────────────────────────

interface EnergyOrbProps {
  mouseRef: React.RefObject<[number, number]>;
  stateRef: React.RefObject<SphereState>;
  audioLevelRef: React.RefObject<number>;
}

function EnergyOrb({ mouseRef, stateRef, audioLevelRef }: EnergyOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useRef({
    uTime:       { value: 0 },
    uMouse:      { value: new THREE.Vector2(0, 0) },
    uState:      { value: 0 },
    uAudioLevel: { value: 0 },
  });

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = clock.getElapsedTime();
    const [mx, my] = mouseRef.current ?? [0, 0];
    mat.uniforms.uMouse.value.set(mx, my);

    // Smoothly approach target state float
    const target = STATE_MAP[stateRef.current ?? 'idle'];
    const current = mat.uniforms.uState.value as number;
    mat.uniforms.uState.value = current + (target - current) * 0.12;

    const targetAudio = audioLevelRef.current ?? 0;
    const curAudio = mat.uniforms.uAudioLevel.value as number;
    mat.uniforms.uAudioLevel.value = curAudio + (targetAudio - curAudio) * 0.25;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.8, 128, 128]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

// ─── Neural Network Canvas 2D overlay ───────────────────────────────────────

interface NeuralNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  orbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
  size: number;
}

interface NeuralNetworkProps {
  width: number;
  height: number;
  isMobile?: boolean;
  mouseRef: React.RefObject<[number, number]>;
}

function NeuralNetwork({ width, height, isMobile = false, mouseRef }: NeuralNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const nodesRef = useRef<NeuralNode[]>([]);
  const timeRef = useRef(0);
  const lastPulseRef = useRef(0);
  const pulseRef = useRef<{ from: number; to: number; t: number; active: boolean }>({
    from: 0, to: 1, t: 0, active: false,
  });

  const NODE_COUNT    = isMobile ? 24 : 48;
  const LINE_THRESHOLD = isMobile ? 90 : 130;
  const ORBIT_COUNT   = 4;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = width / 2;
    const cy = height / 2;
    const nodes: NeuralNode[] = [];

    for (let i = 0; i < NODE_COUNT; i++) {
      const orbitIdx    = i % ORBIT_COUNT;
      const baseR       = 55 + orbitIdx * 38;
      const orbitRadius = baseR + Math.random() * 18;
      const orbitAngle  = (i / NODE_COUNT) * Math.PI * 2 + Math.random() * 0.5;
      const orbitSpeed  = (0.00025 + Math.random() * 0.0004) * (Math.random() > 0.5 ? 1 : -1);
      const x = cx + Math.cos(orbitAngle) * orbitRadius * 1.55;
      const y = cy + Math.sin(orbitAngle) * orbitRadius;
      nodes.push({ x, y, vx: 0, vy: 0, orbitRadius, orbitAngle, orbitSpeed, size: 1.8 + Math.random() * 1.4 });
    }
    nodesRef.current = nodes;

    let lastTime = performance.now();
    let frameSkip = 0;

    function draw(now: number) {
      animFrameRef.current = requestAnimationFrame(draw);
      if (isMobile && (++frameSkip % 2 !== 0)) return;

      const dt = now - lastTime;
      lastTime = now;
      timeRef.current += dt;
      const t = timeRef.current;

      ctx!.clearRect(0, 0, width, height);

      const [rawMx, rawMy] = mouseRef.current ?? [0, 0];
      const mxPx = (rawMx  * 0.5 + 0.5) * width;
      const myPx = (-rawMy * 0.5 + 0.5) * height;

      for (const node of nodesRef.current) {
        node.orbitAngle += node.orbitSpeed * dt;
        const tx = cx + Math.cos(node.orbitAngle) * node.orbitRadius * 1.55;
        const ty = cy + Math.sin(node.orbitAngle) * node.orbitRadius;
        const dxM = mxPx - node.x;
        const dyM = myPx - node.y;
        const distM = Math.sqrt(dxM*dxM + dyM*dyM);
        if (distM < 100) { node.vx += (dxM/distM)*0.03; node.vy += (dyM/distM)*0.03; }
        node.vx += (tx - node.x) * 0.004; node.vy += (ty - node.y) * 0.004;
        node.vx *= 0.94; node.vy *= 0.94;
        node.x += node.vx; node.y += node.vy;
      }

      const nodeList = nodesRef.current;

      for (let i = 0; i < nodeList.length; i++) {
        for (let j = i + 1; j < nodeList.length; j++) {
          const a = nodeList[i], b = nodeList[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < LINE_THRESHOLD) {
            const prox  = 1 - dist / LINE_THRESHOLD;
            const alpha = prox * 0.65;
            const grad  = ctx!.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, `rgba(99,102,241,${alpha})`);
            grad.addColorStop(1, `rgba(6,182,212,${alpha * 0.8})`);
            ctx!.strokeStyle = grad;
            ctx!.lineWidth = prox * 1.5;
            ctx!.beginPath(); ctx!.moveTo(a.x, a.y); ctx!.lineTo(b.x, b.y); ctx!.stroke();
          }
        }
      }

      if (t - lastPulseRef.current > 1500 + Math.random() * 2000) {
        lastPulseRef.current = t;
        const from = Math.floor(Math.random() * nodeList.length);
        let to = Math.floor(Math.random() * nodeList.length);
        while (to === from) to = Math.floor(Math.random() * nodeList.length);
        pulseRef.current = { from, to, t: 0, active: true };
      }

      if (pulseRef.current.active) {
        pulseRef.current.t += dt / 500;
        const p  = Math.min(pulseRef.current.t, 1);
        const na = nodeList[pulseRef.current.from];
        const nb = nodeList[pulseRef.current.to];
        if (na && nb) {
          const px = na.x + (nb.x - na.x) * p;
          const py = na.y + (nb.y - na.y) * p;
          const grd = ctx!.createRadialGradient(px, py, 0, px, py, 8);
          grd.addColorStop(0, 'rgba(6,182,212,0.9)');
          grd.addColorStop(1, 'rgba(6,182,212,0)');
          ctx!.beginPath(); ctx!.arc(px, py, 8, 0, Math.PI*2);
          ctx!.fillStyle = grd; ctx!.fill();
          ctx!.beginPath(); ctx!.arc(px, py, 2.5, 0, Math.PI*2);
          ctx!.fillStyle = 'rgba(255,255,255,0.95)'; ctx!.fill();
        }
        if (p >= 1) pulseRef.current.active = false;
      }

      for (const node of nodeList) {
        const flicker = 0.6 + 0.4 * Math.sin(t * 0.0009 + node.orbitAngle * 6);
        const alpha   = 0.65 + flicker * 0.35;

        const grd = ctx!.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size * 4);
        grd.addColorStop(0, `rgba(99,102,241,${alpha * 0.6})`);
        grd.addColorStop(1, 'rgba(99,102,241,0)');
        ctx!.beginPath(); ctx!.arc(node.x, node.y, node.size * 4, 0, Math.PI*2);
        ctx!.fillStyle = grd; ctx!.fill();

        ctx!.beginPath(); ctx!.arc(node.x, node.y, node.size, 0, Math.PI*2);
        ctx!.fillStyle = `rgba(160,165,255,${alpha})`; ctx!.fill();
      }
    }

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, isMobile]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}
      aria-hidden="true"
    />
  );
}

// ─── Touch device detection ──────────────────────────────────────────────────

function detectTouch(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)
  );
}

// ─── Full NexusSphere (R3F + 2D overlay) ────────────────────────────────────

interface NexusSphereProps {
  size?: number;
  isMobile?: boolean;
  sphereState?: SphereState;
  audioLevel?: number;
  onHoverDwell?: () => void;
  onTap?: () => void;
}

export function NexusSphere({
  size = 500,
  isMobile = false,
  sphereState = 'idle',
  audioLevel = 0,
  onHoverDwell,
  onTap,
}: NexusSphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<[number, number]>([0, 0]);
  const stateRef = useRef<SphereState>(sphereState);
  const audioRef = useRef<number>(audioLevel);

  useEffect(() => { stateRef.current = sphereState; }, [sphereState]);
  useEffect(() => { audioRef.current = audioLevel; }, [audioLevel]);

  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    // SSR-safe: detectTouch reads window, only safe on client
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTouch(detectTouch());
  }, []);

  // Cursor drift — translate the wrapper div ±12px toward cursor (desktop only)
  const driftX = useMotionValue(0);
  const driftY = useMotionValue(0);
  const springX = useSpring(driftX, { stiffness: 80, damping: 20, mass: 0.6 });
  const springY = useSpring(driftY, { stiffness: 80, damping: 20, mass: 0.6 });

  // Swipe wobble (mobile)
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const rotSpringX = useSpring(rotX, { stiffness: 200, damping: 15 });
  const rotSpringY = useSpring(rotY, { stiffness: 200, damping: 15 });

  // Hover dwell tracking
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dwellFiredRef = useRef(false);

  // Cursor drift handler (global mousemove — normalized shader coords
  // + translate based on distance from sphere center)
  useEffect(() => {
    if (isTouch) return;

    function handleMouseMove(e: MouseEvent) {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();

      // Normalized -1..1 coords for shader (always based on container)
      const x = ((e.clientX - rect.left) / rect.width) *  2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) *  2 - 1);
      mouseRef.current = [x, y];

      // Container drift (global coords, damped so large distances don't throw
      // sphere off). Max ±12px.
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const maxReach = Math.max(rect.width, 400);
      const nx = Math.max(-1, Math.min(1, dx / maxReach));
      const ny = Math.max(-1, Math.min(1, dy / maxReach));
      driftX.set(nx * 12);
      driftY.set(ny * 12);
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isTouch, driftX, driftY]);

  // Hover dwell (desktop only)
  const handleMouseEnter = useCallback(() => {
    if (isTouch || !onHoverDwell || dwellFiredRef.current) return;
    hoverTimerRef.current = setTimeout(() => {
      dwellFiredRef.current = true;
      onHoverDwell();
    }, 2000);
  }, [isTouch, onHoverDwell]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  }, []);

  // Touch swipe → wobble
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const wobbleResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const start = touchStartRef.current;
    const touch = e.touches[0];
    if (!start || !touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    // Convert swipe distance to rotation (±15deg max)
    const maxSwipe = 120;
    const ry = Math.max(-15, Math.min(15, (dx / maxSwipe) * 15));
    const rxv = Math.max(-15, Math.min(15, -(dy / maxSwipe) * 15));
    rotY.set(ry);
    rotX.set(rxv);
  }, [rotX, rotY]);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
    if (wobbleResetRef.current) clearTimeout(wobbleResetRef.current);
    wobbleResetRef.current = setTimeout(() => {
      rotX.set(0);
      rotY.set(0);
    }, 400);
  }, [rotX, rotY]);

  useEffect(() => () => {
    if (wobbleResetRef.current) clearTimeout(wobbleResetRef.current);
  }, []);

  return (
    <motion.div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={onTap}
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        overflow: 'hidden',
        x: springX,
        y: springY,
        rotateX: rotSpringX,
        rotateY: rotSpringY,
        cursor: onTap ? 'pointer' : 'default',
        transformStyle: 'preserve-3d',
        perspective: 1200,
      }}
    >
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        style={{ position: 'absolute', inset: 0, background: 'transparent', zIndex: 0 }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
      >
        <EnergyOrb
          mouseRef={mouseRef as React.RefObject<[number, number]>}
          stateRef={stateRef as React.RefObject<SphereState>}
          audioLevelRef={audioRef as React.RefObject<number>}
        />
      </Canvas>

      <NeuralNetwork
        width={size}
        height={size}
        isMobile={isMobile}
        mouseRef={mouseRef as React.RefObject<[number, number]>}
      />
    </motion.div>
  );
}

// ─── NexusSphereMobile (CSS-only fallback) ────────────────────────────────────

interface NexusSphereMobileProps {
  size?: number;
  sphereState?: SphereState;
  onHoverDwell?: () => void;
  onTap?: () => void;
}

export function NexusSphereMobile({
  size = 280,
  sphereState = 'idle',
  onTap,
}: NexusSphereMobileProps) {
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const rotSpringX = useSpring(rotX, { stiffness: 200, damping: 15 });
  const rotSpringY = useSpring(rotY, { stiffness: 200, damping: 15 });

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const wobbleResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]; if (!t) return;
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    const start = touchStartRef.current; const t = e.touches[0];
    if (!start || !t) return;
    const dx = t.clientX - start.x; const dy = t.clientY - start.y;
    rotY.set(Math.max(-15, Math.min(15, (dx / 120) * 15)));
    rotX.set(Math.max(-15, Math.min(15, -(dy / 120) * 15)));
  };
  const handleTouchEnd = () => {
    touchStartRef.current = null;
    if (wobbleResetRef.current) clearTimeout(wobbleResetRef.current);
    wobbleResetRef.current = setTimeout(() => { rotX.set(0); rotY.set(0); }, 400);
  };

  useEffect(() => () => {
    if (wobbleResetRef.current) clearTimeout(wobbleResetRef.current);
  }, []);

  const animSpeed =
    sphereState === 'listening' ? '1.6s' :
    sphereState === 'responding' ? '1.2s' :
    sphereState === 'active' ? '2.6s' :
    '4s';

  return (
    <motion.div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={onTap}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: sphereState === 'active'
          ? 'radial-gradient(circle at 35% 30%, #8B5CF6 0%, #2A1F5E 55%, #04040C 100%)'
          : 'radial-gradient(circle at 35% 30%, #6366F1 0%, #0D0D2B 55%, #04040C 100%)',
        filter: 'drop-shadow(0 0 70px rgba(99,102,241,0.6)) drop-shadow(0 0 140px rgba(6,182,212,0.35))',
        animation: `nexus-pulse ${animSpeed} ease-in-out infinite`,
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        rotateX: rotSpringX,
        rotateY: rotSpringY,
        transformStyle: 'preserve-3d',
        perspective: 800,
        cursor: onTap ? 'pointer' : 'default',
      }}
      aria-hidden="true"
    >
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        backgroundImage: `
          linear-gradient(rgba(99,102,241,0.15) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.15) 1px, transparent 1px)
        `,
        backgroundSize: `${size/8}px ${size/8}px`,
        pointerEvents: 'none',
      }} />
      <style>{`
        @keyframes nexus-pulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.04); }
        }
      `}</style>
    </motion.div>
  );
}

// ─── Default export: dynamic loader ──────────────────────────────────────────

const NexusSphereDesktop = dynamic(
  () => import('./NexusSphere').then((m) => ({ default: m.NexusSphere })),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: 500, height: 500, borderRadius: '50%',
          border: '1px solid rgba(99,102,241,0.25)',
          background: 'radial-gradient(circle at 35% 30%, rgba(99,102,241,0.15), transparent 70%)',
        }}
        aria-hidden="true"
      />
    ),
  }
);

interface NexusSphereLoaderProps {
  size?: number;
  sphereState?: SphereState;
  audioLevel?: number;
  onHoverDwell?: () => void;
  onTap?: () => void;
}

export default function NexusSphereLoader({
  size,
  sphereState = 'idle',
  audioLevel = 0,
  onHoverDwell,
  onTap,
}: NexusSphereLoaderProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    // SSR-safe: window only available on client
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(window.innerWidth < 768);
  }, []);

  if (isMobile === null) {
    return (
      <div
        style={{
          width: size ?? 500, height: size ?? 500, borderRadius: '50%',
          border: '1px solid rgba(99,102,241,0.15)',
        }}
        aria-hidden="true"
      />
    );
  }

  if (isMobile) {
    return (
      <NexusSphereMobile
        size={size ?? 280}
        sphereState={sphereState}
        onHoverDwell={onHoverDwell}
        onTap={onTap}
      />
    );
  }
  return (
    <NexusSphereDesktop
      size={size ?? 500}
      sphereState={sphereState}
      audioLevel={audioLevel}
      onHoverDwell={onHoverDwell}
      onTap={onTap}
    />
  );
}
