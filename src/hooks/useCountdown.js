import { useMemo } from 'react';
import { differenceInDays, format, parseISO } from 'date-fns';

export function useCountdown(examDateStr) {
  return useMemo(() => {
    if (!examDateStr) return { days: 0, formatted: '', dateLabel: '' };
    const examDate = parseISO(examDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = differenceInDays(examDate, today);
    return {
      days: Math.max(0, days),
      formatted: `${Math.max(0, days)} days to maturit\u00e0`,
      dateLabel: format(examDate, 'MMMM d, yyyy'),
    };
  }, [examDateStr]);
}
