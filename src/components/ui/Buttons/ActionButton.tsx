import { type LucideIcon } from "lucide-react";

interface ActionButtonProps {
  label: string;
  icon: LucideIcon;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}

export const ActionButton = ({
  label,
  icon: Icon,
  variant = "primary",
  onClick,
}: ActionButtonProps) => {
  const baseStyles =
    "px-6 py-4 rounded-xl transition-all flex items-center justify-center space-x-2 font-medium";
  const variants = {
    primary: "bg-gray-900 text-white hover:bg-gray-800",
    secondary:
      "bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300",
  };

  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]}`}>
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
};
