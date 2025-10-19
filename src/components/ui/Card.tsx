import { type HTMLAttributes, type ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  noPadding?: boolean;
}

export const Card = ({
  children,
  hover = false,
  noPadding = false,
  className = "",
  ...props
}: CardProps) => {
  const baseStyles = "bg-white rounded-xl border border-gray-200";
  const hoverStyles = hover ? "transition-shadow hover:shadow-md" : "shadow-sm";
  const paddingStyles = noPadding ? "" : "p-6";

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${paddingStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const CardHeader = ({
  title,
  subtitle,
  action,
  className = "",
  ...props
}: CardHeaderProps) => {
  return (
    <div
      className={`flex items-center justify-between mb-6 ${className}`}
      {...props}
    >
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  divider?: boolean;
}

export const CardSection = ({
  children,
  title,
  divider = true,
  className = "",
  ...props
}: CardSectionProps) => {
  return (
    <div
      className={`${
        divider ? "border-t border-gray-200 pt-6 mt-6" : ""
      } ${className}`}
      {...props}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
};
