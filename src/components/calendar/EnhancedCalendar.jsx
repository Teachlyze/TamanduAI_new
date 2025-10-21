import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';

const EnhancedCalendar = ({
  mode = 'single',
  selected,
  onSelect,
  className,
  ...props
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add padding days for the beginning of the month
  const startPadding = monthStart.getDay();
  const paddedDays = Array(startPadding).fill(null).concat(calendarDays);

  const handleDateClick = (date) => {
    if (!date) return;

    if (mode === 'single') {
      onSelect?.(date);
    } else if (mode === 'multiple') {
      // Handle multiple selection logic here if needed
      onSelect?.(date);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const isSelected = (date) => {
    if (!selected || !date) return false;
    return isSameDay(selected, date);
  };

  return (
    <div className={cn("p-3 bg-white border rounded-lg shadow-lg", className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h2 className="text-sm font-semibold text-gray-900">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </h2>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div
            key={day}
            className="h-8 w-8 flex items-center justify-center text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {paddedDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-8 w-8" />;
          }

          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isSelectedDate = isSelected(date);
          const isToday = isSameDay(date, new Date());

          return (
            <Button
              key={date.toISOString()}
              variant="ghost"
              size="sm"
              onClick={() => handleDateClick(date)}
              className={cn(
                "h-8 w-8 p-0 text-xs font-normal hover:bg-blue-100 hover:text-blue-900 transition-all relative",
                !isCurrentMonth && "text-gray-300 hover:text-gray-400",
                isToday && !isSelectedDate && "bg-blue-600 text-white hover:bg-blue-700 hover:text-white font-bold ring-4 ring-blue-200 dark:ring-blue-800 shadow-lg scale-105",
                isSelectedDate && !isToday && "bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 font-semibold ring-2 ring-blue-300 dark:ring-blue-700",
                isSelectedDate && isToday && "bg-blue-600 text-white hover:bg-blue-700 hover:text-white font-bold ring-4 ring-blue-300 dark:ring-blue-800 shadow-lg scale-110"
              )}
            >
              {format(date, 'd')}
              {isToday && !isSelectedDate && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-[8px] whitespace-nowrap">Hoje</span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default EnhancedCalendar;
