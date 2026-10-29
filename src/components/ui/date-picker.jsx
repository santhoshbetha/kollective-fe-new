"use client"

import * as React from "react"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "./button"
import { Calendar } from "./calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./popover"

import { parseISO } from "date-fns"
import { cn } from "@/lib/utils"

export function DatePicker({ value, onChange, placeholder = "Pick a date", className, "data-testid": testId }) {
    const [open, setOpen] = React.useState(false)

    const dateValue = React.useMemo(() => {
        if (!value) return undefined
        if (value instanceof Date) return value
        try {
            return parseISO(value)
        } catch {
            return undefined
        }
    }, [value])

    const handleSelect = (selectedDate) => {
        if (!selectedDate) {
            onChange?.("")
            setOpen(false)
            return
        }
        const formatted = format(selectedDate, "yyyy-MM-dd")
        onChange?.(formatted)
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant={"outline"}
                    data-testid={testId || "date-picker-trigger"}
                    data-empty={!value}
                    className={cn(
                        "w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground",
                        className
                    )}
                >
                    <span>{dateValue ? format(dateValue, "PPP") : placeholder}</span>
                    <ChevronDownIcon className="w-4 h-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50 bg-[#141414] border border-white/10" align="start">
                <Calendar
                    mode="single"
                    selected={dateValue}
                    onSelect={handleSelect}
                    initialFocus
                />
                <div className="p-2 border-t border-white/10 flex justify-end gap-2">
                    <button
                        type="button"
                        data-testid="pick-today-btn"
                        className="text-xs text-text-secondary hover:underline px-2 py-1 font-mono cursor-pointer bg-transparent border-none"
                        onClick={() => handleSelect(new Date())}
                    >
                        Today
                    </button>
                    <button
                        type="button"
                        data-testid="pick-future-btn"
                        className="text-xs text-primary-container hover:underline px-2 py-1 font-mono cursor-pointer bg-transparent border-none"
                        onClick={() => {
                            const future = new Date();
                            future.setDate(future.getDate() + 3);
                            handleSelect(future);
                        }}
                    >
                        In 3 Days
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
