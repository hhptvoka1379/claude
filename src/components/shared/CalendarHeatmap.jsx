import { useMemo } from 'react';
import { format, subDays, parseISO } from 'date-fns';

export default function CalendarHeatmap({ data = {}, days = 60, colour = 'var(--colour-accent)' }) {
  const cells = useMemo(() => {
    const today = new Date();
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const key = format(date, 'yyyy-MM-dd');
      result.push({ date: key, value: data[key] || 0, label: format(date, 'MMM d') });
    }
    return result;
  }, [data, days]);

  const maxVal = Math.max(1, ...cells.map(c => c.value));

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
      {cells.map(cell => {
        const opacity = cell.value > 0 ? 0.2 + (cell.value / maxVal) * 0.8 : 0.06;
        return (
          <div
            key={cell.date}
            title={`${cell.label}: ${cell.value}`}
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '2px',
              background: colour,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
}
