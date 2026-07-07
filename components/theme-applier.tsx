'use client';

import { useEffect } from 'react';

export const ACCENTS: Record<string, string> = {
  gold: '#C99A5B',
  rose: '#C17B8D',
  green: '#5FA779',
  orange: '#D99A5B',
  violet: '#9A7BC1',
  blue: '#6C93B8',
};

export default function ThemeApplier(props: { accent: string | null; font: string | null; mode: string | null }) {
  useEffect(() => {
    const color = ACCENTS[props.accent || 'gold'] || ACCENTS.gold;
    document.documentElement.style.setProperty('--gold', color);
    document.body.classList.toggle('font-modern', props.font === 'modern');
    document.body.classList.toggle('theme-light', props.mode === 'light');
  }, [props.accent, props.font, props.mode]);

  return null;
}
