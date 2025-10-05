import { 
  addDays, 
  addWeeks, 
  addMonths, 
  addYears, 
  isSameDay, 
  isBefore, 
  isAfter, 
  isWeekend, 
  getDay, 
  getDate, 
  getWeekOfMonth, 
  getDaysInMonth, 
  setDate, 
  setMonth, 
  setYear, 
  parseISO, 
  format 
} from 'date-fns';

/**
 * Generate recurring events based on the specified pattern
 * @param {Object} options - The recurrence options
 * @param {Date} options.start - The start date of the first event
 * @param {Date} options.end - The end date of the first event
 * @param {string} options.recurrenceType - Type of recurrence (daily, weekly, monthly, yearly, custom)
 * @param {number} options.interval - Interval between occurrences
 * @param {number[]} options.daysOfWeek - Days of the week (0-6, where 0 is Sunday)
 * @param {string} options.recurrenceEndType - When the recurrence ends (never, after, on_date)
 * @param {number} [options.occurrences] - Number of occurrences (if recurrenceEndType is 'after')
 * @param {Date} [options.endOnDate] - End date (if recurrenceEndType is 'on_date')
 * @param {string} [options.monthlyType] - For monthly: 'day_of_month' or 'day_of_week'
 * @param {boolean} [options.skipHolidays] - Whether to skip holidays
 * @param {boolean} [options.skipWeekends] - Whether to skip weekends
 * @param {Date[]} [holidays=[]] - Array of holiday dates to skip
 * @param {number} [maxCount=365] - Maximum number of events to generate (safety limit)
 * @returns {Array} Array of event objects with start and end dates
 */
export function generateRecurringEvents(options, holidays = [], maxCount = 365) {
  const {
    start,
    end,
    recurrenceType,
    interval = 1,
    daysOfWeek = [],
    recurrenceEndType = 'never',
    occurrences,
    endOnDate,
    monthlyType = 'day_of_month',
    skipHolidays = false,
    skipWeekends = false,
  } = options;

  if (!start || !end || !recurrenceType) {
    return [];
  }

  const events = [];
  let currentDate = new Date(start);
  let currentEnd = new Date(end);
  let count = 0;
  const duration = end.getTime() - start.getTime();

  // Helper to check if a date should be included
  const shouldIncludeDate = (date) => {
    if (skipWeekends && isWeekend(date)) {
      return false;
    }
    
    if (skipHolidays && holidays.some(holiday => isSameDay(holiday, date))) {
      return false;
    }
    
    return true;
  };

  // Helper to get the next occurrence date based on the recurrence pattern
  const getNextDate = (current, firstIteration = false) => {
    if (firstIteration) {
      return new Date(current);
    }

    const nextDate = new Date(current);
    
    switch (recurrenceType) {
      case 'daily':
        return addDays(nextDate, interval);
        
      case 'weekly':
        if (daysOfWeek.length === 0) {
          return addWeeks(nextDate, interval);
        }
        
        // Find the next selected day of the week
        const currentDay = getDay(nextDate);
        const nextDays = daysOfWeek.filter(day => day > currentDay);
        
        if (nextDays.length > 0) {
          // Next day in the same week
          return addDays(nextDate, nextDays[0] - currentDay);
        } else {
          // First day in the next interval
          const daysUntilFirstDay = 7 - currentDay + daysOfWeek[0] + (interval - 1) * 7;
          return addDays(nextDate, daysUntilFirstDay);
        }
        
      case 'monthly':
        if (monthlyType === 'day_of_month') {
          // Same day of the month (e.g., 15th of each month)
          return addMonths(nextDate, interval);
        } else {
          // Same day of week (e.g., second Tuesday of each month)
          const dayOfMonth = getDate(nextDate);
          const weekOfMonth = Math.ceil(dayOfMonth / 7);
          const dayOfWeek = getDay(nextDate);
          
          // Move to the same day of week in the next interval month
          let nextMonth = addMonths(nextDate, interval);
          
          // Find the nth occurrence of the day of week in the month
          let targetDate = 1;
          let firstDayOfMonth = new Date(nextMonth);
          firstDayOfMonth.setDate(1);
          
          // Find first occurrence of the target day of week
          while (getDay(firstDayOfMonth) !== dayOfWeek) {
            firstDayOfMonth = addDays(firstDayOfMonth, 1);
            targetDate++;
          }
          
          // Add weeks to get to the correct week
          targetDate += (weekOfMonth - 1) * 7;
          
          // Adjust if we went to the next month
          const daysInMonth = getDaysInMonth(nextMonth);
          if (targetDate > daysInMonth) {
            targetDate = daysInMonth;
            
            // Make sure it's still the correct day of week
            const lastDay = new Date(nextMonth);
            lastDay.setDate(targetDate);
            
            while (getDay(lastDay) !== dayOfWeek && targetDate > 0) {
              targetDate--;
              lastDay.setDate(targetDate);
            }
          }
          
          nextMonth.setDate(targetDate);
          return nextMonth;
        }
        
      case 'yearly':
        // Same date each year
        return addYears(nextDate, interval);
        
      default:
        return null;
    }
  };

  // Check if we should stop generating events
  const shouldStop = (currentDate, count) => {
    // Stop if we've reached the maximum number of events
    if (count >= maxCount) {
      return true;
    }
    
    // Check if we've reached the end date
    if (recurrenceEndType === 'on_date' && endOnDate && isAfter(currentDate, endOnDate)) {
      return true;
    }
    
    // Check if we've reached the maximum number of occurrences
    if (recurrenceEndType === 'after' && count >= occurrences) {
      return true;
    }
    
    return false;
  };

  // Generate the events
  while (count < maxCount) {
    // Check if we should include this date
    if (shouldIncludeDate(currentDate)) {
      const eventEnd = new Date(currentDate.getTime() + duration);
      
      events.push({
        start: new Date(currentDate),
        end: eventEnd,
        isRecurring: true,
        recurrenceId: start.toISOString(),
        recurrenceRule: generateRRule({
          start,
          end,
          recurrenceType,
          interval,
          daysOfWeek,
          recurrenceEndType,
          occurrences,
          endOnDate,
          monthlyType,
        })
      });
      
      count++;
      
      // Check if we should stop after this event
      if (shouldStop(currentDate, count)) {
        break;
      }
    }
    
    // Get the next date
    const nextDate = getNextDate(currentDate, count === 0);
    
    // If we couldn't calculate the next date, stop
    if (!nextDate || nextDate.getTime() === currentDate.getTime()) {
      break;
    }
    
    currentDate = nextDate;
    currentEnd = new Date(currentDate.getTime() + duration);
  }

  return events;
}

