import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

const ip = {
  width: 15, height: 15, fill: "none", stroke: "currentColor",
  strokeWidth: 1.55, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
};

const IconGrid      = () => <svg {...ip} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
const IconBriefcase = () => <svg {...ip} viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
const IconZap       = () => <svg {...ip} viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconBarChart  = () => <svg {...ip} viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
const IconActivity  = () => <svg {...ip} viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IconTrending  = () => <svg {...ip} viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IconSparkle   = () => <svg {...ip} viewBox="0 0 24 24"><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z"/><path d="M5 3l.8 2.2L8 6l-2.2.8L5 9l-.8-2.2L2 6l2.2-.8z"/></svg>;
const IconSettings  = () => <svg {...ip} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IconChevronL  = () => <svg {...ip} viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>;
const IconChevronR  = () => <svg {...ip} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>;
const IconX         = () => <svg {...ip} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#3b82f6" fillOpacity="0.12"/>
      <rect x="4"  y="16" width="3.5" height="5"  rx="1" fill="#93c5fd" fillOpacity="0.7"/>
      <rect x="10" y="10" width="3.5" height="11" rx="1" fill="#3b82f6"/>
      <rect x="16" y="13" width="3.5" height="8"  rx="1" fill="#60a5fa" fillOpacity="0.85"/>
    </svg>
  );
}

const NAV_GROUPS = [
  {
    label: "Core",
    items: [
      { label: "Dashboard",     path: "/",               icon: <IconGrid />,      end: true  },
      { label: "Portfolio",     path: "/portfolio",      icon: <IconBriefcase />, end: false },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "Strategies",    path: "/strategies",     icon: <IconZap />,       end: false },
      { label: "Backtesting",   path: "/backtests",      icon: <IconBarChart />,  end: false },
      { label: "Paper Trading", path: "/paper-trading",  icon: <IconActivity />,  end: false },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Analytics",     path: "/analytics",      icon: <IconTrending />,  end: false },
      { label: "AI Insights",   path: "/ai-insights",    icon: <IconSparkle />,   end: false },
    ],
  },
];

function NavItem({
  to, icon, label, collapsed, end = false,
}: {
  to: string; icon: React.ReactNode; label: string; collapsed: boolean; end?: boolean;
}) {
  return (
    <NavLink to={to} end={end} className="block px-2">
      {({ isActive }) => (
        <div className={cn(
          "relative flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg",
          "text-[13px] font-medium transition-colors duration-100 cursor-pointer select-none",
          isActive
            ? "bg-blue-500/[0.12] text-blue-400"
            : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]",
          collapsed && "justify-center px-0",
        )}>
          {isActive && !collapsed && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2.5 w-[3px] h-[16px] bg-blue-400 rounded-r-full" />
          )}

          <span className={cn("shrink-0", isActive ? "text-blue-400" : "text-slate-600")}>
            {icon}
          </span>

          <AnimatePresence mode="wait" initial={false}>
            {!collapsed && (
              <motion.span
                key="label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="truncate"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}
    </NavLink>
  );
}

function GroupLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="h-3" />;
  return (
    <div className="px-4 pt-5 pb-1">
      <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-700 select-none">
        {label}
      </span>
    </div>
  );
}

interface SidebarProps {
  collapsed:     boolean;
  mobileOpen:    boolean;
  onCollapse:    () => void;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, mobileOpen, onCollapse, onMobileClose }: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 56 : 228 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex flex-col h-full shrink-0 overflow-hidden",
        "bg-[#09090e] border-r border-white/[0.06]",
        "fixed inset-y-0 left-0 z-40",
        "lg:static lg:z-auto lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        "transition-transform duration-300 lg:transition-none",
      )}
    >
      {/* Brand */}
      <div className={cn(
        "flex items-center h-[52px] shrink-0 border-b border-white/[0.06]",
        collapsed ? "justify-center" : "px-4 gap-2.5",
      )}>
        <Logo />
        <AnimatePresence mode="wait" initial={false}>
          {!collapsed && (
            <motion.span
              key="wordmark"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="text-[13px] font-bold tracking-[0.14em] uppercase text-slate-100 select-none"
            >
              QuantLab
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-1 overflow-y-auto overflow-x-hidden">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <GroupLabel label={group.label} collapsed={collapsed} />
            <div className="space-y-px">
              {group.items.map((item) => (
                <NavItem
                  key={item.path}
                  to={item.path}
                  icon={item.icon}
                  label={item.label}
                  collapsed={collapsed}
                  end={item.end}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mx-3 h-px bg-white/[0.06]" />

      {/* Bottom */}
      <div className="py-2 space-y-px">
        <NavItem
          to="/settings"
          icon={<IconSettings />}
          label="Settings"
          collapsed={collapsed}
        />

        <div className={cn(
          "flex items-center mx-2 px-2.5 py-[7px] rounded-lg",
          "hover:bg-white/[0.05] cursor-pointer transition-colors",
          collapsed ? "justify-center" : "gap-2.5",
        )}>
          <div className="w-6 h-6 rounded-full bg-blue-500/[0.15] border border-blue-500/25 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-blue-400">Q</span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {!collapsed && (
              <motion.div
                key="user"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="min-w-0 flex-1"
              >
                <p className="text-[12px] font-semibold text-slate-300 truncate leading-tight">QuantLab</p>
                <p className="text-[10px] text-slate-600 leading-tight mt-0.5">Paper Trading</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={onCollapse}
          className={cn(
            "hidden lg:flex w-full items-center mx-2 px-2.5 py-[7px] rounded-lg",
            "text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition-colors",
            collapsed ? "justify-center" : "gap-2.5",
          )}
        >
          <span className="shrink-0">{collapsed ? <IconChevronR /> : <IconChevronL />}</span>
          <AnimatePresence mode="wait" initial={false}>
            {!collapsed && (
              <motion.span
                key="collapse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="text-[12px] font-medium"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={onMobileClose}
          className="lg:hidden flex w-full items-center gap-2.5 mx-2 px-2.5 py-[7px] rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition-colors"
        >
          <IconX />
          {!collapsed && <span className="text-[12px] font-medium">Close</span>}
        </button>
      </div>
    </motion.aside>
  );
}
