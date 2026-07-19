import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Truncated-icosahedron panel layout via spherical Voronoi classification.
// ---------------------------------------------------------------------------
function normalize(v: number[]) {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  return [v[0] / len, v[1] / len, v[2] / len];
}

function buildBallCenters() {
  const phi = (1 + Math.sqrt(5)) / 2;

  // 12 icosahedron vertices → pentagon (black) panel centers
  const pentagons = [
    [0, 1, phi], [0, -1, phi], [0, 1, -phi], [0, -1, -phi],
    [1, phi, 0], [-1, phi, 0], [1, -phi, 0], [-1, -phi, 0],
    [phi, 0, 1], [phi, 0, -1], [-phi, 0, 1], [-phi, 0, -1],
  ].map(normalize);

  // Generate the 20 face centers of the icosahedron.
  const hexagons: number[][] = [];
  const n = pentagons.length;

  const isAdjacent = (v1: number[], v2: number[]) => {
    const dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    return dot > 0.4;
  };

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (!isAdjacent(pentagons[i], pentagons[j])) continue;
      for (let k = j + 1; k < n; k++) {
        if (isAdjacent(pentagons[i], pentagons[k]) && isAdjacent(pentagons[j], pentagons[k])) {
          const center = [
            (pentagons[i][0] + pentagons[j][0] + pentagons[k][0]) / 3,
            (pentagons[i][1] + pentagons[j][1] + pentagons[k][1]) / 3,
            (pentagons[i][2] + pentagons[j][2] + pentagons[k][2]) / 3,
          ];
          hexagons.push(normalize(center));
        }
      }
    }
  }

  return { pentagons, hexagons };
}

type Centers = ReturnType<typeof buildBallCenters>;

function classifyPoint(x: number, y: number, z: number, centers: Centers) {
  let firstDot = -2;
  let secondDot = -2;
  let closestIsPentagon = false;
  let closestCenter = [0, 0, 0];

  const PENTAGON_BIAS = -0.015;

  const allCenters: { pos: number[]; isPentagon: boolean }[] = [];
  for (const p of centers.pentagons) {
    allCenters.push({ pos: p, isPentagon: true });
  }
  for (const h of centers.hexagons) {
    allCenters.push({ pos: h, isPentagon: false });
  }

  for (const c of allCenters) {
    const bias = c.isPentagon ? PENTAGON_BIAS : 0;
    const dot = x * c.pos[0] + y * c.pos[1] + z * c.pos[2] + bias;

    if (dot > firstDot) {
      secondDot = firstDot;
      firstDot = dot;
      closestIsPentagon = c.isPentagon;
      closestCenter = c.pos;
    } else if (dot > secondDot) {
      secondDot = dot;
    }
  }

  return { isPentagon: closestIsPentagon, diff: firstDot - secondDot, closestCenter };
}

const BASE_RADIUS = 1.9;
const SEAM_LINE = 0.008;
const SEAM_BEVEL = 0.024;
const SEAM_DEPTH = 0.042;
const PANEL_DOME = 0.015;

