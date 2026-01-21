"use client";

import { createSchema, InferType } from "@buildnbuzz/buzzform";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormContent,
  FormFields,
  FormSubmit,
} from "@/registry/base/form";

const documentSchema = createSchema([
  {
    type: "upload",
    name: "document",
    label: "Upload Document",
    description: "PDF, Word, or text files (max 10MB)",
    maxSize: 10 * 1024 * 1024,
    ui: {
      variant: "dropzone",
      size: "xs",
      accept: ".pdf,.doc,.docx,.txt",
      showProgress: true,
      dropzoneText: "Drop your document here",
    },
  },
  {
    type: "textarea",
    name: "notes",
    label: "Additional Notes",
    placeholder: "Any notes about this document...",
    rows: 3,
  },
]);

type DocumentSchema = InferType<typeof documentSchema>;

export default function DocumentUploadForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Upload</CardTitle>
        <CardDescription>Drag-and-drop with progress indicator</CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={documentSchema}
          onSubmit={async (data: DocumentSchema) => {
            console.log("Form data:", data);
            await new Promise((r) => setTimeout(r, 1000));
            toast("Document uploaded!", {
              description: (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground">
                    Check the console for the full File objects.
                  </p>
                  <pre className="max-h-40 overflow-auto rounded-md bg-zinc-950 p-3 text-xs">
                    <code>{JSON.stringify(data, null, 2)}</code>
                  </pre>
                </div>
              ),
            });
          }}
        >
          <FormContent>
            <FormFields className="space-y-4" />
            <FormSubmit className="mt-6 w-full">Upload Document</FormSubmit>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
