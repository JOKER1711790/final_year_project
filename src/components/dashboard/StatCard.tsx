import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
}

export const StatCard = ({ icon: Icon, label, value, change, trend }: StatCardProps) => {
  return (
    <Card className="gradient-card shadow-card border-border/50 p-6 hover:shadow-glow transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-foreground mb-2">{value}</h3>
          {change && (
            <p
              className={`text-xs font-medium ${
                trend === "up" ? "text-success" : "text-destructive"
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </Card>
  );
};
