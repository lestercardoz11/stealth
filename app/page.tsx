import { createClient } from "@/lib/supabase/server";
import { FuturisticHero } from "@/components/landing/futuristic-hero";
import { FeaturesSection } from "@/components/landing/features-section";
import { StealthNavigation } from "@/components/landing/stealth-navigation";
import { Footer } from "@/components/landing/footer";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
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