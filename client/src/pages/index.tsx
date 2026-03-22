import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { Radar } from "lucide-react";
import { Button } from "../components/ui/button";
import EarthGlobe from "../components/EarthGlobe";

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col justify-between">
      {/* Structural Grid Overlays */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-primary/20" />
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-primary/20" />
      <div className="absolute inset-y-0 left-8 w-[1px] bg-primary/10" />
      <div className="absolute inset-y-0 right-8 w-[1px] bg-primary/10" />

      {/* Header / Top Bar nav simulation */}
      <header className="h-16 border-b border-border/50 flex items-center justify-between px-8 z-20 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Radar className="h-5 w-5 text-primary" />
          <span className="font-display font-bold text-sm text-primary tracking-widest">ECO-WATCH // GLOBAL COMMAND</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
          <span>SYS.LAT: 45.92</span>
          <span>SYS.LNG: -12.44</span>
          <span className="text-primary animate-pulse">STATUS: ONLINE</span>
        </div>
      </header>

      {/* Main Content Split */}
      <main className="flex-1 flex flex-col lg:flex-row relative z-10 w-full overflow-hidden">

        {/* Left Data Pane */}
        <div className="w-full lg:w-[400px] xl:w-[500px] border-r border-border/50 p-8 lg:p-12 flex flex-col justify-center bg-black/20 backdrop-blur-sm z-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 border border-primary/40 bg-primary/5 px-2 py-1 text-xs font-mono text-primary shadow-[0_0_10px_rgba(6,182,212,0.15)]">
              <span className="h-1.5 w-1.5 bg-primary rounded-none animate-[pulse-glow_2s_infinite]" />
              AUTHORIZATION REQUIRED
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white uppercase" style={{ textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
              SATELLITE <br />
              TELEMETRY <br />
              <span className="text-primary font-display font-bold">INTELLIGENCE</span>
            </h1>

            <p className="text-sm text-muted-foreground mb-10 max-w-sm leading-relaxed border-l-2 border-primary/40 pl-4">
              Access real-time global deforestation monitoring, automated NDVI difference processing,
              and carbon impact estimations. Tactical analysis only.
            </p>

            <div className="space-y-4 font-mono text-xs max-w-sm mb-12">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">ACTIVE NODES</span>
                <span className="text-white">1,402</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">LATEST SCAN</span>
                <span className="text-white">-0.4 hrs</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">GLOBAL THREAT LEVEL</span>
                <span className="text-accent animate-pulse">ELEVATED</span>
              </div>
            </div>

            <div className="flex gap-4">
              <NavLink to="/app/detect">
                <Button size="lg" className="bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-primary-foreground font-display text-sm tracking-wider px-10 h-14 transition-all rounded-none shadow-glow">
                  INITIALIZE PLATFORM
                </Button>
              </NavLink>
            </div>
          </motion.div>
        </div>

        {/* Right Globe Pane */}
        <div className="flex-1 relative bg-gradient-hero flex items-center justify-center min-h-[500px]">

          {/* Tactical Overlay Elements */}
          <div className="absolute top-8 right-8 font-mono text-xs text-primary/60 text-right pointer-events-none hidden md:block">
            [ TARGET ACQUISITION ]<br />
            AZ: 144.2 DEG<br />
            EL: 45.0 DEG<br />
            RNG: 6,371 KM
          </div>
          <div className="absolute bottom-8 left-8 font-mono text-[10px] text-muted-foreground pointer-events-none opacity-50 hidden md:block">
            0000 0101 1100 1111 <br />
            1101 0000 0011 1010
          </div>

          {/* Crosshair Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 pointer-events-none opacity-30 z-20">
            <div className="absolute top-0 left-1/2 w-[1px] h-4 bg-primary" />
            <div className="absolute bottom-0 left-1/2 w-[1px] h-4 bg-primary" />
            <div className="absolute top-1/2 left-0 w-4 h-[1px] bg-primary" />
            <div className="absolute top-1/2 right-0 w-4 h-[1px] bg-primary" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full max-w-[800px] aspect-square relative z-10"
          >
            {/* The globe handles internal resizing, but wrapping it constrains it to view */}
            <div className="absolute inset-0 saturate-50 contrast-125 hue-rotate-15">
              <EarthGlobe />
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer Data ticker */}
      <footer className="h-8 border-t border-border/50 flex items-center px-8 bg-black/40 backdrop-blur-md overflow-hidden text-[10px] font-mono whitespace-nowrap text-muted-foreground z-20">
        <span className="text-primary mr-4 font-bold">LIVE FEED &gt;</span>
        <div className="flex-1 overflow-hidden relative h-full flex items-center">
          <div className="animate-[scroll_20s_linear_infinite] whitespace-nowrap tracking-widest text-[#c8d4df] flex gap-16">
            <span>AMZ-1 DETECTED: 12,400 HA CLEARING &nbsp;|&nbsp; SEA-1: HIGH SEVERITY EXPANSION IDENTIFIED &nbsp;|&nbsp; AFR-1: MEDIUM SEVERITY LOGGING &nbsp;|&nbsp; CONNECTION SECURE &nbsp;|&nbsp; SATELLITE LINK OPTIMAL</span>
            <span>AMZ-1 DETECTED: 12,400 HA CLEARING &nbsp;|&nbsp; SEA-1: HIGH SEVERITY EXPANSION IDENTIFIED &nbsp;|&nbsp; AFR-1: MEDIUM SEVERITY LOGGING &nbsp;|&nbsp; CONNECTION SECURE &nbsp;|&nbsp; SATELLITE LINK OPTIMAL</span>
          </div>
        </div>
      </footer>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
