import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import "react-day-picker/dist/style.css"

const Calendar = ({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) => {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-bold text-text-primary",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-text-secondary rounded-md w-9 font-semibold text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-start)]:rounded-l-md [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-surface-container-high/40 [&:has([aria-selected])]:bg-surface-container-high first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          "h-9 w-9 p-0 font-normal text-text-primary aria-selected:opacity-100 hover:bg-surface-container-high rounded-lg flex items-center justify-center cursor-pointer transition-colors"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary-container text-white hover:bg-primary-container/90 hover:text-white focus:bg-primary-container focus:text-white font-bold",
        day_today: "bg-primary-container/10 text-primary-container font-bold border border-primary-container/30",
        day_outside:
          "day-outside text-text-secondary/40 aria-selected:bg-surface-container-high aria-selected:text-text-secondary/40 aria-selected:opacity-30",
        day_disabled: "text-text-secondary/20 opacity-30 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-surface-container-high aria-selected:text-text-primary",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4 text-text-primary" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4 text-text-primary" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

