import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export const StatsCard = ({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
}: StatsCardProps) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div
        className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center mb-4`}
      >
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
};
