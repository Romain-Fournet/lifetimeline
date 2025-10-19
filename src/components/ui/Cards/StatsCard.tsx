import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "teal" | "blue" | "emerald" | "amber";
}

export const StatsCard = ({
  label,
  value,
  icon: Icon,
  variant = "teal",
}: StatsCardProps) => {
  // Couleurs selon le design system Tech & Confiance
  const variants = {
    teal: {
      bg: "bg-teal-50",
      icon: "text-teal-600",
    },
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-900",
    },
    emerald: {
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
    },
    amber: {
      bg: "bg-amber-50",
      icon: "text-amber-600",
    },
  };

  const colors = variants[variant];

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div
        className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-4`}
      >
        <Icon className={`w-6 h-6 ${colors.icon}`} />
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
};
