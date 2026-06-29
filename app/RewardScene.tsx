"use client";

import { useState, useEffect } from "react";
import "./reward-scene.css";

function rand(seed: number) {
  let t = (Math.floor(seed * 1000) ^ 0x9e3779b9) >>> 0;
  t = Math.imul(t ^ (t >>> 16), 0x45d9f3b);
  t = Math.imul(t ^ (t >>> 16), 0x45d9f3b);
  t = (t ^ (t >>> 16)) >>> 0;
  return t / 4294967296;
}

type Jar = {
  n: 1 | 2 | 3 | 4 | 5;
  vbW: number;
  vbH: number;
  baseWidth: number;
};

const JARS: Jar[] = [
  { n: 1, vbW: 129, vbH: 193, baseWidth: 126 },
  { n: 2, vbW: 129, vbH: 261, baseWidth: 114 },
  { n: 3, vbW: 81, vbH: 177, baseWidth: 102 },
  { n: 4, vbW: 166, vbH: 216, baseWidth: 142 },
  { n: 5, vbW: 148, vbH: 182, baseWidth: 134 },
];

type Pot = {
  key: string;
  n: number;
  flip: boolean;
  x: number;
  y: number;
  width: number;
  aspect: number;
  rotation: number;
  delay: number;
};

type RandomImg = {
  n: 1 | 2 | 3 | 4;
  vbW: number;
  vbH: number;
  baseWidth: number;
};

type Decor = RandomImg & { key: string; x: number; y: number; rotation: number };

const RANDOM_IMAGES: RandomImg[] = [
  { n: 1, vbW: 267, vbH: 294, baseWidth: 146 },
  { n: 2, vbW: 214, vbH: 134, baseWidth: 158 },
  { n: 3, vbW: 153, vbH: 105, baseWidth: 138 },
  { n: 4, vbW: 191, vbH: 247, baseWidth: 132 },
];

// Single timeline driving every stage of the reward sequence (seconds), relative
// to the moment the user clicks to start it — nothing here runs on page load.
const HOLD = 0.5; // static screen before anything reacts
const BADGE_GLOW_START = HOLD;
const BADGE_GLOW_BUILD = 0.8; // badge glow ramps up, then settles into an idle pulse
const PULSE_START = 1.0; // golden pulse leaves the badge
const PULSE_DURATION = 2.0; // time for the pulse ring to expand off-screen
const WAVE_START = PULSE_START + 0.15; // pots start converting just after the pulse departs
const WAVE_SPAN = 1.7; // spread between the nearest pot converting and the farthest
const MAX_TILT = 50; // degrees — fixed static tilt per pot, never animated

type PlacedElement = {
  x: number;
  y: number;
  rx: number;
  ry: number;
};

function checkOverlap(
  x: number,
  y: number,
  rx: number,
  ry: number,
  placed: PlacedElement[]
): boolean {
  const bufferX = 2; // visual separation buffer
  const bufferY = 2;
  for (const other of placed) {
    const overlapX = Math.abs(x - other.x) < (rx + other.rx + bufferX);
    const overlapY = Math.abs(y - other.y) < (ry + other.ry + bufferY);
    if (overlapX && overlapY) {
      return true;
    }
  }
  return false;
}

