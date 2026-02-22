import { Routes, Route } from "react-router";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/sonner";

// Pages
import LandingPage from "@/app/pages/landing";
import PrivacyPage from "@/app/privacy/page";
import TermsPage from "@/app/terms/page";
import ExamplesLayout from "@/app/examples/layout";
import ExamplesPage from "@/app/examples/page";
import ExamplePage from "@/app/examples/[slug]/page";
import BuilderLayout from "@/app/(builder)/(pages)/layout";
import BuilderPage from "@/app/(builder)/(pages)/builder/page";

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Providers>
        {children}
        <Toaster position="bottom-right" richColors />
      </Providers>
    </div>
  );
}

export function App() {
  return (
    <RootLayout>
      <Routes>
        <Route index element={<LandingPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route
          path="examples"
          element={
            <ExamplesLayout>
              <ExamplesPage />
            </ExamplesLayout>
          }
        />
        <Route
          path="examples/:slug"
          element={
            <ExamplesLayout>
              <ExamplePage />
            </ExamplesLayout>
          }
        />
        <Route
          path="builder"
          element={
            <BuilderLayout>
              <BuilderPage />
            </BuilderLayout>
          }
        />
      </Routes>
    </RootLayout>
  );
}
