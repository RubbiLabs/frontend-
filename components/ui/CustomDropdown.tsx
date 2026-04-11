"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option<T = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps<T = string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export default function CustomDropdown<T extends string | number = string>({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
  className = "",
  disabled = false,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">{label}</p>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className={`
          w-full flex items-center justify-between gap-2 px-4 py-2.5
          bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-800
          hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20
          transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
          ${open ? "border-primary ring-2 ring-primary/20" : ""}
        `}
      >
        <span className="flex items-center gap-2 min-w-0">
          {selected?.icon && <span className="shrink-0">{selected.icon}</span>}
          <span className={selected ? "text-neutral-900" : "text-neutral-400"}>
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-neutral-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden animate-slideDown">
          {options.map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-neutral-50 transition-colors text-left"
            >
              {opt.icon && <span className="shrink-0 text-neutral-500">{opt.icon}</span>}
              <span className={opt.value === value ? "text-primary font-semibold" : "text-neutral-700"}>
                {opt.label}
              </span>
              {opt.value === value && <Check size={14} className="ml-auto text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