/**
 * Generate an iCalendar RRULE string from recurrence options
 * @param {Object} options - The recurrence options
 * @returns {string} The RRULE string
 */
export function generateRRule(options) {
  const {
    recurrenceType,
    interval = 1,
    daysOfWeek = [],
    recurrenceEndType,
    occurrences,
    endOnDate,
  } = options;

  if (!recurrenceType || recurrenceType === 'none') {
    return '';
  }

  const parts = [];
  
  // Frequency
  let freq;
  switch (recurrenceType) {
    case 'daily':
      freq = 'DAILY';
      break;
    case 'weekly':
      freq = 'WEEKLY';
      break;
    case 'monthly':
      freq = 'MONTHLY';
      break;
    case 'yearly':
      freq = 'YEARLY';
      break;
    default:
      return '';
  }
  
  parts.push(`FREQ=${freq}`);
  
  // Interval
  if (interval > 1) {
    parts.push(`INTERVAL=${interval}`);
  }
  
  // Days of week (for weekly)
  if (recurrenceType === 'weekly' && daysOfWeek.length > 0) {
    const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const days = daysOfWeek.map(day => dayMap[day]).join(',');
    parts.push(`BYDAY=${days}`);
  }
  
  // End condition
  if (recurrenceEndType === 'after' && occurrences) {
    parts.push(`COUNT=${occurrences}`);
  } else if (recurrenceEndType === 'on_date' && endOnDate) {
    parts.push(`UNTIL=${format(endOnDate, 'yyyyMMdd')}T000000Z`);
  }
  
  return `RRULE:${parts.join(';')}`;
}

/**
 * Parse an RRULE string into recurrence options
 * @param {string} rrule - The RRULE string
 * @returns {Object} The recurrence options
 */
