"use client";

import {
  FormFields,
  FormActions,
  FormSubmit,
  FormContent,
} from "@/registry/base/form";

// PreviewForm: Pure BuzzForm rendering with zero builder logic
export function PreviewForm() {
  return (
    <FormContent>
      <FormFields />
      <FormActions className="mt-8">
        <FormSubmit>Submit</FormSubmit>
      </FormActions>
    </FormContent>
  );
}
