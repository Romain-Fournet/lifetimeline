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
    "px-6 py-4 rounded-xl transition-all flex items-center justify-center space-x-2 font-medium shadow-sm hover:shadow-md";
  const variants = {
    primary: "bg-blue-900 text-white hover:bg-blue-800",
    secondary:
      "bg-teal-500 text-white hover:bg-teal-600",
  };

  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]}`}>
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
};
