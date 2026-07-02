import { createClient } from '@/lib/supabase/server';
import ThemeApplier from '@/components/theme-applier';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let accent: string | null = null;
  let font: string | null = null;
  let mode: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .schema('core')
      .from('profiles')
      .select('theme_accent, theme_font, theme_mode')
      .eq('id', user.id)
      .maybeSingle();
    accent = profile?.theme_accent ?? null;
    font = profile?.theme_font ?? null;
    mode = profile?.theme_mode ?? null;
  }

  return (
    <>
      <ThemeApplier accent={accent} font={font} mode={mode} />
      {children}
    </>
  );
}
