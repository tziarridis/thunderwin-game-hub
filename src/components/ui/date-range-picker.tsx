
import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DatePickerWithRangeProps {
  date: DateRange | undefined;
  onDateChange: (range: DateRange | undefined) => void;
  className?: string;
}

export const DatePickerWithRange: React.FC<DatePickerWithRangeProps> = ({ date, onDateChange, className }) => {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const DateRangePicker: React.FC<{onUpdate: (values: {range?: DateRange}) => void}> = ({ onUpdate }) => {
  const [date, setDate] = React.useState<DateRange | undefined>(undefined);

  React.useEffect(() => {
    onUpdate({ range: date });
  }, [date, onUpdate]);

  return <DatePickerWithRange date={date} onDateChange={setDate} />;
};

export { type DateRange };
