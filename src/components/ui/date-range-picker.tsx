
import React from 'react';
import { DateRange as DayPickerDateRange } from 'react-day-picker';
import { DateRange as AppDateRange } from '@/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  range?: AppDateRange;
  date?: DayPickerDateRange; // Add backward compatibility
  onUpdate?: (values: { range?: AppDateRange }) => void;
  onDateChange?: (newRange: DayPickerDateRange) => void; // Add backward compatibility
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  range,
  date,
  onUpdate,
  onDateChange,
  className
}) => {
  const currentRange = range || date;
  
  const handleUpdate = (newRange?: DayPickerDateRange) => {
    if (onUpdate) {
      onUpdate({ range: newRange as AppDateRange });
    }
    if (onDateChange && newRange) {
      onDateChange(newRange);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !currentRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {currentRange?.from ? (
              currentRange.to ? (
                <>
                  {format(currentRange.from, "LLL dd, y")} -{" "}
                  {format(currentRange.to, "LLL dd, y")}
                </>
              ) : (
                format(currentRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={currentRange?.from}
            selected={currentRange as DayPickerDateRange}
            onSelect={handleUpdate}
            numberOfMonths={2}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

// Export alias for backward compatibility
export const DatePickerWithRange = DateRangePicker;