function generateLayout(): { pots: Pot[]; decors: Decor[] } {
  const placed: PlacedElement[] = [
    // Center badge clearance zone (badge is at 50, 50)
    { x: 50, y: 50, rx: 18, ry: 14 }
  ];

  function tryPlace(rx: number, ry: number, marginX: number, marginY: number) {
    let attempts = 0;
    while (attempts < 200) {
      const x = marginX + Math.random() * (100 - 2 * marginX);
      const y = marginY + Math.random() * (100 - 2 * marginY);
      if (!checkOverlap(x, y, rx, ry, placed)) {
        placed.push({ x, y, rx, ry });
        return { x, y };
      }
      attempts++;
    }
    // Fallback if unable to place perfectly
    const x = marginX + Math.random() * (100 - 2 * marginX);
    const y = marginY + Math.random() * (100 - 2 * marginY);
    placed.push({ x, y, rx, ry });
    return { x, y };
  }

  // 1. Place pots (10 pots total: inner & outer for each of the 5 JARS)
  const rawPots: {
    key: string;
    n: 1 | 2 | 3 | 4 | 5;
    flip: boolean;
    x: number;
    y: number;
    width: number;
    aspect: number;
    rotation: number;
    dist: number;
  }[] = [];

  JARS.forEach((jar) => {
    // Inner pot (scale = 1.0)
    const wInner = jar.baseWidth * 1.0;
    const rxInner = (wInner / 2) / 19.2;
    const ryInner = ((wInner * (jar.vbH / jar.vbW)) / 2) / 10.8;
    const posInner = tryPlace(rxInner, ryInner, 8, 12);
    const rotInner = (Math.random() - 0.5) * 2 * MAX_TILT;
    rawPots.push({
      key: `inner-${jar.n}`,
      n: jar.n,
      flip: false,
      x: posInner.x,
      y: posInner.y,
      width: wInner,
      aspect: jar.vbH / jar.vbW,
      rotation: rotInner,
      dist: Math.hypot(posInner.x - 50, posInner.y - 50),
    });

    // Outer pot (scale = 0.86)
    const wOuter = jar.baseWidth * 0.86;
    const rxOuter = (wOuter / 2) / 19.2;
    const ryOuter = ((wOuter * (jar.vbH / jar.vbW)) / 2) / 10.8;
    const posOuter = tryPlace(rxOuter, ryOuter, 8, 12);
    const rotOuter = (Math.random() - 0.5) * 2 * MAX_TILT;
    rawPots.push({
      key: `outer-${jar.n}`,
      n: jar.n,
      flip: true,
      x: posOuter.x,
      y: posOuter.y,
      width: wOuter,
      aspect: jar.vbH / jar.vbW,
      rotation: rotOuter,
      dist: Math.hypot(posOuter.x - 50, posOuter.y - 50),
    });
  });

  // Calculate delay based on distance from center
  const maxDist = Math.max(...rawPots.map((p) => p.dist)) || 1;
  const pots = rawPots.map(({ dist, ...pot }) => ({
    ...pot,
    delay: WAVE_START + (dist / maxDist) * WAVE_SPAN,
  }));

  // 2. Place decors (3 instances of each random image, total 12 decors)
  const decorsToPlace: RandomImg[] = [];
  RANDOM_IMAGES.forEach((img) => {
    decorsToPlace.push(img);
    decorsToPlace.push(img);
    decorsToPlace.push(img);
  });

  const decors = decorsToPlace.map((img, idx) => {
    const rx = (img.baseWidth / 2) / 19.2;
    const ry = ((img.baseWidth * (img.vbH / img.vbW)) / 2) / 10.8;
    const pos = tryPlace(rx, ry, 6, 8);
    const rotation = (Math.random() - 0.5) * 2 * 35;
    return {
      ...img,
      key: `decor-${img.n}-${idx}`,
      x: pos.x,
      y: pos.y,
      rotation,
    };
  });

  return { pots, decors };
}

const SPARK_OFFSETS = [
  { left: 8, top: -8 },
  { left: 92, top: 18 },
  { left: 50, top: 102 },
];

