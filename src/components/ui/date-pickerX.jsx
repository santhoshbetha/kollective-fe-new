import * as React from "react"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePickerX({ value, onChange, placeholder = "Pick a date", className }) {
  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    try {
      return parseISO(value);
    } catch (e) {
      return undefined;
    }
  }, [value]);

  const handleSelect = (selectedDate) => {
    if (!selectedDate) {
      onChange("");
      return;
    }
    const formatted = format(selectedDate, "yyyy-MM-dd");
    onChange(formatted);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 text-text-primary focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all outline-none text-lg md:text-sm text-left flex items-center justify-between cursor-pointer",
            !value && "text-text-secondary/60",
            className
          )}
        >
          <span>{dateValue ? format(dateValue, "PPP") : placeholder}</span>
          <span className="material-symbols-outlined text-base opacity-60">calendar_month</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
