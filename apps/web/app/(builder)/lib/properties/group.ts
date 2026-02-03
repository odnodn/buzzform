import type { Field } from "@buildnbuzz/buzzform";

export const groupFieldProperties: Field[] = [
    {
        type: "tabs",
        ui: {
            variant: "line",
            spacing: "lg",
        },
        tabs: [
            {
                label: "General",
                fields: [
                    {
                        type: "text",
                        name: "name",
                        label: "Name",
                        description: "Used as the key in form data (no spaces)",
                        required: true,
                        pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
                        placeholder: "fieldName",
                    },
                    {
                        type: "text",
                        name: "label",
                        label: "Label",
                        description: "Display label for the group",
                        placeholder: "Group Label",
                    },
                    {
                        type: "textarea",
                        name: "description",
                        label: "Description",
                        description: "Help text shown below the label",
                        rows: 2,
                    },
                    {
                        type: "switch",
                        name: "hidden",
                        label: "Hidden",
                        description: "Hide this group from the form",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "switch",
                        name: "disabled",
                        label: "Disabled",
                        description: "Disable all fields in this group",
                        ui: { alignment: "between" },
                    },
                ],
            },
            {
                label: "Style",
                fields: [
                    {
                        type: "select",
                        name: "style.width",
                        label: "Width",
                        description: "Field width (useful in rows)",
                        options: [
                            { label: "Auto", value: "auto" },
                            { label: "10%", value: "10%" },
                            { label: "20%", value: "20%" },
                            { label: "25%", value: "25%" },
                            { label: "30%", value: "30%" },
                            { label: "33%", value: "33.33%" },
                            { label: "40%", value: "40%" },
                            { label: "50%", value: "50%" },
                            { label: "60%", value: "60%" },
                            { label: "66%", value: "66.66%" },
                            { label: "70%", value: "70%" },
                            { label: "75%", value: "75%" },
                            { label: "80%", value: "80%" },
                            { label: "90%", value: "90%" },
                            { label: "100%", value: "100%" },
                        ],
                    },
                    {
                        type: "select",
                        name: "ui.variant",
                        label: "Variant",
                        description: "Visual style variant",
                        options: [
                            { label: "Card", value: "card" },
                            { label: "Flat", value: "flat" },
                            { label: "Ghost", value: "ghost" },
                            { label: "Bordered", value: "bordered" },
                        ],
                    },
                    {
                        type: "select",
                        name: "ui.spacing",
                        label: "Spacing",
                        description: "Space between fields in the group",
                        options: [
                            { label: "Small", value: "sm" },
                            { label: "Medium", value: "md" },
                            { label: "Large", value: "lg" },
                        ],
                    },
                    {
                        type: "switch",
                        name: "ui.collapsed",
                        label: "Start Collapsed",
                        description: "Start the group in collapsed state",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "switch",
                        name: "ui.showErrorBadge",
                        label: "Show Error Badge",
                        description: "Display error count badge in header",
                        ui: { alignment: "between" },
                    },
                ],
            },
        ],
    },
];
