'use client';

import { createContext } from 'react';
import type { FormConfig } from '../types';

/**
 * Context for global form configuration.
 * Set via FormProvider, consumed by useForm.
 */
export const FormConfigContext = createContext<FormConfig | null>(null);
