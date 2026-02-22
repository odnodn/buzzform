
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
import { IconPlaceholder } from "@/components/icon-placeholder";

const lineVariantSchema = createSchema([
  {
    type: "tabs",
    ui: {
      variant: "line",
      defaultTab: "shipping",
      spacing: "lg",
    },
    tabs: [
      {
        name: "billing",
        label: "Billing",
        icon: (
          <IconPlaceholder
            lucide="CreditCard"
            hugeicons="CreditCardIcon"
            tabler="IconCreditCard"
            phosphor="CreditCard"
            remixicon="RiBankCardLine"
            className="size-4"
          />
        ),
        fields: [
          {
            type: "text",
            name: "cardName",
            label: "Name on Card",
            required: true,
          },
          {
            type: "text",
            name: "cardNumber",
            label: "Card Number",
            placeholder: "1234 5678 9012 3456",
            required: true,
          },
          {
            type: "row",
            fields: [
              {
                type: "text",
                name: "expiry",
                label: "Expiry Date",
                placeholder: "MM/YY",
                required: true,
                style: { width: "50%" },
              },
              {
                type: "text",
                name: "cvv",
                label: "CVV",
                placeholder: "123",
                required: true,
                style: { width: "50%" },
              },
            ],
          },
        ],
      },
      {
        name: "shipping",
        label: "Shipping",
        icon: (
          <IconPlaceholder
            lucide="Truck"
            hugeicons="TruckIcon"
            tabler="IconTruck"
            phosphor="Truck"
            remixicon="RiTruckLine"
            className="size-4"
          />
        ),
        fields: [
          {
            type: "text",
            name: "address",
            label: "Street Address",
            required: true,
          },
          {
            type: "row",
            fields: [
              {
                type: "text",
                name: "city",
                label: "City",
                required: true,
                style: { width: "50%" },
              },
              {
                type: "text",
                name: "zip",
                label: "ZIP Code",
                required: true,
                style: { width: "50%" },
              },
            ],
          },
          {
            type: "select",
            name: "country",
            label: "Country",
            options: ["United States", "Canada", "United Kingdom", "Australia"],
            required: true,
          },
        ],
      },
    ],
  },
]);

type LineVariantSchema = InferType<typeof lineVariantSchema>;

export default function CheckoutForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
        <CardDescription>
          Billing and shipping in a streamlined checkout flow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={lineVariantSchema}
          onSubmit={async (data: LineVariantSchema) => {
            await new Promise((r) => setTimeout(r, 1000));
            toast("Order placed!", {
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
            <FormSubmit className="mt-6 w-full">Complete Order</FormSubmit>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