export function parseRRule(rrule) {
  if (!rrule || !rrule.startsWith('RRULE:')) {
    return null;
  }

  const options = {
    recurrenceType: 'none',
    interval: 1,
    daysOfWeek: [],
    recurrenceEndType: 'never',
  };

  const parts = rrule.substring(6).split(';');
  
  for (const part of parts) {
    const [key, value] = part.split('=');
    if (!key || !value) continue;

    switch (key) {
      case 'FREQ':
        options.recurrenceType = value.toLowerCase();
        break;
        
      case 'INTERVAL':
        options.interval = parseInt(value, 10) || 1;
        break;
        
      case 'BYDAY':
        if (value) {
          const dayMap = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
          options.daysOfWeek = value.split(',')
            .map(day => dayMap[day])
            .filter(day => day !== undefined);
        }
        break;
        
      case 'COUNT':
        options.recurrenceEndType = 'after';
        options.occurrences = parseInt(value, 10);
        break;
        
      case 'UNTIL':
        options.recurrenceEndType = 'on_date';
        // Parse the UNTIL date (format: yyyyMMddTHHmmssZ)
        const year = parseInt(value.substring(0, 4), 10);
        const month = parseInt(value.substring(4, 6), 10) - 1; // 0-indexed
        const day = parseInt(value.substring(6, 8), 10);
        options.endOnDate = new Date(Date.UTC(year, month, day));
        break;
    }
  }

  return options;
}

/**
 * Check if a date matches a recurrence pattern
 * @param {Date} date - The date to check
 * @param {Object} event - The recurring event
 * @param {Date[]} [exceptions=[]] - Array of exception dates
 * @returns {boolean} True if the date matches the recurrence pattern
 */
export function isRecurringDate(date, event, exceptions = []) {
  if (!event.recurrenceRule) {
    return false;
  }
  
  // Check if this is an exception
  if (exceptions.some(exception => isSameDay(exception, date))) {
    return false;
  }
  
  // Parse the RRULE
  const options = parseRRule(event.recurrenceRule);
  if (!options) {
    return false;
  }
  
  // For simplicity, we'll generate a limited set of occurrences and check if the date is in the set
  // In a production app, you'd want a more efficient algorithm
  const occurrences = generateRecurringEvents({
    start: new Date(event.start),
    end: new Date(event.end),
    ...options
  }, [], 1000); // Limit to 1000 occurrences for performance
  
  return occurrences.some(occurrence => isSameDay(occurrence.start, date));
}

/**
 * Get all occurrences of a recurring event within a date range
 * @param {Object} event - The recurring event
 * @param {Date} rangeStart - Start of the date range
 * @param {Date} rangeEnd - End of the date range
 * @param {Date[]} [exceptions=[]] - Array of exception dates
 * @returns {Array} Array of event occurrences within the range
 */
export function getOccurrencesInRange(event, rangeStart, rangeEnd, exceptions = []) {
  if (!event.recurrenceRule) {
    // Not a recurring event, check if it's within the range
    const start = new Date(event.start);
    const end = new Date(event.end);
    
    if ((start >= rangeStart && start <= rangeEnd) || 
        (end >= rangeStart && end <= rangeEnd) ||
        (start <= rangeStart && end >= rangeEnd)) {
      return [{
        ...event,
        isRecurring: false,
        isOccurrence: true,
        originalEventId: event.id
      }];
    }
    return [];
  }
  
  // Parse the RRULE
  const options = parseRRule(event.recurrenceRule);
  if (!options) {
    return [];
  }
  
  // Generate occurrences within an expanded range to handle timezones and all-day events
  const expandedStart = new Date(rangeStart);
  const expandedEnd = new Date(rangeEnd);
  expandedStart.setDate(expandedStart.getDate() - 1);
  expandedEnd.setDate(expandedEnd.getDate() + 1);
  
  // Generate occurrences
  const allOccurrences = generateRecurringEvents({
    start: new Date(event.start),
    end: new Date(event.end),
    ...options,
    // Override end date to limit the range
    recurrenceEndType: 'on_date',
    endOnDate: expandedEnd
  }, exceptions, 1000); // Limit to 1000 occurrences for performance
  
  // Filter to the requested range and format as events
  return allOccurrences
    .filter(occurrence => {
      const start = new Date(occurrence.start);
      const end = new Date(occurrence.end);
      
      return (
        (start >= expandedStart && start <= expandedEnd) || 
        (end >= expandedStart && end <= expandedEnd) ||
        (start <= expandedStart && end >= expandedEnd)
      );
    })
    .map(occurrence => ({
      ...event,
      id: `${event.id}_${occurrence.start.getTime()}`,
      start: occurrence.start,
      end: occurrence.end,
      isRecurring: true,
      isOccurrence: true,
      originalEventId: event.id,
      recurrenceId: event.recurrenceId || event.id
    }));
}
