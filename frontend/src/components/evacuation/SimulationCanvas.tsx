import { useRef, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

const S = 0.5;
const MAX_AGENTS = 500;
const MAX_FIRES = 200;
const GW = 80;
const GH = 60;

interface Agent { x: number; y: number; evacuated: boolean }
interface Responder { id: number; sector: number[] }
interface State {
  width: number; height: number; agents: Agent[];
  fires: [number, number][]; obstacles: [number, number][];
  responders: Responder[]; tick: number;
  running?: boolean;
  complete?: boolean;
  evacuated?: number;
  total_agents?: number;
}

interface Props {
  state: State | null;
  mode: "fire" | "obstacle" | null;
  onCellClick: (row: number, col: number) => void;
  cameraPreset: string;
  lightingMode: "matchday" | "night" | "emergency";
  weather: "clear" | "rain";
  heatmapEnabled: boolean;
}

/* ═══════ FIELD ═══════ */
function Field({ weather }: { weather: "clear" | "rain" }) {
  const fw = 30 * S;
  const fh = 20 * S;

  const grassTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Base dark lawn green
    ctx.fillStyle = "#166534";
    ctx.fillRect(0, 0, 256, 256);

    // Draw 15,000 fine grass blades/turf noise
    for (let i = 0; i < 15000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const w = 1 + Math.random() * 1.5;
      const h = 2 + Math.random() * 3.5;

      const r = Math.random();
      if (r < 0.35) {
        ctx.fillStyle = "#14532d"; // Dark grass blade shadow
      } else if (r < 0.7) {
        ctx.fillStyle = "#15803d"; // Standard green blade
      } else {
        ctx.fillStyle = "#22c55e"; // Bright highlighted blade
      }
      ctx.fillRect(x, y, w, h);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(18, 12); // High density tiling
    return texture;
  }, []);

  const isRain = weather === "rain";

  return (
    <group position={[GW * S / 2, 0.01, GH * S / 2]}>
      {/* grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[fw, fh]} />
        <meshStandardMaterial
          map={grassTexture || undefined}
          bumpMap={grassTexture || undefined}
          bumpScale={0.012}
          roughness={isRain ? 0.22 : 0.8}
          metalness={isRain ? 0.45 : 0.05}
          color={isRain ? "#4b5366" : "#ffffff"}
        />
      </mesh>

      {/* mow stripes */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-fw / 2 + (i * 1.25 + 0.6), 0.001, 0]}>
          <planeGeometry args={[1, fh]} />
          <meshStandardMaterial
            color={isRain ? "#0f172a" : "#15803d"}
            roughness={isRain ? 0.22 : 0.85}
            transparent
            opacity={isRain ? 0.35 : 0.25}
          />
        </mesh>
      ))}

      {/* white lines */}
      {/* boundary */}
      <Line pos={[0, -fh / 2]} len={fw} ax="x" />
      <Line pos={[0, fh / 2]} len={fw} ax="x" />
      <Line pos={[-fw / 2, 0]} len={fh} ax="z" />
      <Line pos={[fw / 2, 0]} len={fh} ax="z" />
      {/* center line */}
      <Line pos={[0, 0]} len={fh} ax="z" />
      {/* center circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 1.85, 48]} />
        <meshBasicMaterial color="white" />
      </mesh>
      {/* center spot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.06, 12]} />
        <meshBasicMaterial color="white" />
      </mesh>
      {/* penalty areas */}
      <PenaltyBox side="left" w={3.3} h={7} />
      <PenaltyBox side="right" w={3.3} h={7} />
      {/* goal areas */}
      <PenaltyBox side="left" w={1.1} h={3.5} />
      <PenaltyBox side="right" w={1.1} h={3.5} />
      {/* penalty spots */}
      <Spot pos={[-fw / 2 + 2.2, 0]} />
      <Spot pos={[fw / 2 - 2.2, 0]} />

      {/* goals */}
      <Goal x={-fw / 2} />
      <Goal x={fw / 2} flip />
    </group>
  );
}

function Line({ pos, len, ax }: { pos: [number, number]; len: number; ax: "x" | "z" }) {
  const rot: [number, number, number] = ax === "x" ? [-Math.PI / 2, 0, 0] : [-Math.PI / 2, 0, Math.PI / 2];
  return (
    <mesh rotation={rot} position={[pos[0], 0.003, pos[1]]}>
      <planeGeometry args={[len, 0.04]} />
      <meshBasicMaterial color="white" />
    </mesh>
  );
}

