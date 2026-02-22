
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

const profileSchema = createSchema([
  {
    type: "upload",
    name: "avatar",
    label: "Profile Picture",
    description: "Upload a profile photo",
    ui: {
      variant: "avatar",
      shape: "square",
      size: "lg",
      accept: "image/*",
    },
  },
  {
    type: "text",
    name: "name",
    label: "Display Name",
    placeholder: "Your name",
    required: true,
  },
  {
    type: "email",
    name: "email",
    label: "Email",
    placeholder: "you@example.com",
    required: true,
  },
]);

type ProfileSchema = InferType<typeof profileSchema>;

export default function ProfileUploadForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Avatar upload with preview</CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={profileSchema}
          onSubmit={async (data: ProfileSchema) => {
            console.log("Form data:", data);
            await new Promise((r) => setTimeout(r, 1000));
            toast("Profile saved!", {
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
            <FormSubmit className="mt-6 w-full">Save Profile</FormSubmit>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
