
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

const gallerySchema = createSchema([
  {
    type: "upload",
    name: "images",
    label: "Product Images",
    description: "Upload up to 6 product images",
    hasMany: true,
    maxFiles: 6,
    ui: {
      variant: "gallery",
      accept: "image/*",
      shape: "rounded",
      showProgress: true,
    },
  },
]);

type GallerySchema = InferType<typeof gallerySchema>;

export default function GalleryUploadForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Gallery</CardTitle>
        <CardDescription>Multi-file upload with thumbnail grid</CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={gallerySchema}
          onSubmit={async (data: GallerySchema) => {
            console.log("Form data:", data);
            await new Promise((r) => setTimeout(r, 1000));
            toast("Images saved!", {
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
            <FormSubmit className="mt-6 w-full">Save Images</FormSubmit>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
