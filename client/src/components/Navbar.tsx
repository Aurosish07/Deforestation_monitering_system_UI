import { NavLink } from "react-router-dom";
import { useState } from "react";
import { TreePine, Menu, X, Satellite } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/button";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-green shadow-glow">
            <TreePine className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Eco<span className="text-forest">Watch</span>
          </span>
        </NavLink>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { to: "/", label: "Home", exact: true },
            { to: "/dashboard", label: "Dashboard" },
            { to: "/dashboard#global", label: "Global View" },
            { to: "/dashboard#compare", label: "Compare" },
          ].map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">Live</span>
          </div>
          <NavLink to="/dashboard">
            <Button variant="default" size="sm" className="bg-gradient-green border-0 shadow-glow font-display">
              <Satellite className="mr-2 h-4 w-4" />
              Open Dashboard
            </Button>
          </NavLink>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-card border-b border-border"
          >
            <nav className="container mx-auto flex flex-col gap-1 px-4 py-4">
              {[
                { to: "/", label: "Home", exact: true },
                { to: "/dashboard", label: "Dashboard" },
              ].map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.exact}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-md text-sm font-medium ${
                      isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