function hash2D(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2D(ix, iy);
  const b = hash2D(ix + 1, iy);
  const c = hash2D(ix, iy + 1);
  const d = hash2D(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbmNoise(x: number, y: number, octaves: number = 3): number {
  let value = 0, amplitude = 0.5, frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * smoothNoise(x * frequency, y * frequency);
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
}

// Procedural texture generator helper
function generateTextures(variant: "classic" | "modern") {
  if (typeof document === "undefined") return { map: null, normal: null };

  const W = 512;
  const H = 256;
  const centers = buildBallCenters();

  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = W;
  colorCanvas.height = H;
  const colorCtx = colorCanvas.getContext("2d")!;
  const colorData = colorCtx.createImageData(W, H);

  const normalCanvas = document.createElement("canvas");
  normalCanvas.width = W;
  normalCanvas.height = H;
  const normalCtx = normalCanvas.getContext("2d")!;
  const normalData = normalCtx.createImageData(W, H);

  const heightField = new Float32Array(W * H);

  for (let py = 0; py < H; py++) {
    const v = 1 - py / H;
    const phiAngle = (1 - v) * Math.PI;
    const sinPhi = Math.sin(phiAngle);
    const cosPhi = Math.cos(phiAngle);

    for (let px = 0; px < W; px++) {
      const u = px / W;
      const theta = u * 2 * Math.PI;

      const x = - Math.cos(theta) * sinPhi;
      const y = cosPhi;
      const z = Math.sin(theta) * sinPhi;

      const { isPentagon, diff, closestCenter } = classifyPoint(x, y, z, centers);

      const idx = (py * W + px) * 4;
      const hIdx = py * W + px;

      const grain = fbmNoise(u * 50, v * 25, 3);
      const fineGrain = fbmNoise(u * 120, v * 60, 2);

      let r: number, g: number, b: number;
      let height: number;

      if (variant === "modern") {
        const [cx, cy, cz] = closestCenter;

        let t1x: number, t1y: number, t1z: number;
        if (Math.abs(cx) > 0.9) {
          const len = Math.sqrt(cy * cy + cx * cx);
          t1x = -cy / len;
          t1y = cx / len;
          t1z = 0;
        } else {
          const len = Math.sqrt(cz * cz + cy * cy);
          t1x = 0;
          t1y = -cz / len;
          t1z = cy / len;
        }
        const t2x = cy * t1z - cz * t1y;
        const t2y = cz * t1x - cx * t1z;
        const t2z = cx * t1y - cy * t1x;

        const dx = x * t1x + y * t1y + z * t1z;
        const dy = x * t2x + y * t2y + z * t2z;

        const R = Math.sqrt(dx * dx + dy * dy);
        const localTheta = Math.atan2(dy, dx);

        const N = isPentagon ? 5 : 6;
        const starVal = Math.cos(N * localTheta);
        const starRadius = 0.052 + 0.022 * starVal;
        const outlineWidth = 0.009;

        if (diff < SEAM_LINE) {
          r = 30; g = 32; b = 35;
          height = 0;
        } else if (diff < SEAM_BEVEL) {
          const t = (diff - SEAM_LINE) / (SEAM_BEVEL - SEAM_LINE);
          const smooth = t * t * (3 - 2 * t);
          height = smooth;
          r = 30 + smooth * 225;
          g = 32 + smooth * 223;
          b = 35 + smooth * 220;
        } else {
          height = 1.0;
          const stripeDist = diff - SEAM_BEVEL;
          const isCyanStripe = stripeDist > 0.005 && stripeDist < 0.015;

          if (R < starRadius) {
            const lv = grain * 10 - 5;
            r = Math.max(10, Math.min(255, 30 + lv));
            g = Math.max(10, Math.min(255, 32 + lv));
            b = Math.max(10, Math.min(255, 35 + lv));
            height += (grain - 0.5) * 0.05;
          } else if (R < starRadius + outlineWidth) {
            r = 6; g = 182; b = 212;
            height += 0.02;
          } else if (isCyanStripe) {
            r = 6; g = 182; b = 212;
            height += 0.01;
          } else {
            const lv = grain * 8 - 4;
            const fv = fineGrain * 4 - 2;
            r = Math.max(240, Math.min(255, 255 + lv * 0.3 + fv * 0.2));
            g = Math.max(240, Math.min(255, 255 + lv * 0.3 + fv * 0.2));
            b = Math.max(235, Math.min(255, 252 + lv * 0.2 + fv * 0.1));
            height += (grain - 0.5) * 0.04;
          }
        }
      } else {
        if (diff < SEAM_LINE) {
          r = 40; g = 38; b = 35;
          height = 0;
        } else if (diff < SEAM_BEVEL) {
          const t = (diff - SEAM_LINE) / (SEAM_BEVEL - SEAM_LINE);
          const smooth = t * t * (3 - 2 * t);
          height = smooth;
          if (isPentagon) {
            r = 40 + smooth * (-15);
            g = 38 + smooth * (-16);
            b = 35 + smooth * (-15);
          } else {
            r = 40 + smooth * (210);
            g = 38 + smooth * (208);
            b = 35 + smooth * (205);
          }
        } else {
          height = 1.0;
          if (isPentagon) {
            const lv = grain * 8 - 4;
            const fv = fineGrain * 4 - 2;
            r = Math.max(0, Math.min(255, 25 + lv + fv));
            g = Math.max(0, Math.min(255, 22 + lv * 0.9 + fv));
            b = Math.max(0, Math.min(255, 20 + lv * 0.8 + fv));
            height += (grain - 0.5) * 0.05;
          } else {
            const lv = grain * 10 - 5;
            const fv = fineGrain * 5 - 2.5;
            r = Math.max(200, Math.min(255, 250 + lv * 0.4 + fv * 0.3));
            g = Math.max(200, Math.min(255, 248 + lv * 0.4 + fv * 0.3));
            b = Math.max(195, Math.min(255, 243 + lv * 0.3 + fv * 0.2));
            height += (grain - 0.5) * 0.04;
          }
        }
      }

      colorData.data[idx] = r;
      colorData.data[idx + 1] = g;
      colorData.data[idx + 2] = b;
      colorData.data[idx + 3] = 255;

      heightField[hIdx] = height;
    }
  }

  for (let py = 0; py < H; py++) {
    const v = 1 - py / H;
    const phiAngle = (1 - v) * Math.PI;
    const sinPhi = Math.sin(phiAngle);

    for (let px = 0; px < W; px++) {
      const idx = (py * W + px) * 4;
      const l = heightField[py * W + ((px - 1 + W) % W)];
      const r = heightField[py * W + ((px + 1) % W)];
      const uVal = heightField[((py - 1 + H) % H) * W + px];
      const d = heightField[((py + 1) % H) * W + px];

      const strength = 3.0;
      const dx = ((l - r) * strength) / Math.max(0.1, sinPhi);
      const dy = (uVal - d) * strength;

      const fade = py < 4 || py > H - 5 ? 0 : 1;
      const nx = dx * fade;
      const ny = dy * fade;

      const len = Math.sqrt(nx * nx + ny * ny + 1);

      normalData.data[idx] = Math.max(0, Math.min(255, ((nx / len) * 0.5 + 0.5) * 255));
      normalData.data[idx + 1] = Math.max(0, Math.min(255, ((ny / len) * 0.5 + 0.5) * 255));
      normalData.data[idx + 2] = Math.max(0, Math.min(255, ((1 / len) * 0.5 + 0.5) * 255));
      normalData.data[idx + 3] = 255;
    }
  }

  colorCtx.putImageData(colorData, 0, 0);
  normalCtx.putImageData(normalData, 0, 0);

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.needsUpdate = true;

  const normal = new THREE.CanvasTexture(normalCanvas);
  normal.needsUpdate = true;

  return { map, normal };
}

// Cache generated textures globally so they persist across component unmounts/remounts
let cachedClassicTextures: { map: THREE.CanvasTexture | null; normal: THREE.CanvasTexture | null } | null = null;
let cachedModernTextures: { map: THREE.CanvasTexture | null; normal: THREE.CanvasTexture | null } | null = null;

function getClassicTextures() {
  if (!cachedClassicTextures) {
    cachedClassicTextures = generateTextures("classic");
  }
  return cachedClassicTextures;
}

function getModernTextures() {
  if (!cachedModernTextures) {
    cachedModernTextures = generateTextures("modern");
  }
  return cachedModernTextures;
}

// 3D Ball Mesh Component
function Ball({
  physicsObj,
  mapTexture,
  normalTexture,
}: {
  physicsObj: { rotationX: number; rotationY: number; rotationZ: number; wobble?: number };
  mapTexture: THREE.CanvasTexture | null;
  normalTexture: THREE.CanvasTexture | null;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = physicsObj.rotationX;
      meshRef.current.rotation.y = physicsObj.rotationY;
      meshRef.current.rotation.z = physicsObj.rotationZ;
      const s = 1 + (physicsObj.wobble || 0);
      meshRef.current.scale.set(s, s, s);
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(BASE_RADIUS, 200, 150);
    const centers = buildBallCenters();
    const posAttr = geo.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < posAttr.count; i++) {
      v.fromBufferAttribute(posAttr, i);
      v.normalize();

      const { isPentagon: _isPentagon, diff } = classifyPoint(v.x, v.y, v.z, centers);
      void _isPentagon;

      let radiusScale: number;
      if (diff < SEAM_LINE) {
        radiusScale = 1 - SEAM_DEPTH;
      } else if (diff < SEAM_BEVEL) {
        const t = (diff - SEAM_LINE) / (SEAM_BEVEL - SEAM_LINE);
        const smooth = t * t * (3 - 2 * t);
        radiusScale = 1 - SEAM_DEPTH + smooth * (SEAM_DEPTH - PANEL_DOME);
      } else {
        const maxDiff = 0.2054;
        const t = Math.min(1.0, (diff - SEAM_BEVEL) / (maxDiff - SEAM_BEVEL));
        const bulge = (1.0 - Math.pow(1.0 - t, 2)) * PANEL_DOME;
        radiusScale = 1 - PANEL_DOME + bulge;
      }

      v.multiplyScalar(BASE_RADIUS * radiusScale);
      posAttr.setXYZ(i, v.x, v.y, v.z);
    }

    posAttr.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      {mapTexture ? (
        <meshPhysicalMaterial
          map={mapTexture}
          normalMap={normalTexture}
          normalScale={new THREE.Vector2(0.35, 0.35)}
          roughness={0.22}
          metalness={0.0}
          clearcoat={0.8}
          clearcoatRoughness={0.12}
          envMapIntensity={1.0}
        />
      ) : (
        <meshStandardMaterial color="#f3f4f6" roughness={0.35} />
      )}
    </mesh>
  );
}

// Main InteractiveFootball Manager Component
export function InteractiveFootball() {
  const containerLeftRef = useRef<HTMLDivElement>(null);
  const containerRightRef = useRef<HTMLDivElement>(null);

  const [leftPos, setLeftPos] = useState({ x: 0, y: 0 });
  const [rightPos, setRightPos] = useState({ x: 0, y: 0 });

  const [isLeftDragging, setIsLeftDragging] = useState(false);
  const [isRightDragging, setIsRightDragging] = useState(false);

  const leftSize = 144;
  const rightSize = 192;  // Single unified physics state for both balls to handle real-time collision detection
  const physicsRef = useRef({
    left: {
      x: 0, y: 0, vx: 0, vy: 0,
      rotationX: 0.2, rotationY: -0.5, rotationZ: 0,
      isDragging: false, lastMouseX: 0, lastMouseY: 0, lastTime: 0,
      size: leftSize,
      mass: 1.2,
      wobble: 0,
      wobbleVelocity: 0,
    },
    right: {
      x: 0, y: 0, vx: 0, vy: 0,
      rotationX: 0.2, rotationY: 0.5, rotationZ: 0,
      isDragging: false, lastMouseX: 0, lastMouseY: 0, lastTime: 0,
      size: rightSize,
      mass: 1.8,
      wobble: 0,
      wobbleVelocity: 0,
    }
  });

  const getHomePosition = (side: "left" | "right", width: number, height: number) => {
    const size = side === "left" ? leftSize : rightSize;
    if (side === "left") {
      return {
        x: width * 0.14 - size / 2,
        y: height * 0.62 - size / 2,
      };
    }
    return {
      x: width * 0.76 - size / 2,
      y: height * 0.35 - size / 2,
    };
  };

  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const homeLeft = getHomePosition("left", w, h);
    setLeftPos(homeLeft);
    physicsRef.current.left.x = homeLeft.x;
    physicsRef.current.left.y = homeLeft.y;

    const homeRight = getHomePosition("right", w, h);
    setRightPos(homeRight);
    physicsRef.current.right.x = homeRight.x;
    physicsRef.current.right.y = homeRight.y;
  }, []);

  // Pre-generate textures for both variants (cached globally to avoid freezing UI on page navigation)
  const classicTextures = useMemo(() => getClassicTextures(), []);
  const modernTextures = useMemo(() => getModernTextures(), []);

  interface CollisionInstance {
    id: number;
    x: number;
    y: number;
    intensity: number;
  }

  const [collisions, setCollisions] = useState<CollisionInstance[]>([]);

  const triggerCollisionEffect = (x: number, y: number, intensity: number) => {
    const id = Date.now() + Math.random();
    const cappedIntensity = Math.min(2, Math.max(0.4, intensity));

    setCollisions(prev => [...prev, { id, x, y, intensity: cappedIntensity }]);
    setTimeout(() => {
      setCollisions(prev => prev.filter(c => c.id !== id));
    }, 400);
  };

  const triggerRef = useRef(triggerCollisionEffect);
  useEffect(() => {
    triggerRef.current = triggerCollisionEffect;
  });

  // Physics animation tick
  useEffect(() => {
    let animationFrameId: number;
    const tick = () => {
      const state = physicsRef.current;
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      const isLg = cw >= 1024; // Left ball is only active/visible on large screens

      const bounce = -0.55;

      // 1. Update velocities and positions for Right Ball (Classic)
      if (!state.right.isDragging) {
        const homeRight = getHomePosition("right", cw, ch);
        const time = performance.now() * 0.00001;
        const floatX = Math.cos(time * 0.6) * 8;
        const floatY = Math.sin(time * 0.4) * 12;
        const targetX = homeRight.x + floatX;
        const targetY = homeRight.y + floatY;

        state.right.x += state.right.vx;
        state.right.y += state.right.vy;
        state.right.vx *= 0.972;
        state.right.vy *= 0.972;

        const dx = targetX - state.right.x;
        const dy = targetY - state.right.y;
        state.right.vx += dx * 0.0035;
        state.right.vy += dy * 0.0035;

        state.right.rotationY += state.right.vx * 0.005 + 0.0015;
        state.right.rotationX += -state.right.vy * 0.005 + 0.0008;

        const maxX = cw - state.right.size;
        const maxY = ch - state.right.size;

        if (state.right.x < 0) {
          state.right.x = 0;
          const impact = Math.abs(state.right.vx);
          state.right.vx *= bounce;
          state.right.rotationZ -= state.right.vy * 0.05;
          if (impact > 2) {
            state.right.wobble = -Math.min(0.08, impact * 0.005);
            state.right.wobbleVelocity = state.right.wobble * 0.2;
          }
        }
        else if (state.right.x > maxX) {
          state.right.x = maxX;
          const impact = Math.abs(state.right.vx);
          state.right.vx *= bounce;
          state.right.rotationZ += state.right.vy * 0.05;
          if (impact > 2) {
            state.right.wobble = -Math.min(0.08, impact * 0.005);
            state.right.wobbleVelocity = state.right.wobble * 0.2;
          }
        }
        if (state.right.y < 0) {
          state.right.y = 0;
          const impact = Math.abs(state.right.vy);
          state.right.vy *= bounce;
          state.right.rotationZ += state.right.vx * 0.05;
          if (impact > 2) {
            state.right.wobble = -Math.min(0.08, impact * 0.005);
            state.right.wobbleVelocity = state.right.wobble * 0.2;
          }
        }
        else if (state.right.y > maxY) {
          state.right.y = maxY;
          const impact = Math.abs(state.right.vy);
          state.right.vy *= bounce;
          state.right.rotationZ -= state.right.vx * 0.05;
          if (impact > 2) {
            state.right.wobble = -Math.min(0.08, impact * 0.005);
            state.right.wobbleVelocity = state.right.wobble * 0.2;
          }
        }
      }

      // 2. Update velocities and positions for Left Ball (Modern)
      if (isLg && !state.left.isDragging) {
        const homeLeft = getHomePosition("left", cw, ch);
        const time = performance.now() * 0.001;
        const floatX = Math.sin(time * 0.7) * 6;
        const floatY = Math.cos(time * 0.5) * 10;
        const targetX = homeLeft.x + floatX;
        const targetY = homeLeft.y + floatY;

        state.left.x += state.left.vx;
        state.left.y += state.left.vy;
        state.left.vx *= 0.972;
        state.left.vy *= 0.972;

        const dx = targetX - state.left.x;
        const dy = targetY - state.left.y;
        state.left.vx += dx * 0.0035;
        state.left.vy += dy * 0.0035;

        state.left.rotationY += state.left.vx * 0.005 + 0.002;
        state.left.rotationX += -state.left.vy * 0.005 + 0.001;

        const maxX = cw - state.left.size;
        const maxY = ch - state.left.size;

        if (state.left.x < 0) {
          state.left.x = 0;
          const impact = Math.abs(state.left.vx);
          state.left.vx *= bounce;
          state.left.rotationZ -= state.left.vy * 0.05;
          if (impact > 2) {
            state.left.wobble = -Math.min(0.08, impact * 0.005);
            state.left.wobbleVelocity = state.left.wobble * 0.2;
          }
        }
        else if (state.left.x > maxX) {
          state.left.x = maxX;
          const impact = Math.abs(state.left.vx);
          state.left.vx *= bounce;
          state.left.rotationZ += state.left.vy * 0.05;
          if (impact > 2) {
            state.left.wobble = -Math.min(0.08, impact * 0.005);
            state.left.wobbleVelocity = state.left.wobble * 0.2;
          }
        }
        if (state.left.y < 0) {
          state.left.y = 0;
          const impact = Math.abs(state.left.vy);
          state.left.vy *= bounce;
          state.left.rotationZ += state.left.vx * 0.05;
          if (impact > 2) {
            state.left.wobble = -Math.min(0.08, impact * 0.005);
            state.left.wobbleVelocity = state.left.wobble * 0.2;
          }
        }
        else if (state.left.y > maxY) {
          state.left.y = maxY;
          const impact = Math.abs(state.left.vy);
          state.left.vy *= bounce;
          state.left.rotationZ -= state.left.vx * 0.05;
          if (impact > 2) {
            state.left.wobble = -Math.min(0.08, impact * 0.005);
            state.left.wobbleVelocity = state.left.wobble * 0.2;
          }
        }
      }

      // 3. 2D Elastic Collision Detection & Resolution
      if (isLg) {
        const r1 = state.left.size / 2;
        const r2 = state.right.size / 2;
        const c1x = state.left.x + r1;
        const c1y = state.left.y + r1;
        const c2x = state.right.x + r2;
        const c2y = state.right.y + r2;

        const dx = c2x - c1x;
        const dy = c2y - c1y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = r1 + r2;

        if (dist < minDist && dist > 0.5) {
          const nx = dx / dist;
          const ny = dy / dist;

          // A. Overlap Resolution (Push them apart along collision normal)
          const overlap = minDist - dist;
          const totalMass = state.left.mass + state.right.mass;

          if (!state.left.isDragging && !state.right.isDragging) {
            state.left.x -= nx * overlap * (state.right.mass / totalMass);
            state.left.y -= ny * overlap * (state.right.mass / totalMass);
            state.right.x += nx * overlap * (state.left.mass / totalMass);
            state.right.y += ny * overlap * (state.left.mass / totalMass);
          } else if (state.left.isDragging && !state.right.isDragging) {
            state.right.x += nx * overlap;
            state.right.y += ny * overlap;
          } else if (state.right.isDragging && !state.left.isDragging) {
            state.left.x -= nx * overlap;
            state.left.y -= ny * overlap;
          }

          // B. Elastic Velocity Resolution
          const rvx = state.right.vx - state.left.vx;
          const rvy = state.right.vy - state.left.vy;
          const velAlongNormal = rvx * nx + rvy * ny;

          if (velAlongNormal < 0) {
            const restitution = 0.85; // highly elastic soccer ball rebound
            const impulseScalar = -(1 + restitution) * velAlongNormal / (1 / state.left.mass + 1 / state.right.mass);

            if (!state.left.isDragging) {
              state.left.vx -= (impulseScalar / state.left.mass) * nx;
              state.left.vy -= (impulseScalar / state.left.mass) * ny;
            }
            if (!state.right.isDragging) {
              state.right.vx += (impulseScalar / state.right.mass) * nx;
              state.right.vy += (impulseScalar / state.right.mass) * ny;
            }

            // C. Spin Transfer
            const tx = -ny;
            const ty = nx;
            const velAlongTangent = rvx * tx + rvy * ty;

            if (!state.left.isDragging) {
              state.left.rotationY += velAlongTangent * 0.008;
              state.left.rotationX -= velAlongTangent * 0.008;
            }
            if (!state.right.isDragging) {
              state.right.rotationY -= velAlongTangent * 0.008;
              state.right.rotationX += velAlongTangent * 0.008;
            }

            // D. Collision Wobble & Pressure Ring (Optimized and Toned Down)
            const impactVelocity = Math.abs(velAlongNormal);
            const wobbleMagnitude = Math.min(0.08, impactVelocity * 0.006);

            state.left.wobble = -wobbleMagnitude;
            state.left.wobbleVelocity = -wobbleMagnitude * 0.3;

            state.right.wobble = -wobbleMagnitude * 0.8;
            state.right.wobbleVelocity = -wobbleMagnitude * 0.2;

            // Trigger contact ripple (no sparks, short 350ms pressure wave)
            const contactX = c1x + nx * r1;
            const contactY = c1y + ny * r1;
            triggerRef.current(contactX, contactY, impactVelocity);
          }
        }
      }

      // Update wobble spring physics
      const leftWobbleForce = -0.15 * state.left.wobble - 0.08 * state.left.wobbleVelocity;
      state.left.wobbleVelocity += leftWobbleForce;
      state.left.wobble += state.left.wobbleVelocity;
      state.left.wobbleVelocity *= 0.92;

      const rightWobbleForce = -0.15 * state.right.wobble - 0.08 * state.right.wobbleVelocity;
      state.right.wobbleVelocity += rightWobbleForce;
      state.right.wobble += state.right.wobbleVelocity;
      state.right.wobbleVelocity *= 0.92;

      // 4. Propagate positions to React state
      setRightPos({ x: state.right.x, y: state.right.y });
      if (isLg) {
        setLeftPos({ x: state.left.x, y: state.left.y });
      }

      animationFrameId = requestAnimationFrame(tick);
    };
    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleStart = (side: "left" | "right", clientX: number, clientY: number) => {
    const state = physicsRef.current[side];
    state.isDragging = true;
    state.vx = 0; state.vy = 0;
    state.lastMouseX = clientX;
    state.lastMouseY = clientY;
    state.lastTime = performance.now();
    if (side === "left") setIsLeftDragging(true);
    else setIsRightDragging(true);
  };

  const handleMove = (side: "left" | "right", clientX: number, clientY: number) => {
    const state = physicsRef.current[side];
    if (!state.isDragging) return;
    const dx = clientX - state.lastMouseX;
    const dy = clientY - state.lastMouseY;
    const now = performance.now();
    const dt = Math.max(1, now - state.lastTime);

    state.vx = (dx / dt) * 16.6;
    state.vy = (dy / dt) * 16.6;
    const speedLimit = 25;
    const speed = Math.sqrt(state.vx * state.vx + state.vy * state.vy);
    if (speed > speedLimit) { state.vx = (state.vx / speed) * speedLimit; state.vy = (state.vy / speed) * speedLimit; }

    state.x += dx; state.y += dy;
    state.rotationY += dx * 0.007;
    state.rotationX += dy * 0.007;
    state.lastMouseX = clientX;
    state.lastMouseY = clientY;
    state.lastTime = now;
    if (side === "left") setLeftPos({ x: state.x, y: state.y });
    else setRightPos({ x: state.x, y: state.y });
  };

  const handleEnd = (side: "left" | "right") => {
    physicsRef.current[side].isDragging = false;
    if (side === "left") setIsLeftDragging(false);
    else setIsRightDragging(false);
  };

  // Drag listeners for Left Ball
  useEffect(() => {
    if (!isLeftDragging) return;
    const onMouseMove = (e: MouseEvent) => handleMove("left", e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => { if (e.touches.length > 0) handleMove("left", e.touches[0].clientX, e.touches[0].clientY); };
    const onUp = () => handleEnd("left");

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [isLeftDragging]);

  // Drag listeners for Right Ball
  useEffect(() => {
    if (!isRightDragging) return;
    const onMouseMove = (e: MouseEvent) => handleMove("right", e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => { if (e.touches.length > 0) handleMove("right", e.touches[0].clientX, e.touches[0].clientY); };
    const onUp = () => handleEnd("right");

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [isRightDragging]);

  const onMouseDownLeft = (e: React.MouseEvent) => { e.preventDefault(); handleStart("left", e.clientX, e.clientY); };
  const onTouchStartLeft = (e: React.TouchEvent) => { if (e.touches.length > 0) handleStart("left", e.touches[0].clientX, e.touches[0].clientY); };

  const onMouseDownRight = (e: React.MouseEvent) => { e.preventDefault(); handleStart("right", e.clientX, e.clientY); };
  const onTouchStartRight = (e: React.TouchEvent) => { if (e.touches.length > 0) handleStart("right", e.touches[0].clientX, e.touches[0].clientY); };

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    const speed = 8;
    const ball = physicsRef.current.right;
    switch (e.key) {
      case "ArrowUp": ball.vy = -speed; e.preventDefault(); break;
      case "ArrowDown": ball.vy = speed; e.preventDefault(); break;
      case "ArrowLeft": ball.vx = -speed; e.preventDefault(); break;
      case "ArrowRight": ball.vx = speed; e.preventDefault(); break;
      case " ": ball.vx = -ball.vx * 2; ball.vy = -ball.vy * 2; e.preventDefault(); break;
    }
  }, []);

  return (
    <div tabIndex={0} onKeyDown={onKeyDown} className="outline-none" role="application" aria-label="Interactive football game. Use arrow keys to move the ball.">
      {/* Collision Pressure Ring Layer */}
      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
        {collisions.map(c => {
          const size = 15 + c.intensity * 40;
          return (
            <div
              key={c.id}
              className="collision-wave"
              style={{
                left: `${c.x}px`,
                top: `${c.y}px`,
                width: `${size}px`,
                height: `${size}px`,
              }}
            />
          );
        })}
      </div>

      {/* 1. Left Ball (Modern Graphic, 144px) - Visible only on large screens */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden hidden lg:block">
        <div
          ref={containerLeftRef}
          className="absolute cursor-grab active:cursor-grabbing pointer-events-auto select-none rounded-full"
          style={{ transform: `translate3d(${leftPos.x}px, ${leftPos.y}px, 0)`, width: `${leftSize}px`, height: `${leftSize}px`, transition: "none" }}
          onMouseDown={onMouseDownLeft}
          onTouchStart={onTouchStartLeft}
        >
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-pitch-green-500/15 blur-md pointer-events-none w-24 h-4" />

          <Canvas
            camera={{ position: [0, 0, 4.5], fov: 50 }}
            style={{ width: "100%", height: "100%", background: "transparent" }}
            gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
          >
            <ambientLight intensity={0.45} color="#f0f0f0" />
            <directionalLight position={[3, 5, 4]} intensity={2.0} color="#fff8ee" castShadow />
            <directionalLight position={[-4, 1, 2]} intensity={0.4} color="#d0dff0" />
            <directionalLight position={[-1, -1, -4]} intensity={0.6} color="#ffffff" />
            <pointLight position={[0, -3, 2]} intensity={0.2} color="#10b981" distance={8} />

            <Ball physicsObj={physicsRef.current.left} mapTexture={modernTextures.map} normalTexture={modernTextures.normal} />
          </Canvas>
        </div>
      </div>

      {/* 2. Right Ball (Classic Panel, 192px) - Visible on all screens */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        <div
          ref={containerRightRef}
          className="absolute cursor-grab active:cursor-grabbing pointer-events-auto select-none rounded-full"
          style={{ transform: `translate3d(${rightPos.x}px, ${rightPos.y}px, 0)`, width: `${rightSize}px`, height: `${rightSize}px`, transition: "none" }}
          onMouseDown={onMouseDownRight}
          onTouchStart={onTouchStartRight}
        >
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-pitch-green-500/15 blur-md pointer-events-none w-32 h-6" />

          <Canvas
            camera={{ position: [0, 0, 4.5], fov: 50 }}
            style={{ width: "100%", height: "100%", background: "transparent" }}
            gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
          >
            <ambientLight intensity={0.45} color="#f0f0f0" />
            <directionalLight position={[3, 5, 4]} intensity={2.0} color="#fff8ee" castShadow />
            <directionalLight position={[-4, 1, 2]} intensity={0.4} color="#d0dff0" />
            <directionalLight position={[-1, -1, -4]} intensity={0.6} color="#ffffff" />
            <pointLight position={[0, -3, 2]} intensity={0.2} color="#10b981" distance={8} />

            <Ball physicsObj={physicsRef.current.right} mapTexture={classicTextures.map} normalTexture={classicTextures.normal} />
          </Canvas>
        </div>
      </div>
    </div>
  );
}