
import * as React from "react";
import { ThemeProvider } from "./theme";
import { BuzzFormProvider } from "./buzz-form";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <BuzzFormProvider>{children}</BuzzFormProvider>
    </ThemeProvider>
  );
}
