import {
  SiteHeader,
  SiteFooter,
  HeroSection,
  UsageSection,
  FeaturesSection,
} from "@/components/landing";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />

      <main className="flex-1 mx-auto">
        <HeroSection />
        <UsageSection />
        <FeaturesSection />
      </main>

      <SiteFooter />
    </div>
  );
}
