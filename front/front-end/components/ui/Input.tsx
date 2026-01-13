import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </label>
        <input
          ref={ref}
          className={`
            w-full px-3 py-2 bg-white dark:bg-zinc-950 border rounded-lg shadow-sm outline-none transition-all
            placeholder:text-gray-400 dark:placeholder:text-zinc-500
            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-200 dark:border-zinc-800"
            }
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
