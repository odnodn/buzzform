import type { BuilderFieldRegistry } from './types';
import {
    TextIcon,
    Mail01Icon,
    SecurityPasswordIcon,
    TextAlignLeftIcon,
    GridIcon,
    Calendar02Icon,
    Clock01Icon,
    ArrowDown01Icon,
    CircleIcon,
    Tick02Icon,
    ToggleOnIcon,
    Tag01Icon,
    Upload01Icon,
} from '@hugeicons/core-free-icons';
import type { ComponentType } from 'react';
import type { FieldRendererComponentProps } from '@/registry/base/fields/render';
import { TextField } from '@/registry/base/fields/text';
import { TextareaField } from '@/registry/base/fields/textarea';
import { PasswordField } from '@/registry/base/fields/password';
import { NumberField } from '@/registry/base/fields/number';
import { DateField } from '@/registry/base/fields/date';
import { SelectField } from '@/registry/base/fields/select';
import { RadioField } from '@/registry/base/fields/radio';
import { CheckboxField } from '@/registry/base/fields/checkbox';
import { SwitchField } from '@/registry/base/fields/switch';
import { TagsField } from '@/registry/base/fields/tags';
import { UploadField } from '@/registry/base/fields/upload';

export const builderFieldRegistry: BuilderFieldRegistry = {
    text: {
        kind: 'data',
        sidebar: { label: 'Text', icon: TextIcon, category: 'inputs' },
        defaultProps: { type: 'text', label: 'Text Field' },
        renderer: TextField as ComponentType<FieldRendererComponentProps>,
    },
    email: {
        kind: 'data',
        sidebar: { label: 'Email', icon: Mail01Icon, category: 'inputs' },
        defaultProps: { type: 'email', label: 'Email' },
        renderer: TextField as ComponentType<FieldRendererComponentProps>,
    },
    password: {
        kind: 'data',
        sidebar: { label: 'Password', icon: SecurityPasswordIcon, category: 'inputs' },
        defaultProps: { type: 'password', label: 'Password' },
        renderer: PasswordField as ComponentType<FieldRendererComponentProps>,
    },
    textarea: {
        kind: 'data',
        sidebar: { label: 'Textarea', icon: TextAlignLeftIcon, category: 'inputs' },
        defaultProps: { type: 'textarea', label: 'Textarea', rows: 3 },
        renderer: TextareaField as ComponentType<FieldRendererComponentProps>,
    },
    number: {
        kind: 'data',
        sidebar: { label: 'Number', icon: GridIcon, category: 'inputs' },
        defaultProps: { type: 'number', label: 'Number' },
        renderer: NumberField as ComponentType<FieldRendererComponentProps>,
    },
    date: {
        kind: 'data',
        sidebar: { label: 'Date', icon: Calendar02Icon, category: 'inputs' },
        defaultProps: { type: 'date', label: 'Date' },
        renderer: DateField as ComponentType<FieldRendererComponentProps>,
    },
    datetime: {
        kind: 'data',
        sidebar: { label: 'Datetime', icon: Clock01Icon, category: 'inputs' },
        defaultProps: { type: 'datetime', label: 'Datetime' },
        renderer: DateField as ComponentType<FieldRendererComponentProps>,
    },
    select: {
        kind: 'data',
        sidebar: { label: 'Select', icon: ArrowDown01Icon, category: 'selection' },
        defaultProps: {
            type: 'select',
            label: 'Select',
            options: [
                { label: 'Option 1', value: 'option1' },
                { label: 'Option 2', value: 'option2' },
            ],
        },
        renderer: SelectField as ComponentType<FieldRendererComponentProps>,
    },
    radio: {
        kind: 'data',
        sidebar: { label: 'Radio', icon: CircleIcon, category: 'selection' },
        defaultProps: {
            type: 'radio',
            label: 'Radio',
            options: [
                { label: 'Option 1', value: 'option1' },
                { label: 'Option 2', value: 'option2' },
            ],
        },
        renderer: RadioField as ComponentType<FieldRendererComponentProps>,
    },
    checkbox: {
        kind: 'data',
        sidebar: { label: 'Checkbox', icon: Tick02Icon, category: 'selection' },
        defaultProps: { type: 'checkbox', label: 'Checkbox' },
        renderer: CheckboxField as ComponentType<FieldRendererComponentProps>,
    },
    switch: {
        kind: 'data',
        sidebar: { label: 'Switch', icon: ToggleOnIcon, category: 'selection' },
        defaultProps: { type: 'switch', label: 'Switch' },
        renderer: SwitchField as ComponentType<FieldRendererComponentProps>,
    },
    tags: {
        kind: 'data',
        sidebar: { label: 'Tags', icon: Tag01Icon, category: 'inputs' },
        defaultProps: { type: 'tags', label: 'Tags' },
        renderer: TagsField as ComponentType<FieldRendererComponentProps>,
    },
    upload: {
        kind: 'data',
        sidebar: { label: 'Upload', icon: Upload01Icon, category: 'inputs' },
        defaultProps: { type: 'upload', label: 'Upload' },
        renderer: UploadField as ComponentType<FieldRendererComponentProps>,
    },
};

export function getRegistryEntry(type: keyof typeof builderFieldRegistry) {
    return builderFieldRegistry[type];
}

export function getSidebarGroups() {
    const groups: Record<string, Array<{ type: string; label: string; icon: typeof TextIcon }>> = {};

    for (const [type, entry] of Object.entries(builderFieldRegistry)) {
        if (!entry) continue;
        const category = entry.sidebar.category;
        if (!groups[category]) groups[category] = [];
        groups[category].push({
            type,
            label: entry.sidebar.label,
            icon: entry.sidebar.icon,
        });
    }

    return groups;
}
