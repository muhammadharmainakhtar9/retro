import Image from "next/image";
import Link from "next/link";
import GridScan from "./GridScan";

const NAV_LINKS = ["ABOUT", "THE DEAL", "GAMES"];

const BARS = [
  { width: 90, height: 330, from: "#2D2BFF", to: "#1218FF" },
  { width: 45, height: 330, from: "#5A2FE0", to: "#3B18D8" },
  { width: 25, height: 330, from: "#6E24E8", to: "#4A0FB6" },
  { width: 15, height: 330, from: "#38F4FF", to: "#16D9FF" },
];

function DecorativeBars({ align = "end" }: { align?: "start" | "end" }) {
  return (
    <div className={`flex gap-8 ${align === "start" ? "items-start -mt-5 mr-40" : "items-end -mb-5 ml-33"}`}>
      {BARS.map((bar, i) => (
        <div
          key={i}
          className="rotate-[-15deg]"
          style={{
            width: bar.width,
            height: bar.height,
            background: `linear-gradient(to bottom, ${bar.from}, ${bar.to})`,
            boxShadow: `0 0 20px 1px ${bar.from}66`,
          }}
        />
      ))}
    </div>
  );
}

function Logo() {
  return (
    <Image
      src="/potslogo.svg"
      alt="100 Pots"
      width={70}
      height={97}
      className="w-[70px]"
      priority
    />
  );
}

function PitchButton() {
  return (
    <Link
      href="/reward"
      className="flex select-none items-center justify-center font-(family-name:--font-pixel) h-12 w-25 text-[9px] tracking-tight text-[#0a1142] bg-[#2EEBFF] border-[3px] border-[#6A14D4] shadow-[0_0_16px_2px_rgba(46,235,255,0.55),0_2px_0_rgba(0,0,0,0.35)]"
      style={{
        clipPath:
          "polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)",
      }}
    >
      PITCH US
    </Link>
  );
}

function Nav() {
  return (
    <nav className="flex flex-col items-end gap-[25px]">
      {NAV_LINKS.map((label) => (
        <a
          key={label}
          href="#"
          className="text-[14px] font-medium uppercase tracking-wide text-white hover:text-cyan-300"
        >
          {label}
        </a>
      ))}
      <PitchButton />
    </nav>
  );
}

export default function Homepage() {
  return (
    <div className="relative h-screen w-screen select-none overflow-hidden bg-linear-to-b from-[#11143D] to-[#07081F]">
      <div className="pointer-events-none absolute inset-0">
        <GridScan
          sensitivity={0.12}
          lineThickness={0.3}
          linesColor="#1D22FF"
          gridScale={0.1}
          scanColor="#2EEBFF"
          scanOpacity={0.2}
          enablePost
          bloomIntensity={0.6}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
          lineJitter={0.1}
          scanGlow={1}
          scanSoftness={2}
          scanDuration={5}
          scanDelay={3}
          enableWebcam={false}
          showPreview={false}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-5 flex justify-center">
        <DecorativeBars align="start" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-5 flex justify-center">
        <DecorativeBars align="end" />
      </div>

      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between px-10 pt-10">
        <Logo />
        <Nav />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <h1 className="font-(family-name:--font-display) text-center text-white font-black leading-[0.9] -rotate-12 text-[clamp(2.75rem,8.5vw,5rem)] [text-shadow:6px_6px_0_rgba(7,8,31,0.55)]">
          We help indie
          <br />
          games cross the
          <br />
          finish line.
        </h1>
      </div>
    </div>
  );
}
