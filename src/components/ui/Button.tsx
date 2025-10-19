import { type LucideIcon } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      icon: Icon,
      iconPosition = "left",
      fullWidth = false,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-blue-900 text-white hover:bg-blue-800 focus:ring-blue-500",
      secondary: "bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-400",
      outline:
        "border-2 border-blue-900 text-blue-900 hover:bg-blue-50 focus:ring-blue-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2.5 text-base",
      lg: "px-6 py-3 text-lg",
    };

    const iconSizes = {
      sm: "w-4 h-4",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    };

    const widthStyle = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${
          className == "" ? variants[variant] : className
        } ${sizes[size]} ${widthStyle}`}
        disabled={disabled}
        {...props}
      >
        {Icon && iconPosition === "left" && (
          <Icon className={`${iconSizes[size]} ${children ? "mr-2" : ""}`} />
        )}
        {children}
        {Icon && iconPosition === "right" && (
          <Icon className={`${iconSizes[size]} ${children ? "ml-2" : ""}`} />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
