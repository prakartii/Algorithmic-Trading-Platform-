import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";

interface SidebarProps {
  collapsed:     boolean;
  mobileOpen:    boolean;
  onCollapse:    () => void;
  onMobileClose: () => void;
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────

const S = "stroke-current";
const iconProps = { width: 17, height: 17, fill: "none", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const IconGrid = () => (
  <svg {...iconProps} viewBox="0 0 24 24" className={S}>
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const IconBarChart = () => (
  <svg {...iconProps} viewBox="0 0 24 24" className={S}>
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6"  y1="20" x2="6"  y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);
const IconBriefcase = () => (
  <svg {...iconProps} viewBox="0 0 24 24" className={S}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><line x1="12" y1="12" x2="12" y2="12.01" />
  </svg>
);
const IconZap = () => (
  <svg {...iconProps} viewBox="0 0 24 24" className={S}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconSettings = () => (
  <svg {...iconProps} viewBox="0 0 24 24" className={S}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const IconChevronLeft = () => (
  <svg {...iconProps} viewBox="0 0 24 24" className={S}><polyline points="15 18 9 12 15 6" /></svg>
);
const IconChevronRight = () => (
  <svg {...iconProps} viewBox="0 0 24 24" className={S}><polyline points="9 18 15 12 9 6" /></svg>
);
const IconX = () => (
  <svg {...iconProps} viewBox="0 0 24 24" className={S}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

// ── Logo mark ─────────────────────────────────────────────────────────────────

const Logo = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <rect width="26" height="26" rx="6" fill="#3b82f6" fillOpacity="0.12" />
    <rect x="4"  y="17" width="4"  height="6" rx="1" fill="#60a5fa" />
    <rect x="11" y="10" width="4"  height="13" rx="1" fill="#3b82f6" />
    <rect x="18" y="13" width="4"  height="10" rx="1" fill="#93c5fd" fillOpacity="0.75" />
  </svg>
);

// ── Nav config ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Dashboard",  path: "/",           icon: <IconGrid />       },
  { label: "Backtests",  path: "/backtests",  icon: <IconBarChart />   },
  { label: "Portfolio",  path: "/portfolio",  icon: <IconBriefcase />  },
  { label: "Strategies", path: "/strategies", icon: <IconZap />        },
] as const;

// ── NavItem ───────────────────────────────────────────────────────────────────

interface NavItemProps {
  to:        string;
  icon:      React.ReactNode;
  label:     string;
  collapsed: boolean;
  end?:      boolean;
}

function NavItem({ to, icon, label, collapsed, end }: NavItemProps) {
  return (
    <NavLink to={to} end={end} className="block">
      {({ isActive }) => (
        <div
          className={cn(
            "relative flex items-center gap-3 mx-2 px-3 py-[9px] rounded-lg",
            "text-sm font-medium transition-all duration-150 select-none cursor-pointer",
            isActive
              ? "bg-blue-500/[0.12] text-blue-400"
              : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]",
          )}
        >
          {/* Active left-bar indicator */}
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[9px] w-[3px] h-[22px] bg-blue-400 rounded-r-full" />
          )}

          <span className={cn("shrink-0 transition-colors", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")}>
            {icon}
          </span>

          {!collapsed && (
            <span className="truncate tracking-wide">{label}</span>
          )}
        </div>
      )}
    </NavLink>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export default function Sidebar({ collapsed, mobileOpen, onCollapse, onMobileClose }: SidebarProps) {
  return (
    <aside
      className={cn(
        // structure
        "flex flex-col h-full shrink-0",
        // colours
        "bg-[#0d0d1a] border-r border-[#ffffff08]",
        // mobile: fixed overlay; desktop: in-flow
        "fixed inset-y-0 left-0 z-40",
        "lg:static lg:z-auto lg:translate-x-0",
        // width
        collapsed ? "w-[60px]" : "w-[220px]",
        // mobile slide transition
        "transition-all duration-300 ease-in-out",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      {/* ── Brand ── */}
      <div className={cn(
        "flex items-center h-14 shrink-0 border-b border-[#ffffff08]",
        collapsed ? "justify-center px-0" : "px-4 gap-3",
      )}>
        <Logo />
        {!collapsed && (
          <span className="text-[13px] font-bold tracking-[0.18em] text-slate-100 uppercase select-none">
            QuantLab
          </span>
        )}
      </div>

      {/* ── Section label ── */}
      {!collapsed && (
        <div className="px-5 pt-5 pb-1">
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-600">
            Navigation
          </span>
        </div>
      )}

      {/* ── Primary nav ── */}
      <nav className="flex-1 py-2 space-y-[2px] overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.path}
            to={item.path}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
            end={item.path === "/"}
          />
        ))}
      </nav>

      {/* ── Divider ── */}
      <div className="mx-3 h-px bg-[#ffffff06]" />

      {/* ── Bottom section ── */}
      <div className="py-3 space-y-[2px]">

        {/* Settings */}
        <NavItem
          to="/settings"
          icon={<IconSettings />}
          label="Settings"
          collapsed={collapsed}
        />

        {/* User / account strip */}
        <div className={cn(
          "flex items-center mx-2 px-3 py-[9px] rounded-lg",
          "hover:bg-white/[0.04] cursor-pointer transition-colors group",
          collapsed ? "justify-center" : "gap-3",
        )}>
          <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-blue-500/30 to-violet-500/30 border border-blue-500/25 flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-blue-400">Q</span>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-300 truncate leading-tight">QuantLab</p>
              <p className="text-[10px] text-slate-600 truncate leading-tight mt-px">Paper Trading</p>
            </div>
          )}
        </div>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={onCollapse}
          className={cn(
            "hidden lg:flex w-full items-center mx-2 px-3 py-[9px] rounded-lg",
            "text-slate-600 hover:text-slate-300 hover:bg-white/[0.04] transition-colors",
            collapsed ? "justify-center" : "gap-3",
          )}
        >
          <span className="shrink-0">
            {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
          </span>
          {!collapsed && (
            <span className="text-xs font-medium tracking-wide">Collapse</span>
          )}
        </button>

        {/* Close — mobile only */}
        <button
          onClick={onMobileClose}
          className="lg:hidden flex w-full items-center gap-3 mx-2 px-3 py-[9px] rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.04] transition-colors"
        >
          <IconX />
          {!collapsed && <span className="text-xs font-medium">Close</span>}
        </button>

      </div>
    </aside>
  );
}
