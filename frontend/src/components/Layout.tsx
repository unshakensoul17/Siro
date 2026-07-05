import { ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, Search, Sparkles, FileText, Building2, Send,
  BarChart3, Settings, Ghost, Bell, MessageCircle, Activity,
  ChevronRight, Cpu, Wifi, Command, LogOut,
} from "lucide-react";
import { AuthGuard } from "./AuthGuard";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: FileText, label: "Resume Studio", path: "/resume-studio" },
  { icon: Search, label: "Job Discovery", badge: "128", path: "/job-discovery" },
  { icon: Building2, label: "Company Research", path: "/company-research" },
  { icon: Send, label: "Applications", badge: "24", path: "/applications" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

function Sidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col glass-strong border-r border-white/8 z-40">
      <div className="flex items-center gap-3 px-6 h-20 border-b border-white/5">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl grid place-items-center bg-gradient-to-br from-neon-blue via-neon-purple to-neon-cyan glow-blue">
            <Ghost className="w-5 h-5 text-white" strokeWidth={2.4} />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-neon-green ring-2 ring-[#0B1020] animate-pulse-glow" />
        </div>
        <div className="min-w-0">
          <div className="font-bold tracking-tight text-[15px] leading-tight">Ghost Protocol</div>
          <div className="text-[12px] font-medium text-muted-foreground">Engine v3.2</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[12px] font-medium text-muted-foreground/60">Command</div>
        {NAV.map((item, i) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[15px] transition-all relative overflow-hidden ${
                isActive
                  ? "bg-gradient-to-r from-neon-blue/20 via-neon-purple/10 to-transparent text-white border border-neon-blue/30"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r bg-gradient-to-b from-neon-blue to-neon-purple" />
              )}
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-neon-cyan" : ""}`} />
              <span className="flex-1 text-left font-medium">{item.label}</span>
              {item.badge && (
                <span className="text-[12px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-neon-cyan">
                  {item.badge}
                </span>
              )}
              {i === 0 && (
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <div className="glass rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-3.5 h-3.5 text-neon-green" />
            <span className="text-[12px] font-mono text-muted-foreground">Engine Load</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-glow-cyan text-neon-cyan">42</span>
            <span className="text-xs text-muted-foreground">%</span>
          </div>
          <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full w-[42%] bg-gradient-to-r from-neon-blue to-neon-cyan" />
          </div>
        </div>
      </div>
    </aside>
  );
}

function StatusPill({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: "green" | "cyan" | "amber" }) {
  const dot = color === "green" ? "bg-neon-green" : color === "amber" ? "bg-neon-amber" : "bg-neon-cyan";
  return (
    <div className="hidden md:flex items-center gap-2 h-11 px-3 rounded-xl glass">
      <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse-glow`} />
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <div className="text-[13px] leading-none">
        <div className="text-muted-foreground font-mono text-[13px]">{label}</div>
        <div className="font-semibold mt-0.5">{value}</div>
      </div>
    </div>
  );
}

function TopBar() {
  const { user, signOut } = useAuth();
  
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await apiFetch("/api/settings");
      if (!res.ok) return {};
      return res.json();
    }
  });

  const { data: health } = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await apiFetch("/api/health");
      if (!res.ok) return { status: "offline" };
      return res.json();
    },
    refetchInterval: 30000,
  });

  return (
    <header className="sticky top-0 z-30 h-20 glass-strong border-b border-white/5 flex items-center gap-4 px-6">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search jobs, companies, agents…"
            className="w-full h-11 pl-10 pr-20 rounded-xl glass text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10">
            <Command className="w-3 h-3" />
            <span className="text-[12px] font-mono">K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <StatusPill 
          icon={Wifi} 
          label="Telegram" 
          value={settings?.telegram_connected ? "Synced" : "Pending"} 
          color={settings?.telegram_connected ? "green" : "amber"} 
        />
        <StatusPill 
          icon={Activity} 
          label="System" 
          value={health?.status === "ok" ? "Nominal" : "Offline"} 
          color={health?.status === "ok" ? "cyan" : "amber"} 
        />

        <div className="flex items-center gap-2 pl-2 ml-1 border-l border-white/10">
          <div className="text-right hidden xl:block">
            <div className="text-xs font-semibold leading-tight">{user?.email?.split('@')[0] || 'User'}</div>
            <div className="text-[12px] font-mono text-neon-cyan">AUTHENTICATED</div>
          </div>
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple via-neon-blue to-neon-cyan p-[1.5px] cursor-pointer" onClick={() => signOut()}>
              <div className="w-full h-full rounded-[10px] bg-[#0B1020] grid place-items-center">
                <LogOut className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-neon-green ring-2 ring-[#0B1020]" />
          </div>
        </div>
      </div>
    </header>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen text-foreground">
        <Sidebar />
        <div className="lg:pl-64">
          <TopBar />
          <main className="p-4 md:p-6 xl:p-8 space-y-6 max-w-[1800px] mx-auto">
            {children}
          </main>
        </div>
        
        {/* Ambient orbs */}
        <div className="pointer-events-none fixed -top-40 -left-40 w-96 h-96 rounded-full bg-neon-blue/15 blur-[120px]" />
        <div className="pointer-events-none fixed top-1/3 -right-40 w-96 h-96 rounded-full bg-neon-purple/15 blur-[120px]" />
        <div className="pointer-events-none fixed bottom-0 left-1/3 w-96 h-96 rounded-full bg-neon-cyan/10 blur-[120px]" />
      </div>
    </AuthGuard>
  );
}
