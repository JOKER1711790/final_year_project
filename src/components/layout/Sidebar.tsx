import {
  Shield,
  Upload,
  BarChart3,
  History,
  Settings,
  Bell,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Shield, label: "Dashboard", path: "/" },
  { icon: Upload, label: "New Scan", path: "/scan" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: History, label: "Scan History", path: "/scan-history" },
  { icon: Bell, label: "Alerts", path: "/alerts" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-glow">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">
              SecureCheck
            </h1>
            <p className="text-xs text-muted-foreground">Security Scanner</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="glass-effect rounded-lg p-4">
          <p className="text-xs font-medium text-foreground mb-1">
            Scan Credits
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
              24
            </span>
            <span className="text-xs text-muted-foreground">/ 50</span>
          </div>
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-[48%] gradient-primary rounded-full" />
          </div>
        </div>
      </div>
    </aside>
  );
};
