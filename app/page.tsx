import { createClient } from '@/utils/supabase/server';
import { FuturisticHero } from '@/components/landing/futuristic-hero';
import { FeaturesSection } from '@/components/landing/features-section';
import { StealthNavigation } from '@/components/landing/stealth-navigation';
import { Footer } from '@/components/landing/footer';

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
      <StealthNavigation user={user} profile={profile} />

      {/* Hero Section */}
      <FuturisticHero />

      {/* Features Section */}
      <FeaturesSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
