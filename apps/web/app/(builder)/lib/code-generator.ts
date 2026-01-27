import { nodesToFields } from "./schema-builder";
import type { Node } from "./types";

export function generateComponentCode(
  nodes: Record<string, Node>,
  rootIds: string[]
) {
  // 1. Get the raw field structure
  const fields = nodesToFields(nodes, rootIds);

  // 2. Serialize fields to JSON string, but we just stringify the whole array
  const schemaString = JSON.stringify(fields, null, 2);

  // 3. Inject into template
  return `import { createSchema, InferType } from "@buildnbuzz/buzzform";
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
} from "@/components/buzzform/form";

const formSchema = createSchema(${schemaString});

type FormSchema = InferType<typeof formSchema>;

export default function GeneratedForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Form</CardTitle>
        <CardDescription>Generated with BuzzForm Builder</CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={formSchema}
          onSubmit={async (data: FormSchema) => {
            await new Promise((r) => setTimeout(r, 1000));
            toast("Form submitted!", {
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
            <FormSubmit className="mt-6 w-full">Submit</FormSubmit>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}`;
}
