
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

const contactSchema = createSchema([
  {
    type: "row",
    fields: [
      {
        type: "text",
        name: "firstName",
        label: "First Name",
        placeholder: "John",
        required: true,
      },
      {
        type: "text",
        name: "lastName",
        label: "Last Name",
        placeholder: "Doe",
        required: true,
      },
    ],
  },
  {
    type: "email",
    name: "email",
    label: "Email Address",
    placeholder: "john.doe@example.com",
    required: true,
  },
  {
    type: "row",
    fields: [
      {
        type: "text",
        name: "city",
        label: "City",
        placeholder: "New York",
        style: { width: "60%" },
      },
      {
        type: "text",
        name: "zip",
        label: "ZIP Code",
        placeholder: "10001",
        style: { width: "40%" },
      },
    ],
  },
]);

type ContactSchema = InferType<typeof contactSchema>;

export default function ContactLayoutForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>
          Side-by-side fields with responsive row layout
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={contactSchema}
          onSubmit={async (data: ContactSchema) => {
            await new Promise((r) => setTimeout(r, 1000));
            toast("Contact saved!", {
              description: (
                <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-zinc-950 p-3 text-xs">
                  <code>{JSON.stringify(data, null, 2)}</code>
                </pre>
              ),
            });
          }}
        >
          <FormContent>
            <FormFields className="space-y-4" />
            <FormSubmit className="mt-6 w-full">Save Contact</FormSubmit>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
