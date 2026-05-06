import { cn } from "@/lib/utils"

import Spinner from "@/icons/spinner"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "tonal" | "text" | "destructive"
  size?: "small" | "large"
  loading?: boolean
  isLoading?: boolean
  "data-testid"?: string
}

export function Button({
  children,
  variant = "filled",
  size = "small",
  loading = false,
  isLoading: isLoadingProp,
  disabled = false,
  className,
  "data-testid": dataTestId,
  ...props
}: ButtonProps) {
  const isLoadingValue = isLoadingProp ?? loading;
  const baseClasses =
    "text-md font-semibold rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"

  const variantClasses = {
    filled: `bg-brand-400 text-white shadow-sm hover:bg-brand-500 hover:shadow-md active:scale-95 border-b-2 border-brand-600`,
    tonal:
      "bg-secondary-50 text-secondary-700 hover:bg-secondary-100 border border-secondary-200 active:scale-95",
    text: "bg-transparent hover:bg-surface-100 text-primary active:scale-95",
    destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-95",
  }

  const sizeClasses = {
    small: "px-4 py-2 text-sm",
    large: "px-8 py-3 text-base shadow-md hover:shadow-lg",
  }

  return (
    <button
      disabled={disabled || isLoadingValue}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      data-testid={dataTestId ?? `button-${variant}-${size}`}
      {...props}
    >
      {isLoadingValue ? (
        <div className="flex items-center gap-2">
          <Spinner size={18} />
          <span>{children}</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}
