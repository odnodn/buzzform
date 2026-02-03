import type { Field } from "@buildnbuzz/buzzform";

export const switchFieldProperties: Field[] = [
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
                        description: "Display label shown next to the switch",
                        placeholder: "Enable notifications",
                    },
                    {
                        type: "textarea",
                        name: "description",
                        label: "Description",
                        description: "Help text shown below the field",
                        rows: 2,
                    },
                    {
                        type: "switch",
                        name: "defaultValue",
                        label: "Default On",
                        description: "Initial switch state",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "switch",
                        name: "hidden",
                        label: "Hidden",
                        description: "Hide this field from the form",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "switch",
                        name: "disabled",
                        label: "Disabled",
                        description: "Prevent user interaction",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "switch",
                        name: "readOnly",
                        label: "Read Only",
                        description: "Display value but prevent editing",
                        ui: { alignment: "between" },
                    },
                ],
            },
            {
                label: "Validation",
                fields: [
                    {
                        type: "switch",
                        name: "required",
                        label: "Required",
                        description: "User must enable this switch",
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
                        name: "ui.alignment",
                        label: "Alignment",
                        description: "Switch position relative to label",
                        options: [
                            { label: "Start (Switch Left)", value: "start" },
                            { label: "End (Switch Right)", value: "end" },
                            { label: "Between (Full Width)", value: "between" },
                        ],
                        defaultValue: "between",
                    },
                ],
            },
        ],
    },
];
