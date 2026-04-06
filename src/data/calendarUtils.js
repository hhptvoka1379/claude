import { addDays, format, parseISO, differenceInDays } from 'date-fns';

/**
 * Expand recurring events into concrete instances within a date range.
 * Non-recurring events pass through unchanged.
 */
export function expandRecurrences(events, rangeStart, rangeEnd) {
  const result = [];
  const startStr = typeof rangeStart === 'string' ? rangeStart : format(rangeStart, 'yyyy-MM-dd');
  const endStr = typeof rangeEnd === 'string' ? rangeEnd : format(rangeEnd, 'yyyy-MM-dd');

  for (const event of events) {
    if (!event.recurrence) {
      // Non-recurring: include if within range
      if (event.date >= startStr && event.date <= endStr) {
        result.push(event);
      }
      continue;
    }

    const { type, until } = event.recurrence;
    const eventStart = parseISO(event.date);
    const untilDate = until ? parseISO(until) : parseISO(endStr);
    const rangeEndDate = parseISO(endStr);
    const effectiveEnd = untilDate < rangeEndDate ? untilDate : rangeEndDate;

    const step = type === 'daily' ? 1 : 7;
    let current = eventStart;

    while (current <= effectiveEnd) {
      const dateStr = format(current, 'yyyy-MM-dd');
      if (dateStr >= startStr && dateStr <= endStr) {
        if (dateStr === event.date) {
          // Original event
          result.push(event);
        } else {
          // Generated instance
          result.push({
            ...event,
            id: `${event.id}__${dateStr}`,
            date: dateStr,
            _parentId: event.id,
            _isGenerated: true,
          });
        }
      }
      current = addDays(current, step);
    }
  }

  return result;
}

/**
 * Filter events for a specific date.
 */
export function eventsForDate(events, dateStr) {
  return events.filter(e => e.date === dateStr);
}

/**
 * Detect overlapping events in a single day and assign columns for side-by-side rendering.
 * Returns events annotated with _column (0-based) and _totalColumns.
 */
export function detectOverlaps(dayEvents) {
  // Only process scheduled events (with time_start)
  const scheduled = dayEvents
    .filter(e => e.time_start)
    .sort((a, b) => a.time_start.localeCompare(b.time_start));

  if (scheduled.length === 0) return dayEvents;

  // Convert to minutes for easier math
  function toMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  function getEnd(event) {
    return toMinutes(event.time_start) + (event.duration_minutes || 60);
  }

  // Sweep-line: assign columns
  const columns = []; // columns[i] = end time of last event in column i
  const annotated = new Map();

  for (const event of scheduled) {
    const start = toMinutes(event.time_start);

    // Find first available column
    let col = -1;
    for (let i = 0; i < columns.length; i++) {
      if (columns[i] <= start) {
        col = i;
        break;
      }
    }

    if (col === -1) {
      col = columns.length;
      columns.push(0);
    }

    columns[col] = getEnd(event);
    annotated.set(event.id, { _column: col });
  }

  const totalColumns = columns.length;

  return dayEvents.map(e => {
    const ann = annotated.get(e.id);
    if (ann) {
      return { ...e, ...ann, _totalColumns: totalColumns };
    }
    return e;
  });
}

/**
 * Convert a time string "HH:MM" to pixel offset from the top of the grid.
 */
export function timeToPixels(timeStr, pxPerHour = 48, startHour = 8) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  const hoursFromStart = h - startHour + m / 60;
  return Math.max(0, hoursFromStart * pxPerHour);
}

/**
 * Convert pixel offset to a time string, snapped to 15-minute increments.
 */
export function pixelsToTime(px, pxPerHour = 48, startHour = 8) {
  const hoursFromStart = px / pxPerHour;
  const totalMinutes = Math.round((startHour * 60 + hoursFromStart * 60) / 15) * 15;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Convert duration in minutes to pixel height.
 */
export function durationToPixels(minutes, pxPerHour = 48) {
  return (minutes / 60) * pxPerHour;
}

/**
 * Format duration for display (e.g., 90 → "1h30", 45 → "45m")
 */
export function formatDuration(minutes) {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
}
