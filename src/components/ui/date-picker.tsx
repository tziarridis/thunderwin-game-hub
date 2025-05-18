
import React from 'react';
import { Input } from './input'; // Assuming input exists
import { cn } from '@/lib/utils'; // For className utilities
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react'; // Using lucide icon
import { Calendar } from '@/components/ui/calendar'; // Assuming shadcn calendar exists
import { format } from 'date-fns';

interface DatePickerProps {
  selected?: Date;
  onSelect: (date?: Date) => void;
  mode?: 'single';
  className?: string;
  disabled?: (date: Date) => boolean | { before?: Date; after?: Date; } ; // Match shadcn Calendar
  initialFocus?: boolean;
  // Added to match usage in KycForm
  value?: Date; 
  onChange?: (date?: Date) => void; 
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selected,
  onSelect,
  className,
  mode = "single",
  disabled,
  initialFocus,
  value, // from KycForm
  onChange, // from KycForm
}) => {
  const [date, setDate] = React.useState<Date | undefined>(selected || value);

  const handleSelectDate = (selectedDate?: Date) => {
    setDate(selectedDate);
    if (onSelect) {
      onSelect(selectedDate);
    }
    if (onChange) { // Support onChange for compatibility with RHF
      onChange(selectedDate);
    }
  };
  
  React.useEffect(() => {
    // Sync with external value changes
    if (value !== undefined && value !== date) {
        setDate(value);
    }
  }, [value, date]);


  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode={mode}
          selected={date}
          onSelect={handleSelectDate}
          disabled={disabled as any} // Cast as any to handle different disabled prop types
          initialFocus={initialFocus}
          className="pointer-events-auto" // Ensure calendar is interactive
        />
      </PopoverContent>
    </Popover>
  );
};

