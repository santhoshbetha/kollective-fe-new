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

export function DatePicker() {
    const [date, setDate] = React.useState(new Date())

    return (
        <Popover>
            <PopoverTrigger
                render={
                    <Button variant={"outline"} data-empty={!date}
                        className="w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground">
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                        <ChevronDownIcon data-icon="inline-end " />
                    </Button>
                } />
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    defaultMonth={date}
                />
            </PopoverContent>
        </Popover>
    )
}
