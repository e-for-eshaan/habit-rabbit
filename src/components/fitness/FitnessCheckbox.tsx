"use client";

import { cn } from "@/lib/utils";

type FitnessCheckboxProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
  labelClassName?: string;
  accentClassName?: string;
  checkIconClassName?: string;
};

const CHECK_ICON = (
  <svg
    viewBox="0 0 12 10"
    className="h-2 w-2.5 shrink-0 stroke-current stroke-[3] sm:h-2.5 sm:w-3"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 5l3 3 7-6" />
  </svg>
);

export function FitnessCheckbox({
  id,
  checked,
  onChange,
  disabled = false,
  label,
  labelClassName,
  accentClassName = "bg-emerald-500 border-emerald-500 dark:bg-emerald-600 dark:border-emerald-600",
  checkIconClassName = "text-white",
}: FitnessCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-2 transition-opacity sm:gap-3",
        disabled && "cursor-default opacity-70"
      )}
    >
      <span className="relative flex shrink-0 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all duration-200 ease-out sm:h-5 sm:w-5 sm:rounded-md",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-stone-400 peer-focus-visible:ring-offset-1 sm:peer-focus-visible:ring-offset-2 dark:ring-offset-stone-900",
            checked
              ? accentClassName
              : "border-stone-300 bg-white dark:border-stone-600 dark:bg-stone-800"
          )}
        >
          <span
            className={cn(
              "flex items-center justify-center transition-all duration-200 ease-out",
              checkIconClassName,
              checked ? "scale-100 opacity-100" : "scale-75 opacity-0"
            )}
          >
            {CHECK_ICON}
          </span>
        </span>
        {!disabled && (
          <span
            className={cn(
              "absolute -inset-0.5 rounded-md transition-opacity duration-150 sm:-inset-1 sm:rounded-lg",
              "peer-hover:bg-stone-200/50 peer-active:bg-stone-300/50 dark:peer-hover:bg-stone-600/30 dark:peer-active:bg-stone-500/30",
              checked && "opacity-0"
            )}
          />
        )}
      </span>
      <span className={cn("select-none text-xs sm:text-sm", labelClassName)}>{label}</span>
    </label>
  );
}
