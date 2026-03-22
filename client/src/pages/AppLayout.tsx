import { Outlet, NavLink } from "react-router-dom";
import {
  Radar,
  Map as MapIcon,
  BarChart3,
  Settings,
  ShieldAlert,
  LogOut,
  Flame,
} from "lucide-react";

export default function AppLayout() {
  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <nav className="w-16 lg:w-64 border-r border-border/50 bg-[#060a11] flex flex-col justify-between py-6 z-50">
        <div className="flex flex-col gap-8">
          {/* Branding */}
          <div className="flex items-center justify-center lg:justify-start lg:px-6 gap-3">
            <Radar className="h-6 w-6 text-primary animate-[spin_4s_linear_infinite]" />
            <span className="hidden lg:block font-display font-bold text-sm text-primary tracking-widest text-shadow-glow">
              ECO-WATCH
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2 px-2 lg:px-4">
            <p className="hidden lg:block px-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
              Tactical Modules
            </p>

            <NavLink
              to="/app/detect"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-none border-l-2 transition-colors ${isActive ? "bg-primary/10 border-primary text-primary" : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"}`
              }
            >
              <MapIcon className="h-5 w-5" />
              <span className="hidden lg:block font-display text-xs tracking-wider">
                OPERATIONS DESK
              </span>
            </NavLink>

            <NavLink
              to="/app/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-none border-l-2 transition-colors ${isActive ? "bg-primary/10 border-primary text-primary" : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"}`
              }
            >
              <BarChart3 className="h-5 w-5" />
              <span className="hidden lg:block font-display text-xs tracking-wider">
                ANALYTICS [DATA]
              </span>
            </NavLink>

            <NavLink
              to="/app/analysis"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-none border-l-2 transition-colors ${isActive ? "bg-primary/10 border-primary text-primary" : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"}`
              }
            >
              <Flame className="h-5 w-5" />
              <span className="hidden lg:block font-display text-xs tracking-wider">
                SEVERITY MAP [AI]
              </span>
            </NavLink>

            <NavLink
              to="/app/incidents"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-none border-l-2 transition-colors ${isActive ? "bg-primary/10 border-primary text-primary" : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"}`
              }
            >
              <ShieldAlert className="h-5 w-5" />
              <span className="hidden lg:block font-display text-xs tracking-wider">
                INCIDENTS [LOG]
              </span>
            </NavLink>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-2 lg:px-4">
          <button className="flex items-center gap-3 px-3 py-3 rounded-none border-l-2 border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors cursor-pointer text-left w-full">
            <Settings className="h-5 w-5" />
            <span className="hidden lg:block font-display text-xs tracking-wider">
              SYS. SETTINGS
            </span>
          </button>
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-3 rounded-none border-l-2 border-transparent text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden lg:block font-display text-xs tracking-wider">
              TERMINATE SESSION
            </span>
          </NavLink>
        </div>
      </nav>

      {/* Main View Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Top telemetry bar */}
        <header className="h-10 border-b border-border/50 bg-[#0a0f18] flex items-center justify-end px-4 font-mono text-[10px] text-muted-foreground gap-6 select-none z-10">
          <span>LATENCY: 12ms</span>
          <span>SEC: ENCRYPTED-256</span>
          <span className="text-primary animate-pulse">DB: CONNECTED</span>
        </header>

        {/* Content Outlet */}
        <div className="flex-1 relative overflow-hidden p-4 md:p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0a121c] via-background to-background">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