function StarField() {
  // Tiny static pixels — increased size range, scaled via vmin.
  const dots = Array.from({ length: 55 }, (_, i) => ({
    key: `dot-${i}`,
    x: rand(i * 10.3) * 100,
    y: rand(i * 5.7 + 10) * 100,
    size: 3 + Math.floor(rand(i * 6.1) * 4), // 3px to 6px
    color: i % 11 === 0 ? "#9cf3ff" : i % 10 === 0 ? "#caa6ff" : "#cfe6ff",
  }));

  // Small pixel-art crosses — increased size range, scaled via vmin.
  const crosses = Array.from({ length: 26 }, (_, i) => ({
    key: `cross-${i}`,
    x: rand(i * 8.8 + 10) * 100,
    y: rand(i * 6.6 + 19) * 100,
    size: 10 + Math.floor(rand(i * 4.9 + 3) * 13), // 10px to 22px
    animated: rand(i * 6.2 + 5) > 0.45,
    delay: rand(i * 9.1) * 3,
    duration: 1.8 + rand(i * 10.4) * 2,
    color: i % 5 === 0 ? "#ffe9a8" : i % 5 === 0 ? "#9cf3ff" : "#eaf1ff",
  }));

  // A handful of bigger pixel-art sparkles — increased size range, scaled via vmin.
  const sparks = Array.from({ length: 9 }, (_, i) => ({
    key: `spark-${i}`,
    x: 8 + rand(i * 17.7) * 84,
    y: 8 + rand(i * 21.3 + 2) * 84,
    size: 24 + Math.floor(rand(i * 6.6) * 22), // 24px to 45px
    delay: rand(i * 8.8) * 2.6,
    color: i % 2 === 0 ? "#7fe8ff" : "#ffe9a8",
  }));

  return (
    <>
      {dots.map((d) => (
        <span
          key={d.key}
          className="pixel-dot"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: `${d.size / 10.8}vmin`,
            height: `${d.size / 10.8}vmin`,
            background: d.color,
          }}
        />
      ))}
      {crosses.map((c) => (
        <span
          key={c.key}
          className={`pixel-cross${c.animated ? " twinkle-pixel" : ""}`}
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: `${c.size / 10.8}vmin`,
            height: `${c.size / 10.8}vmin`,
            background: c.color,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
          }}
        />
      ))}
      {sparks.map((s) => (
        <span
          key={s.key}
          className="pixel-spark twinkle-pixel"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size / 10.8}vmin`,
            height: `${s.size / 10.8}vmin`,
            background: s.color,
            boxShadow: `0 0 ${(s.size / 3) / 10.8}vmin 1px ${s.color}`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </>
  );
}

function BlastEffect() {
  const shrapnel = Array.from({ length: 8 }, (_, i) => i * 45);

  return (
    <>
      <div
        className="blast-flash"
        style={{ animationDelay: `${PULSE_START}s` }}
      />
      <div
        className="pulse-ring"
        style={{
          animationDelay: `${PULSE_START}s`,
          animationDuration: `${PULSE_DURATION}s`,
        }}
      />
      {shrapnel.map((angle, i) => (
        <span
          key={i}
          className="blast-shrapnel"
          style={
            {
              "--ang": `${angle}deg`,
              animationDelay: `${PULSE_START + 0.05}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
}

function RandomDecor({ decors }: { decors: Decor[] }) {
  return (
    <>
      {decors.map((img) => (
        <img
          key={img.key}
          className="random-decor pixel"
          src={`/randomImage${img.n}.svg`}
          alt=""
          draggable={false}
          style={{
            left: `${img.x}%`,
            top: `${img.y}%`,
            width: `${img.baseWidth / 10.8}vmin`,
            aspectRatio: `${img.vbW} / ${img.vbH}`,
            transform: `translate(-50%, -50%) rotate(${img.rotation}deg)`,
          }}
        />
      ))}
    </>
  );
}

function PotInstance({ pot }: { pot: Pot }) {
  const purpleSrc = `/purpleJar${pot.n}.svg`;
  const goldSrc = `/yellowJar${pot.n}.svg`;

  return (
    <div
      className="pot-wrapper"
      style={{
        left: `${pot.x}%`,
        top: `${pot.y}%`,
        width: `${pot.width / 10.8}vmin`,
        aspectRatio: `1 / ${pot.aspect}`,
        transform: `translate(-50%, -50%) rotate(${pot.rotation}deg) scaleX(${pot.flip ? -1 : 1})`,
      }}
    >
      <img className="pot-img pot-idle pixel" src={purpleSrc} alt="" draggable={false} />
      <img
        className="pot-img pixel pot-gold"
        src={goldSrc}
        alt=""
        draggable={false}
        style={{ "--pot-delay": `${pot.delay}s` } as React.CSSProperties}
      />
      {SPARK_OFFSETS.map((offset, i) => (
        <span
          key={i}
          className="pot-sparkle"
          style={
            {
              left: `${offset.left}%`,
              top: `${offset.top}%`,
              "--pot-delay": `${pot.delay + i * 0.06}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default function RewardScene() {
  const [started, setStarted] = useState(false);
  const [layout, setLayout] = useState<{ pots: Pot[]; decors: Decor[] } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    requestAnimationFrame(() => {
      setLayout(generateLayout());
    });
  }, []);

  if (!mounted || !layout) {
    return (
      <div
        className="reward-scene relative h-screen w-screen overflow-hidden select-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 42%, #1c2078 0%, #11134a 48%, #06071a 100%)",
        }}
      >
        <StarField />
        <div className="static-noise" />
      </div>
    );
  }

  const { pots, decors } = layout;

  return (
    <div
      onClick={() => setStarted(true)}
      className={`reward-scene relative h-screen w-screen overflow-hidden select-none${
        started ? " is-playing" : ""
      }`}
      style={{
        background:
          "radial-gradient(ellipse 80% 70% at 50% 42%, #1c2078 0%, #11134a 48%, #06071a 100%)",
      }}
    >
      <StarField />
      <div className="static-noise" />
      <RandomDecor decors={decors} />
      <BlastEffect />

      {pots.map((pot) => (
        <PotInstance key={pot.key} pot={pot} />
      ))}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          className="badge-glow"
          style={{
            animationDelay: `${BADGE_GLOW_START}s, ${BADGE_GLOW_START + BADGE_GLOW_BUILD}s`,
            animationDuration: `${BADGE_GLOW_BUILD}s, 2.6s`,
          }}
        />
        <div
          className="pixel-corner relative flex items-center justify-center bg-white"
          style={{
            width: "clamp(150px, 16vw, 220px)",
            aspectRatio: "2.6 / 1",
            "--notch": "10px",
          } as React.CSSProperties}
        >
          <div
            className="pixel-corner absolute flex items-center justify-center bg-[#8B2FE0]"
            style={{ inset: 6, "--notch": "7px" } as React.CSSProperties}
          >
            <span
              className="badge-text"
              style={{ fontSize: "clamp(16px, 2.6vw, 28px)" }}
            >
              5-5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

