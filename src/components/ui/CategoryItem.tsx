import { type LucideIcon } from "lucide-react";

interface CategoryItemProps {
  label: string;
  icon: LucideIcon;
  count: number;
  color: string;
}

export const CategoryItem = ({
  label,
  icon: Icon,
  count,
  color,
}: CategoryItemProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div
          className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <span className="text-lg font-semibold text-gray-900">{count}</span>
    </div>
  );
};
