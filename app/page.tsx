import { createClient } from '@/utils/supabase/server';
import { Footer } from '@/components/landing/footer';
import { Features } from '@/components/landing/features';
import { TopNavigation } from '@/components/layout/top-navigation';
import { Hero } from '@/components/landing/hero-section';

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await (await supabase)
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <div className='min-h-screen bg-background text-foreground overflow-hidden'>
      {/* Navigation */}
      <TopNavigation profile={profile} />

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <Features />

      {/* Footer */}
      <Footer />
    </div>
  );
}
