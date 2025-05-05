import React from "react";

/**
 * Button component for consistent styling across the application
 *
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant (primary, secondary, danger, etc.)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {Function} props.onClick - Click handler function
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 */
const Button = ({
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  children,
  className = "",
  ...rest
}) => {
  // Base classes for all buttons
  const baseClasses =
    "inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md";

  // Size-specific classes
  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  // Variant-specific classes
  const variantClasses = {
    primary:
      "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white disabled:bg-blue-300",
    secondary:
      "bg-white border border-gray-300 hover:bg-gray-50 focus:ring-blue-500 text-gray-700 disabled:bg-gray-100 disabled:text-gray-400",
    danger:
      "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white disabled:bg-red-300",
    success:
      "bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white disabled:bg-green-300",
    gradient:
      "bg-gradient-to-tl from-blue-500 to-violet-500 text-white hover:from-blue-600 hover:to-violet-600 focus:ring-blue-500 disabled:opacity-70",
  };

  // Determine which classes to apply
  const classes = [
    baseClasses,
    sizeClasses[size] || sizeClasses.md,
    variantClasses[variant] || variantClasses.primary,
    className,
  ].join(" ");

  return (
    <button className={classes} disabled={disabled} onClick={onClick} {...rest}>
      {children}
    </button>
  );
};

export default Button;