function PenaltyBox({ side, w, h }: { side: "left" | "right"; w: number; h: number }) {
  const fw = 30 * S;
  const goalX = side === "left" ? -fw / 2 : fw / 2;
  const innerX = side === "left" ? -fw / 2 + w : fw / 2 - w;

  return (
    <group position={[0, 0.002, 0]}>
      {/* Vertical inner line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[innerX, 0, 0]}>
        <planeGeometry args={[0.04, h]} />
        <meshBasicMaterial color="white" />
      </mesh>
      {/* Top horizontal line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(goalX + innerX) / 2, 0, -h / 2]}>
        <planeGeometry args={[w, 0.04]} />
        <meshBasicMaterial color="white" />
      </mesh>
      {/* Bottom horizontal line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(goalX + innerX) / 2, 0, h / 2]}>
        <planeGeometry args={[w, 0.04]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  );
}

function Spot({ pos }: { pos: [number, number] }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[pos[0], 0.003, pos[1]]}>
      <circleGeometry args={[0.06, 12]} />
      <meshBasicMaterial color="white" />
    </mesh>
  );
}

function Goal({ x, flip }: { x: number; flip?: boolean }) {
  const dir = flip ? -1 : 1;
  return (
    <group position={[x, 0, 0]}>
      {/* posts */}
      <mesh position={[0, 0.4, -1.2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, 0.4, 1.2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* crossbar */}
      <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 2.4, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* goal netting */}
      <mesh position={[dir * 0.25, 0.4, 0]}>
        <boxGeometry args={[0.5, 0.8, 2.4]} />
        <meshStandardMaterial color="#ffffff" wireframe transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

/* ═══════ STANDS ═══════ */
const TIER_COLORS = ["#475569", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"];
const TIER_HEIGHTS = [0.35, 0.8, 1.35, 2.0, 2.8];
const GATE_H = [35, 44];
const GATE_V = [25, 34];

function StandSide({ side }: { side: "top" | "bottom" | "left" | "right" }) {
  return (
    <group>
      {TIER_COLORS.map((color, i) => {
        const h = TIER_HEIGHTS[i];
        if (side === "top" || side === "bottom") {
          const row = side === "top" ? 4 - i : 55 + i;
          const z = row * S + S / 2;
          const lx = ((5 + GATE_H[0] - 1) / 2) * S;
          const lw = (GATE_H[0] - 5) * S;
          const rx = ((GATE_H[1] + 1 + 74) / 2) * S;
          const rw = (74 - GATE_H[1]) * S;
          return (
            <group key={i}>
              <mesh position={[lx, h / 2, z]}>
                <boxGeometry args={[lw, h, S * 0.95]} />
                <meshStandardMaterial color={color} roughness={0.85} />
              </mesh>
              <mesh position={[rx, h / 2, z]}>
                <boxGeometry args={[rw, h, S * 0.95]} />
                <meshStandardMaterial color={color} roughness={0.85} />
              </mesh>
            </group>
          );
        }
        const col = side === "left" ? 4 - i : 75 + i;
        const x = col * S + S / 2;
        const tz = ((5 + GATE_V[0] - 1) / 2) * S;
        const td = (GATE_V[0] - 5) * S;
        const bz = ((GATE_V[1] + 1 + 54) / 2) * S;
        const bd = (54 - GATE_V[1]) * S;
        return (
          <group key={i}>
            <mesh position={[x, h / 2, tz]}>
              <boxGeometry args={[S * 0.95, h, td]} />
              <meshStandardMaterial color={color} roughness={0.85} />
            </mesh>
            <mesh position={[x, h / 2, bz]}>
              <boxGeometry args={[S * 0.95, h, bd]} />
              <meshStandardMaterial color={color} roughness={0.85} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ═══════ GATE GLOWS ═══════ */
function GateGlows() {
  const gates = [
    { pos: [GW * S / 2, 0.05, -0.1], size: [(GATE_H[1] - GATE_H[0] + 1) * S, 0.1, 0.3] },
    { pos: [GW * S / 2, 0.05, GH * S + 0.1], size: [(GATE_H[1] - GATE_H[0] + 1) * S, 0.1, 0.3] },
    { pos: [-0.1, 0.05, GH * S / 2], size: [0.3, 0.1, (GATE_V[1] - GATE_V[0] + 1) * S] },
    { pos: [GW * S + 0.1, 0.05, GH * S / 2], size: [0.3, 0.1, (GATE_V[1] - GATE_V[0] + 1) * S] },
  ];
  return (
    <>
      {gates.map((g, i) => (
        <mesh key={i} position={g.pos as [number, number, number]}>
          <boxGeometry args={g.size as [number, number, number]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.2} toneMapped={false} transparent opacity={0.7} />
        </mesh>
      ))}
    </>
  );
}

/* ═══════ FLOODLIGHTS ═══════ */
function FloodlightPole({ position, running, complete, lightingMode }: { position: [number, number]; running: boolean; complete: boolean; lightingMode: "matchday" | "night" | "emergency" }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    let color = "#fef9c3"; // gold/white
    let intensity = 180; // stadium floodlight power level
    let emissionFactor = 1.0;

    if (lightingMode === "night") {
      color = "#f59e0b"; // warm amber
      intensity = 130;
      emissionFactor = 0.8;
    } else if (lightingMode === "emergency" || (running && !complete)) {
      // Flash red
      const flash = Math.sin(t * 6) > 0;
      color = "#ef4444";
      intensity = flash ? 200 : 40;
      emissionFactor = flash ? 1.5 : 0.2;
    }

    if (lightRef.current) {
      lightRef.current.color.set(color);
      lightRef.current.intensity = intensity;
    }
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.color.set(color);
      mat.emissive.set(color);
      mat.emissiveIntensity = emissionFactor;
    }
  });

  return (
    <group position={[position[0], 0, position[1]]}>
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.06, 0.1, 8, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh ref={meshRef} position={[0, 8.1, 0]}>
        <boxGeometry args={[1, 0.25, 0.6]} />
        <meshStandardMaterial color="#fef9c3" emissive="#fef9c3" emissiveIntensity={0.6} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 8, 0]} color="#fef9c3" intensity={180} distance={45} decay={1.5} />
    </group>
  );
}

function Floodlights({ running, complete, lightingMode }: { running: boolean; complete: boolean; lightingMode: "matchday" | "night" | "emergency" }) {
  const poles: [number, number][] = [
    [3 * S, 3 * S],
    [3 * S, (GH - 3) * S],
    [(GW - 3) * S, 3 * S],
    [(GW - 3) * S, (GH - 3) * S],
  ];
  return (
    <>
      {poles.map((p, i) => (
        <FloodlightPole key={i} position={p} running={running} complete={complete} lightingMode={lightingMode} />
      ))}
    </>
  );
}

/* ═══════ CONCOURSE ═══════ */
function Concourse() {
  return (
    <group>
      {/* top concourse */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[GW * S / 2, 0.005, 2.5]}>
        <planeGeometry args={[70 * S, 10 * S]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
      {/* bottom concourse */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[GW * S / 2, 0.005, (GH - 5) * S + 2.5]}>
        <planeGeometry args={[70 * S, 10 * S]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
      {/* left concourse */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.5, 0.005, GH * S / 2]}>
        <planeGeometry args={[10 * S, 40 * S]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
      {/* right concourse */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(GW - 5) * S + 2.5, 0.005, GH * S / 2]}>
        <planeGeometry args={[10 * S, 40 * S]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ═══════ LED AD BOARDS ═══════ */
function AdBoards() {
  const fw = 30 * S;
  const fh = 20 * S;

  return (
    <group position={[GW * S / 2, 0, GH * S / 2]}>
      {/* Top Ad board */}
      <AdBoardSegment position={[0, 0.22, -fh / 2 - 0.6]} width={fw + 1} rotation={[0, 0, 0]} sponsorText="SPECTRA STADIUM   •   GEMINI AI   •   FIFA PARTNER" />
      {/* Bottom Ad board */}
      <AdBoardSegment position={[0, 0.22, fh / 2 + 0.6]} width={fw + 1} rotation={[0, Math.PI, 0]} sponsorText="SAFE EVACUATION   •   AI RESPONDERS   •   SPECTRA STADIUM" />
      {/* Left Top Ad board */}
      <AdBoardSegment position={[-fw / 2 - 0.6, 0.22, -fh / 4 - 0.6]} width={fh / 2 - 1} rotation={[0, Math.PI / 2, 0]} sponsorText="FIFA" />
      {/* Left Bottom Ad board */}
      <AdBoardSegment position={[-fw / 2 - 0.6, 0.22, fh / 4 + 0.6]} width={fh / 2 - 1} rotation={[0, Math.PI / 2, 0]} sponsorText="EMERGENCY" />
      {/* Right Top Ad board */}
      <AdBoardSegment position={[fw / 2 + 0.6, 0.22, -fh / 4 - 0.6]} width={fh / 2 - 1} rotation={[0, -Math.PI / 2, 0]} sponsorText="GEMINI" />
      {/* Right Bottom Ad board */}
      <AdBoardSegment position={[fw / 2 + 0.6, 0.22, fh / 4 + 0.6]} width={fh / 2 - 1} rotation={[0, -Math.PI / 2, 0]} sponsorText="SPECTRA" />
    </group>
  );
}

function AdBoardSegment({ position, width, rotation, sponsorText }: { position: [number, number, number]; width: number; rotation: [number, number, number]; sponsorText: string }) {
  return (
    <group position={position} rotation={rotation}>
      {/* The physical board board */}
      <mesh>
        <boxGeometry args={[width, 0.44, 0.1]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Glowing LED display face */}
      <mesh position={[0, 0, 0.051]}>
        <planeGeometry args={[width - 0.05, 0.38]} />
        <meshBasicMaterial color="#020617" />
      </mesh>
      {/* Text banner */}
      <Text
        position={[0, 0, 0.053]}
        fontSize={0.22}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {sponsorText}
      </Text>
    </group>
  );
}

/* ═══════ DUGOUTS ═══════ */
function Dugouts() {
  const fh = 20 * S;
  const zPos = GH * S / 2 + fh / 2 + 1.2;
  const xLeft = GW * S / 2 - 3.5;
  const xRight = GW * S / 2 + 3.5;

  return (
    <group>
      <Dugout position={[xLeft, 0, zPos]} color="#2563eb" />
      <Dugout position={[xRight, 0, zPos]} color="#dc2626" />
    </group>
  );
}

function Dugout({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      {/* Shelter canopy */}
      <mesh position={[0, 0.45, 0.2]}>
        <boxGeometry args={[2.0, 0.9, 0.8]} />
        <meshStandardMaterial color="#64748b" transparent opacity={0.4} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.9, 0.2]}>
        <boxGeometry args={[2.04, 0.04, 0.84]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {/* Seats */}
      {[-0.7, -0.25, 0.2, 0.65].map((sx, idx) => (
        <group key={idx} position={[sx, 0.1, 0.1]}>
          {/* seat bottom */}
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.3, 0.05, 0.3]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          {/* seat back */}
          <mesh position={[0, 0.22, 0.13]}>
            <boxGeometry args={[0.3, 0.25, 0.04]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          {/* leg support */}
          <mesh position={[0, -0.04, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.16, 4]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ═══════ CORNER FLAGS ═══════ */
function CornerFlag({ pos }: { pos: [number, number] }) {
  const flagRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (flagRef.current) {
      const t = clock.elapsedTime;
      // Sway flag angle around the pole using a combination of sine waves
      flagRef.current.rotation.y = Math.sin(t * 3.5 + pos[0] + pos[1]) * 0.28;
    }
  });

  return (
    <group position={[pos[0], 0, pos[1]]}>
      {/* Pole */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.7, 8]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>
      {/* Flag */}
      <mesh ref={flagRef} position={[0.08, 0.62, 0]}>
        <planeGeometry args={[0.16, 0.12]} />
        <meshStandardMaterial color="#ef4444" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function CornerFlags() {
  const fw = 30 * S;
  const fh = 20 * S;
  const corners = [
    [-fw / 2, -fh / 2],
    [fw / 2, -fh / 2],
    [-fw / 2, fh / 2],
    [fw / 2, fh / 2],
  ] as [number, number][];

  return (
    <group position={[GW * S / 2, 0, GH * S / 2]}>
      {corners.map(([cx, cz], i) => (
        <CornerFlag key={i} pos={[cx, cz]} />
      ))}
    </group>
  );
}

/* ═══════ FAN POSTERS (RONALDO & MESSI) ═══════ */
interface FanState { tier: number; z: number; color: string; }

function RonaldoFan({ fan, idx, texture }: { fan: FanState; idx: number; texture: THREE.Texture }) {
  const posterRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (posterRef.current) {
      const t = clock.elapsedTime;
      // Waving and shaking motion
      posterRef.current.rotation.y = Math.PI / 2 - 0.25 + Math.sin(t * 4 + idx * 1.5) * 0.12;
      posterRef.current.rotation.x = Math.sin(t * 6 + idx) * 0.04;
    }
  });

  const h = TIER_HEIGHTS[fan.tier];
  const x = (4 - fan.tier) * S + S / 2;

  return (
    <group position={[x, h, fan.z]}>
      {/* Fan body */}
      <mesh position={[0, 0.24, 0]}>
        <capsuleGeometry args={[0.08, 0.24, 3, 5]} />
        <meshStandardMaterial color={fan.color} roughness={0.6} />
      </mesh>
      {/* Fan head */}
      <mesh position={[0, 0.44, 0]}>
        <sphereGeometry args={[0.07, 6, 6]} />
        <meshStandardMaterial color="#fca5a5" roughness={0.6} />
      </mesh>
      {/* Arms holding poster */}
      <mesh position={[0.1, 0.26, -0.15]} rotation={[0.4, 0.5, 0.5]}>
        <cylinderGeometry args={[0.02, 0.02, 0.22]} />
        <meshStandardMaterial color={fan.color} />
      </mesh>
      <mesh position={[0.1, 0.26, 0.15]} rotation={[-0.4, 0.5, -0.5]}>
        <cylinderGeometry args={[0.02, 0.02, 0.22]} />
        <meshStandardMaterial color={fan.color} />
      </mesh>
      {/* Ronaldo Poster */}
      <group ref={posterRef} position={[0.22, 0.28, 0]} rotation={[0, Math.PI / 2 - 0.25, 0.05]}>
        {/* Poster Board */}
        <mesh>
          <planeGeometry args={[0.75, 0.5]} />
          <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
        </mesh>
        {/* Poster Border frame */}
        <mesh position={[0, 0, -0.005]}>
          <planeGeometry args={[0.8, 0.55]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

function MessiFan({ fan, idx, texture }: { fan: FanState; idx: number; texture: THREE.Texture }) {
  const posterRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (posterRef.current) {
      const t = clock.elapsedTime;
      // Waving and shaking motion
      posterRef.current.rotation.y = -Math.PI / 2 + 0.25 + Math.sin(t * 4 + idx * 1.5) * 0.12;
      posterRef.current.rotation.x = Math.sin(t * 6 + idx) * 0.04;
    }
  });

  const h = TIER_HEIGHTS[fan.tier];
  const x = (75 + fan.tier) * S + S / 2;

  return (
    <group position={[x, h, fan.z]}>
      {/* Fan body */}
      <mesh position={[0, 0.24, 0]}>
        <capsuleGeometry args={[0.08, 0.24, 3, 5]} />
        <meshStandardMaterial color={fan.color} roughness={0.6} />
      </mesh>
      {/* Fan head */}
      <mesh position={[0, 0.44, 0]}>
        <sphereGeometry args={[0.07, 6, 6]} />
        <meshStandardMaterial color="#fca5a5" roughness={0.6} />
      </mesh>
      {/* Arms holding poster */}
      <mesh position={[-0.1, 0.26, -0.15]} rotation={[0.4, -0.5, -0.5]}>
        <cylinderGeometry args={[0.02, 0.02, 0.22]} />
        <meshStandardMaterial color={fan.color} />
      </mesh>
      <mesh position={[-0.1, 0.26, 0.15]} rotation={[-0.4, -0.5, 0.5]}>
        <cylinderGeometry args={[0.02, 0.02, 0.22]} />
        <meshStandardMaterial color={fan.color} />
      </mesh>
      {/* Messi Poster */}
      <group ref={posterRef} position={[-0.22, 0.28, 0]} rotation={[0, -Math.PI / 2 + 0.25, -0.05]}>
        {/* Poster Board */}
        <mesh>
          <planeGeometry args={[0.75, 0.5]} />
          <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
        </mesh>
        {/* Poster Border frame */}
        <mesh position={[0, 0, -0.005]}>
          <planeGeometry args={[0.8, 0.55]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

function FanPosters() {
  const ronaldoTexture = useMemo(() => new THREE.TextureLoader().load("/1.jpg"), []);
  const messiTexture = useMemo(() => new THREE.TextureLoader().load("/2.jpg"), []);

  const ronaldoFans = [
    { tier: 1, z: 5.5, color: "#ef4444" }, // Red
    { tier: 2, z: 8.0, color: "#ffffff" }, // White
    { tier: 3, z: 10.5, color: "#ef4444" },
    { tier: 1, z: 20.0, color: "#ffffff" },
    { tier: 2, z: 23.5, color: "#ef4444" },
    { tier: 3, z: 27.0, color: "#ffffff" },
  ];

  const messiFans = [
    { tier: 1, z: 6.0, color: "#38bdf8" }, // Light Blue
    { tier: 2, z: 8.5, color: "#ffffff" }, // White
    { tier: 3, z: 11.0, color: "#38bdf8" },
    { tier: 1, z: 19.5, color: "#ffffff" },
    { tier: 2, z: 23.0, color: "#38bdf8" },
    { tier: 3, z: 26.5, color: "#ffffff" },
  ];

  return (
    <group>
      {ronaldoFans.map((fan, idx) => (
        <RonaldoFan key={`cr7-${idx}`} fan={fan} idx={idx} texture={ronaldoTexture} />
      ))}
      {messiFans.map((fan, idx) => (
        <MessiFan key={`lm10-${idx}`} fan={fan} idx={idx} texture={messiTexture} />
      ))}
    </group>
  );
}

/* ═══════ STADIUM SEATS ═══════ */
function StadiumSeats() {
  const seatRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate all seat positions once
  const seatData = useMemo(() => {
    const list: { pos: [number, number, number]; rot: [number, number, number]; color: string }[] = [];
    const seatSpacing = 0.38; // space between seats

    // Color palette for seats
    const colors = ["#2563eb", "#3b82f6", "#1e3a8a", "#1d4ed8"];

    // 5 tiers
    for (let i = 0; i < 5; i++) {
      const h = TIER_HEIGHTS[i] + 0.01; // sit on top of the concrete tier

      // --- TOP & BOTTOM STANDS ---
      const topZ = (4 - i) * S + S / 2;
      const bottomZ = (55 + i) * S + S / 2;

      const leftStart = 2.5 + 0.2;
      const leftEnd = 17.5 - 0.2;
      const rightStart = 22.0 + 0.2;
      const rightEnd = 37.0 - 0.2;

      // Top Left Section Seats
      for (let x = leftStart; x <= leftEnd; x += seatSpacing) {
        list.push({ pos: [x, h, topZ], rot: [0, 0, 0], color: colors[(Math.floor(x * 10) + i) % colors.length] });
      }
      // Top Right Section Seats
      for (let x = rightStart; x <= rightEnd; x += seatSpacing) {
        list.push({ pos: [x, h, topZ], rot: [0, 0, 0], color: colors[(Math.floor(x * 10) + i) % colors.length] });
      }
      // Bottom Left Section Seats
      for (let x = leftStart; x <= leftEnd; x += seatSpacing) {
        list.push({ pos: [x, h, bottomZ], rot: [0, Math.PI, 0], color: colors[(Math.floor(x * 10) + i) % colors.length] });
      }
      // Bottom Right Section Seats
      for (let x = rightStart; x <= rightEnd; x += seatSpacing) {
        list.push({ pos: [x, h, bottomZ], rot: [0, Math.PI, 0], color: colors[(Math.floor(x * 10) + i) % colors.length] });
      }

      // --- LEFT & RIGHT STANDS ---
      const leftX = (4 - i) * S + S / 2;
      const rightX = (75 + i) * S + S / 2;

      const topZStart = 2.5 + 0.2;
      const topZEnd = 12.5 - 0.2;
      const bottomZStart = 17.0 + 0.2;
      const bottomZEnd = 27.0 - 0.2;

      // Left Top Section Seats
      for (let z = topZStart; z <= topZEnd; z += seatSpacing) {
        list.push({ pos: [leftX, h, z], rot: [0, Math.PI / 2, 0], color: colors[(Math.floor(z * 10) + i) % colors.length] });
      }
      // Left Bottom Section Seats
      for (let z = bottomZStart; z <= bottomZEnd; z += seatSpacing) {
        list.push({ pos: [leftX, h, z], rot: [0, Math.PI / 2, 0], color: colors[(Math.floor(z * 10) + i) % colors.length] });
      }
      // Right Top Section Seats
      for (let z = topZStart; z <= topZEnd; z += seatSpacing) {
        list.push({ pos: [rightX, h, z], rot: [0, -Math.PI / 2, 0], color: colors[(Math.floor(z * 10) + i) % colors.length] });
      }
      // Right Bottom Section Seats
      for (let z = bottomZStart; z <= bottomZEnd; z += seatSpacing) {
        list.push({ pos: [rightX, h, z], rot: [0, -Math.PI / 2, 0], color: colors[(Math.floor(z * 10) + i) % colors.length] });
      }
    }
    return list;
  }, []);

  useEffect(() => {
    if (!seatRef.current) return;
    seatData.forEach((s, idx) => {
      dummy.position.set(...s.pos);
      dummy.rotation.set(...s.rot);
      dummy.updateMatrix();
      seatRef.current!.setMatrixAt(idx, dummy.matrix);
      seatRef.current!.setColorAt(idx, new THREE.Color(s.color));
    });
    seatRef.current.instanceMatrix.needsUpdate = true;
    if (seatRef.current.instanceColor) {
      seatRef.current.instanceColor.needsUpdate = true;
    }
  }, [seatData, dummy]);

  return (
    <instancedMesh ref={seatRef} args={[undefined, undefined, seatData.length]} frustumCulled={false}>
      <boxGeometry args={[0.18, 0.1, 0.16]} />
      <meshStandardMaterial roughness={0.6} metalness={0.1} />
    </instancedMesh>
  );
}

/* ═══════ CLICK FLOOR ═══════ */
function ClickFloor({ mode, onCellClick }: { mode: string | null; onCellClick: (r: number, c: number) => void }) {
  const ref = useRef<THREE.Mesh>(null);

  const handleClick = useCallback((e: { stopPropagation: () => void; point: THREE.Vector3 }) => {
    if (!mode) return;
    e.stopPropagation();
    const point = e.point as THREE.Vector3;
    if (point) {
      onCellClick(Math.round(point.z / S), Math.round(point.x / S));
    }
  }, [mode, onCellClick]);

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[GW * S / 2, 0.006, GH * S / 2]} onClick={handleClick}>
      <planeGeometry args={[GW * S, GH * S]} />
      <meshStandardMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

/* ═══════ INSTANCED AGENTS ═══════ */
function AgentInstances({ agents }: { agents: Agent[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = Math.min(agents.length, MAX_AGENTS);

  // Diverse fan jersey/shirt color palette
  const colors = useMemo(() => {
    const palette = [
      new THREE.Color("#ef4444"), // Red jersey
      new THREE.Color("#3b82f6"), // Blue jersey
      new THREE.Color("#eab308"), // Yellow jersey
      new THREE.Color("#10b981"), // Green jersey
      new THREE.Color("#f97316"), // Orange jersey
      new THREE.Color("#a855f7"), // Purple jersey
      new THREE.Color("#f43f5e"), // Rose jersey
      new THREE.Color("#ffffff"), // White jersey
      new THREE.Color("#38bdf8"), // Light Blue jersey
      new THREE.Color("#fb7185"), // Rose-pink jersey
    ];
    return Array.from({ length: MAX_AGENTS }).map((_, idx) => {
      return palette[idx % palette.length];
    });
  }, []);

  // Diverse height variation scale
  const heightScales = useMemo(() => {
    return Array.from({ length: MAX_AGENTS }).map((_, idx) => {
      // Deterministic pseudo-random height scale between 0.85 and 1.15
      const hash = Math.sin(idx * 12.9898) * 43758.5453;
      return 0.85 + (hash - Math.floor(hash)) * 0.3;
    });
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    for (let i = 0; i < MAX_AGENTS; i++) {
      ref.current.setColorAt(i, colors[i]);
    }
    if (ref.current.instanceColor) {
      ref.current.instanceColor.needsUpdate = true;
    }
  }, [colors]);

  useFrame(() => {
    if (!ref.current) return;
    for (let i = 0; i < MAX_AGENTS; i++) {
      if (i < count) {
        const a = agents[i];
        const scale = heightScales[i];
        // Capsule height is roughly 0.52 units. Keep base of capsule on the ground.
        dummy.position.set(a.evacuated ? -9999 : a.x * S, a.evacuated ? -9999 : 0.26 * scale, a.evacuated ? -9999 : a.y * S);
        dummy.scale.set(1, scale, 1);
      } else {
        dummy.position.set(-9999, -9999, -9999);
        dummy.scale.set(0, 0, 0);
      }
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, MAX_AGENTS]} frustumCulled={false}>
      <capsuleGeometry args={[0.11, 0.3, 3, 5]} />
      <meshStandardMaterial roughness={0.6} metalness={0.1} />
    </instancedMesh>
  );
}

/* ═══════ INSTANCED FIRE ═══════ */
function FireInstances({ fires }: { fires: [number, number][] }) {
  const fireRef = useRef<THREE.InstancedMesh>(null);
  const smokeRef = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = Math.min(fires.length, MAX_FIRES);

  useFrame(({ clock }) => {
    if (!fireRef.current) return;
    const t = clock.elapsedTime;

    // 1. Blazing, Flickering Flames
    for (let i = 0; i < MAX_FIRES; i++) {
      if (i < count) {
        const [r, c] = fires[i];

        // Dynamic stretching/flicker scale
        const scaleY = 0.8 + Math.sin(t * 18 + i * 2.3) * 0.35;
        const scaleXZ = 0.9 + Math.sin(t * 12 + i * 1.1) * 0.15;

        dummy.position.set(c * S, 0.22 * scaleY, r * S);
        dummy.scale.set(scaleXZ, scaleY, scaleXZ);
        
        // Flickering color interpolation
        const colorVal = 0.5 + Math.sin(t * 22 + i * 3.1) * 0.5;
        const color = new THREE.Color();
        if (colorVal < 0.3) {
          color.set("#dc2626"); // deep red
        } else if (colorVal < 0.7) {
          color.set("#ea580c"); // hot orange
        } else {
          color.set("#facc15"); // yellow core
        }
        fireRef.current.setColorAt(i, color);
      } else {
        dummy.position.set(-9999, -9999, -9999);
        dummy.scale.set(0, 0, 0);
      }
      dummy.updateMatrix();
      fireRef.current.setMatrixAt(i, dummy.matrix);
    }
    fireRef.current.instanceMatrix.needsUpdate = true;
    if (fireRef.current.instanceColor) {
      fireRef.current.instanceColor.needsUpdate = true;
    }

    // 2. Rising, Swelling Smoke Particles
    if (smokeRef.current) {
      for (let i = 0; i < MAX_FIRES; i++) {
        if (i < count) {
          const [r, c] = fires[i];

          // Loop position vertically
          const lifetime = 1.4; // seconds
          const age = (t * 0.9 + i * 0.25) % lifetime;
          const progress = age / lifetime;

          const yStart = 0.2;
          const yEnd = 1.5;
          const y = yStart + progress * (yEnd - yStart);

          // Drift outwards slightly
          const drift = progress * 0.22;
          const driftX = Math.sin(t * 2 + i * 5) * drift;
          const driftZ = Math.cos(t * 2 + i * 5) * drift;

          const scale = 0.5 * progress + 0.15; // swells as it rises

          dummy.position.set(c * S + driftX, y, r * S + driftZ);
          dummy.scale.setScalar(scale);
        } else {
          dummy.position.set(-9999, -9999, -9999);
          dummy.scale.setScalar(0);
        }
        dummy.updateMatrix();
        smokeRef.current.setMatrixAt(i, dummy.matrix);
      }
      smokeRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Flames */}
      <instancedMesh ref={fireRef} args={[undefined, undefined, MAX_FIRES]} frustumCulled={false}>
        <coneGeometry args={[0.16, 0.5, 4, 1]} />
        <meshStandardMaterial roughness={0.2} metalness={0.1} emissive="#ea580c" emissiveIntensity={1.8} toneMapped={false} />
      </instancedMesh>

      {/* Smoke */}
      <instancedMesh ref={smokeRef} args={[undefined, undefined, MAX_FIRES]} frustumCulled={false}>
        <sphereGeometry args={[0.14, 5, 4]} />
        <meshStandardMaterial color="#475569" transparent opacity={0.35} roughness={0.9} metalness={0.0} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}

/* ═══════ INSTANCED OBSTACLES ═══════ */
function ObstacleInstances({ obstacles }: { obstacles: [number, number][] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const MAX_OBSTACLES = 100;

  useEffect(() => {
    if (!ref.current) return;
    const count = Math.min(obstacles.length, MAX_OBSTACLES);
    for (let i = 0; i < MAX_OBSTACLES; i++) {
      if (i < count) {
        const [r, c] = obstacles[i];
        dummy.position.set(c * S, 0.175, r * S);
        dummy.scale.set(1, 1, 1);
      } else {
        dummy.position.set(-9999, -9999, -9999);
        dummy.scale.set(0, 0, 0);
      }
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [obstacles, dummy]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, MAX_OBSTACLES]} frustumCulled={false}>
      <boxGeometry args={[S * 0.85, 0.35, S * 0.85]} />
      <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.3} />
    </instancedMesh>
  );
}

/* ═══════ RESPONDERS ═══════ */
function ResponderMarkers({ responders }: { responders: Responder[] }) {
  return (
    <>
      {responders.map((r) => {
        const cy = ((r.sector[0] + r.sector[1]) / 2) * S;
        const cx = ((r.sector[2] + r.sector[3]) / 2) * S;
        return (
          <group key={r.id} position={[cx, 0.5, cy]}>
            {/* Responder body */}
            <mesh>
              <capsuleGeometry args={[0.16, 0.35, 4, 8]} />
              <meshStandardMaterial color="#facc15" emissive="#ca8a04" emissiveIntensity={0.3} />
            </mesh>
            {/* Safety Helmet */}
            <mesh position={[0, 0.3, 0]}>
              <sphereGeometry args={[0.17, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#ffffff" roughness={0.3} />
            </mesh>
            <Text fontSize={0.24} position={[0, 0.65, 0]} color="#facc15" anchorX="center" anchorY="middle" fontWeight="bold">
              R{r.id + 1}
            </Text>
          </group>
        );
      })}
    </>
  );
}

/* ═══════ FIRE LIGHTS ═══════ */
function FireLights({ fires }: { fires: [number, number][] }) {
  const lights = useMemo(() => {
    if (!fires.length) return [];
    const step = Math.max(1, Math.floor(fires.length / 6));
    return fires.filter((_, i) => i % step === 0).slice(0, 6);
  }, [fires]);

  return (
    <>
      {lights.map(([r, c], i) => (
        <pointLight key={i} position={[c * S, 1.2, r * S]} color="#ef4444" intensity={2.5} distance={4} decay={2} />
      ))}
    </>
  );
}

/* ═══════ JUMBOTRON ═══════ */
function Jumbotron({ evacuated, totalAgents, running, complete }: { evacuated: number; totalAgents: number; running: boolean; complete: boolean }) {
  const pct = totalAgents > 0 ? Math.round((evacuated / totalAgents) * 100) : 0;

  let statusText = "MATCH DAY";
  let statusColor = "#10b981"; // green
  if (complete) {
    statusText = "SAFE - ALL CLEAR";
    statusColor = "#10b981";
  } else if (running) {
    statusText = "EVACUATING";
    statusColor = "#ef4444"; // red
  }

  const center = [GW * S / 2, 5.0, GH * S / 2] as [number, number, number];

  return (
    <group position={center}>
      {/* Central video board box */}
      <mesh>
        <boxGeometry args={[3.2, 1.8, 3.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.8} />
      </mesh>
      {/* Top support/crown */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[3.4, 0.2, 3.4]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      {/* Bottom trim */}
      <mesh position={[0, -1.0, 0]}>
        <boxGeometry args={[3.4, 0.2, 3.4]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Four screens */}
      {/* South facing screen (towards +Z) */}
      <group position={[0, 0, 1.61]}>
        <ScreenText title="SPECTRA STADIUM" pct={pct} remaining={totalAgents - evacuated} status={statusText} statusColor={statusColor} />
      </group>
      {/* North facing screen (towards -Z) */}
      <group position={[0, 0, -1.61]} rotation={[0, Math.PI, 0]}>
        <ScreenText title="SPECTRA STADIUM" pct={pct} remaining={totalAgents - evacuated} status={statusText} statusColor={statusColor} />
      </group>
      {/* East facing screen (towards +X) */}
      <group position={[1.61, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <ScreenText title="SPECTRA STADIUM" pct={pct} remaining={totalAgents - evacuated} status={statusText} statusColor={statusColor} />
      </group>
      {/* West facing screen (towards -X) */}
      <group position={[-1.61, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <ScreenText title="SPECTRA STADIUM" pct={pct} remaining={totalAgents - evacuated} status={statusText} statusColor={statusColor} />
      </group>

      {/* Support cable */}
      <mesh position={[0, 2.0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 2, 4]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
}

function ScreenText({ title, pct, remaining, status, statusColor }: { title: string; pct: number; remaining: number; status: string; statusColor: string }) {
  return (
    <group>
      {/* Screen background black */}
      <mesh>
        <planeGeometry args={[3.0, 1.6]} />
        <meshBasicMaterial color="#020617" />
      </mesh>

      {/* Text overlay */}
      <Text fontSize={0.2} position={[0, 0.45, 0.01]} color="#facc15" anchorX="center" anchorY="middle" fontWeight="bold">
        {title}
      </Text>

      <Text fontSize={0.16} position={[0, 0.12, 0.01]} color="#f9fafb" anchorX="center" anchorY="middle">
        EVACUATED: {pct}%
      </Text>

      <Text fontSize={0.16} position={[0, -0.16, 0.01]} color="#f9fafb" anchorX="center" anchorY="middle">
        REMAINING: {remaining}
      </Text>

      <Text fontSize={0.18} position={[0, -0.5, 0.01]} color={statusColor} anchorX="center" anchorY="middle" fontWeight="bold">
        {status}
      </Text>
    </group>
  );
}

/* ═══════ DYNAMIC ENVIRONMENT ═══════ */
function DynamicEnvironment({ running, complete, lightingMode, weather }: { running: boolean; complete: boolean; lightingMode: "matchday" | "night" | "emergency"; weather: "clear" | "rain" }) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const dirLightRef = useRef<THREE.DirectionalLight>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const isRain = weather === "rain";

    let targetAmbient = 0.55;
    let targetDir = 0.95;
    let ambientColor = "#ffffff";
    let dirColor = "#ffffff";

    if (lightingMode === "night") {
      targetAmbient = isRain ? 0.18 : 0.35;
      targetDir = isRain ? 0.28 : 0.55;
      ambientColor = isRain ? "#1e293b" : "#38bdf8"; // Dark steel storm blue vs bright sky blue
      dirColor = isRain ? "#334155" : "#60a5fa";
    } else if (lightingMode === "emergency" || (running && !complete)) {
      const pulse = 0.5 + Math.sin(t * 5) * 0.3;
      targetAmbient = pulse * (isRain ? 0.35 : 0.7);
      targetDir = pulse * (isRain ? 0.45 : 0.8);
      ambientColor = isRain ? "#451a1a" : "#fca5a5"; // Colder dim emergency red
      dirColor = isRain ? "#7f1d1d" : "#ef4444";
    }

    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(ambientRef.current.intensity, targetAmbient, 0.1);
      ambientRef.current.color.set(ambientColor);
    }
    if (dirLightRef.current) {
      dirLightRef.current.intensity = THREE.MathUtils.lerp(dirLightRef.current.intensity, targetDir, 0.1);
      dirLightRef.current.color.set(dirColor);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.4} />
      <directionalLight ref={dirLightRef} position={[15, 20, 10]} intensity={0.8} color="#ffffff" castShadow />
      <directionalLight position={[-15, 15, -10]} intensity={0.6} color="#94a3b8" />
      <hemisphereLight args={["#ffffff", "#475569", 0.45]} />
    </>
  );
}

/* ═══════ CAMERA CONTROLLER ═══════ */
const PRESETS: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
  tactical: { position: [12, 14, 25], target: [20, 0, 15] },
  topdown: { position: [20, 26, 15.01], target: [20, 0, 15] },
  mainstand: { position: [20, 9, 32], target: [20, 0, 15] },
  northgate: { position: [20, 7, -2], target: [20, 0, 15] },
};

function CameraController({ preset, controlsRef }: { preset: string; controlsRef: React.RefObject<any> }) {
  const { camera } = useThree();

  useEffect(() => {
    const config = PRESETS[preset];
    if (config && controlsRef.current) {
      const controls = controlsRef.current;
      controls.target.set(...config.target);
      camera.position.set(...config.position);
      controls.update();
    }
  }, [preset, camera, controlsRef]);

  return null;
}

/* ═══════ 3D EXIT LABELS ═══════ */
function ExitLabels() {
  const gates = [
    { text: "GATE A", pos: [GW * S / 2, 2.3, -0.6], rot: [0, 0, 0] },
    { text: "GATE B", pos: [GW * S / 2, 2.3, GH * S + 0.6], rot: [0, Math.PI, 0] },
    { text: "GATE C", pos: [-0.6, 2.3, GH * S / 2], rot: [0, Math.PI / 2, 0] },
    { text: "GATE D", pos: [GW * S + 0.6, 2.3, GH * S / 2], rot: [0, -Math.PI / 2, 0] },
  ];

  return (
    <group>
      {gates.map((g, idx) => (
        <group key={idx} position={g.pos as [number, number, number]} rotation={g.rot as [number, number, number]}>
          {/* Label background plate */}
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[1.5, 0.5]} />
            <meshBasicMaterial color="#0a0f1d" transparent opacity={0.85} />
          </mesh>
          {/* Glowing green border frame */}
          <mesh position={[0, 0, -0.02]}>
            <planeGeometry args={[1.56, 0.56]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.28}
            color="#10b981"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {g.text}
          </Text>
        </group>
      ))}
    </group>
  );
}

/* ═══════ WEATHER FX (RAIN) ═══════ */
function RainFX({ enabled }: { enabled: boolean }) {
  const rainRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = 500;

  // Generate random rain coordinates
  const rainData = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      x: Math.random() * (GW * S + 10) - 5,
      z: Math.random() * (GH * S + 10) - 5,
      speed: 14 + Math.random() * 8,
      offset: Math.random() * 15,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!rainRef.current || !enabled) return;
    const t = clock.elapsedTime;

    rainData.forEach((drop, i) => {
      // Loop height from y=12 down to y=0
      const y = 12 - ((t * drop.speed + drop.offset) % 12);

      dummy.position.set(drop.x, y, drop.z);
      // Glistening stretched rain drop scale
      dummy.scale.set(0.03, 0.35, 0.03);
      dummy.updateMatrix();
      rainRef.current!.setMatrixAt(i, dummy.matrix);
    });
    rainRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!enabled) return null;

  return (
    <instancedMesh ref={rainRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <cylinderGeometry args={[0.08, 0.08, 1, 4]} />
      <meshBasicMaterial color="#60a5fa" transparent opacity={0.25} />
    </instancedMesh>
  );
}

/* ═══════ WEATHER FX (RAIN SPLASHES) ═══════ */
function RainSplashes({ enabled }: { enabled: boolean }) {
  const splashRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = 120;

  // Generate random splash coordinates
  const splashData = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      x: Math.random() * (GW * S),
      z: Math.random() * (GH * S),
      speed: 1.5 + Math.random() * 1.5,
      offset: Math.random() * 5,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!splashRef.current || !enabled) return;
    const t = clock.elapsedTime;

    splashData.forEach((splash, i) => {
      const life = ((t * splash.speed + splash.offset) % 1); // 0 to 1 cycle
      const scale = life * 0.45;

      dummy.position.set(splash.x, 0.03, splash.z);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      splashRef.current!.setMatrixAt(i, dummy.matrix);
    });
    splashRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!enabled) return null;

  return (
    <instancedMesh ref={splashRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <ringGeometry args={[0.7, 0.9, 16]} />
      <meshBasicMaterial color="#93c5fd" transparent opacity={0.16} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

/* ═══════ GATE CONGESTION HEATMAP ═══════ */
function GateSafetyHeatmap({ agents }: { agents: Agent[] }) {
  const fw = GW * S;
  const fh = GH * S;

  const gates = [
    { name: "Gate A", pos: [fw / 2, 0.02, 0.5] },
    { name: "Gate B", pos: [fw / 2, 0.02, fh - 0.5] },
    { name: "Gate C", pos: [0.5, 0.02, fh / 2] },
    { name: "Gate D", pos: [fw - 0.5, 0.02, fh / 2] },
  ];

  return (
    <group>
      {gates.map((g, idx) => {
        // Calculate congestion: number of active agents within 4 units of this gate
        const count = agents.filter(a => {
          if (a.evacuated) return false;
          const ax = a.x * S;
          const az = a.y * S;
          const dx = ax - g.pos[0];
          const dz = az - g.pos[2];
          return Math.sqrt(dx * dx + dz * dz) < 4.0;
        }).length;

        let color = "#10b981"; // Safe (Green)
        if (count > 25) {
          color = "#ef4444"; // Clogged (Red)
        } else if (count > 8) {
          color = "#fbbf24"; // Crowded (Yellow/Amber)
        }

        return (
          <group key={idx} position={g.pos as [number, number, number]}>
            {/* Pulsing ring geometry */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.5, 1.7, 32]} />
              <meshBasicMaterial color={color} transparent opacity={0.8} />
            </mesh>
            {/* Faded background disc */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[1.5, 32]} />
              <meshBasicMaterial color={color} transparent opacity={0.15} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ═══════ MAIN ═══════ */
export function SimulationCanvas({
  state,
  mode,
  onCellClick,
  cameraPreset,
  lightingMode,
  weather,
  heatmapEnabled,
}: Props) {
  const controlsRef = useRef<any>(null);

  return (
    <div className="relative h-full w-full rounded-fan border border-border overflow-hidden bg-[#0a0f1d]">
      <Canvas
        camera={{ position: [12, 14, 22], fov: 42 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.1; }}
      >
        <color attach="background" args={["#0a0f1d"]} />
        <fog attach="fog" args={["#0a0f1d", 35, 90]} />

        <DynamicEnvironment running={state?.running ?? false} complete={state?.complete ?? false} lightingMode={lightingMode} weather={weather} />

        {/* ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[GW * S / 2, -0.02, GH * S / 2]}>
          <planeGeometry args={[GW * S + 4, GH * S + 4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.95} />
        </mesh>

        <Field weather={weather} />
        <AdBoards />
        <Dugouts />
        <CornerFlags />
        <FanPosters />
        <StadiumSeats />
        <Concourse />
        <StandSide side="top" />
        <StandSide side="bottom" />
        <StandSide side="left" />
        <StandSide side="right" />
        <GateGlows />
        <ExitLabels />
        <RainFX enabled={weather === "rain"} />
        <RainSplashes enabled={weather === "rain"} />
        {state && heatmapEnabled && <GateSafetyHeatmap agents={state.agents} />}
        <Floodlights running={state?.running ?? false} complete={state?.complete ?? false} lightingMode={lightingMode} />

        {state && (
          <>
            <AgentInstances agents={state.agents} />
            <FireInstances fires={state.fires} />
            <ObstacleInstances obstacles={state.obstacles} />
            <ResponderMarkers responders={state.responders} />
            <FireLights fires={state.fires} />
            <Jumbotron evacuated={state.evacuated ?? 0} totalAgents={state.total_agents ?? 300} running={state.running ?? false} complete={state.complete ?? false} />
          </>
        )}

        <ClickFloor mode={mode} onCellClick={onCellClick} />
        <CameraController preset={cameraPreset} controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enablePan enableZoom enableRotate
          maxPolarAngle={Math.PI / 2.1}
          minDistance={5}
          maxDistance={40}
          target={[GW * S / 2, 0, GH * S / 2]}
        />
      </Canvas>

      {mode && (
        <div className="absolute top-3 left-3 rounded-data bg-[#0a0f1d]/90 px-2.5 py-1.5 text-data text-floodlight-200 border border-floodlight-200/30 backdrop-blur-sm relative z-10 pointer-events-auto">
          Click on stadium to place {mode}
        </div>
      )}
    </div>
  );
}
