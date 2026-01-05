"use client";

import React from "react";
import { FormConfigContext } from "../context/form-context";
import type { FormConfig } from "../types";

/**
 * Provider for global form configuration.
 * Set the adapter, resolver, and default mode for all forms in the app.
 *
 * @example
 * import { FormProvider } from '@buildnbuzz/buzzform';
 * import { useRhfAdapter } from '@buildnbuzz/buzzform/rhf';
 * import { zodResolver } from '@buildnbuzz/buzzform/resolvers/zod';
 *
 * <FormProvider
 *   adapter={useRhfAdapter}
 *   resolver={zodResolver}
 *   mode="onBlur"
 * >
 *   <App />
 * </FormProvider>
 */
export const FormProvider: React.FC<
  FormConfig & { children: React.ReactNode }
> = ({ children, ...config }) => {
  return (
    <FormConfigContext.Provider value={config}>
      {children}
    </FormConfigContext.Provider>
  );
};
