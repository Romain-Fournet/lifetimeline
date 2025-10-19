import { type HTMLAttributes } from "react";
import { type LucideIcon } from "lucide-react";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?:
    | "default"
    | "premium"
    | "free"
    | "success"
    | "warning"
    | "danger"
    | "info";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
}

export const Badge = ({
  children,
  variant = "default",
  size = "md",
  icon: Icon,
  className = "",
  ...props
}: BadgeProps) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full";

  const variants = {
    default: "bg-gray-100 text-gray-700",
    premium: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
    free: "bg-gray-100 text-gray-700 border border-gray-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && (
        <Icon className={`${iconSizes[size]} ${children ? "mr-1.5" : ""}`} />
      )}
      {children}
    </div>
  );
};
