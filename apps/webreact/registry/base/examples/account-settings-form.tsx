
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

const accountSettingsSchema = createSchema([
  {
    type: "tabs",
    ui: {
      variant: "default",
      spacing: "md",
    },
    tabs: [
      {
        label: "Profile",
        icon: (
          <IconPlaceholder
            hugeicons="User03Icon"
            lucide="User"
            tabler="IconUser"
            phosphor="User"
            remixicon="RiUserLine"
            className="size-4"
          />
        ),
        description: "Manage your public profile information.",
        fields: [
          {
            type: "text",
            name: "displayName",
            label: "Display Name",
            placeholder: "John Doe",
            required: true,
          },
          {
            type: "text",
            name: "username",
            label: "Username",
            placeholder: "johndoe",
            required: true,
          },
          {
            type: "textarea",
            name: "bio",
            label: "Bio",
            placeholder: "Tell us about yourself...",
            rows: 3,
          },
        ],
      },
      {
        label: "Account",
        icon: (
          <IconPlaceholder
            hugeicons="Settings01Icon"
            lucide="Settings"
            tabler="IconSettings"
            phosphor="Gear"
            remixicon="RiSettings3Line"
            className="size-4"
          />
        ),
        description: "Update your account settings and preferences.",
        fields: [
          {
            type: "email",
            name: "email",
            label: "Email Address",
            required: true,
          },
          {
            type: "password",
            name: "password",
            label: "New Password",
            placeholder: "Leave blank to keep current",
            ui: {
              showRequirements: true,
            },
          },
        ],
      },
      {
        label: "Notifications",
        icon: (
          <IconPlaceholder
            hugeicons="Notification02Icon"
            lucide="Bell"
            tabler="IconBell"
            phosphor="Bell"
            remixicon="RiNotification3Line"
            className="size-4"
          />
        ),
        description: "Configure how you receive notifications.",
        fields: [
          {
            type: "switch",
            name: "emailNotifications",
            label: "Email Notifications",
            description: "Receive updates via email",
            defaultValue: true,
          },
          {
            type: "switch",
            name: "pushNotifications",
            label: "Push Notifications",
            description: "Receive push notifications",
            defaultValue: false,
          },
          {
            type: "select",
            name: "frequency",
            label: "Digest Frequency",
            options: ["Instant", "Daily", "Weekly", "Never"],
            defaultValue: "Daily",
          },
        ],
      },
      {
        label: "Billing",
        icon: (
          <IconPlaceholder
            hugeicons="CreditCardIcon"
            lucide="CreditCard"
            tabler="IconCreditCard"
            phosphor="CreditCard"
            remixicon="RiBankCardLine"
            className="size-4"
          />
        ),
        disabled: true,
        fields: [
          {
            type: "text",
            name: "placeholder",
            label: "Coming Soon",
          },
        ],
      },
    ],
  },
]);

type AccountSettingsSchema = InferType<typeof accountSettingsSchema>;

export default function AccountSettingsForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Multi-step settings with tabbed navigation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={accountSettingsSchema}
          onSubmit={async (data: AccountSettingsSchema) => {
            await new Promise((r) => setTimeout(r, 1000));
            toast("Settings saved!", {
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
            <FormSubmit className="mt-6 w-full">Save Changes</FormSubmit>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
