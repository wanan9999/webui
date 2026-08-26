import i18n from '@/i18n';
import schemaZh from '@/i18n/schema-zh.json';
import type {
  EnumVariant,
  Form,
  FormSection,
  Layout,
  LayoutItem,
  LayoutSubItem,
  List,
  Schema,
} from '@/types/schema';

type TextMap = Record<string, string>;

const catalog = schemaZh as {
  layouts: TextMap;
  views: TextMap;
  fields: TextMap;
  enums: TextMap;
};

function isChinese(): boolean {
  return i18n.resolvedLanguage === 'zh';
}

function translateFieldName(name: string): string | undefined {
  if (!isChinese()) return undefined;
  return catalog.fields[name] ?? catalog.fields[name.replace(/^.*\./, '')];
}

export function translateViewName(viewName: string, fallback: string): string {
  if (!isChinese()) return fallback;
  return catalog.views[viewName] ?? fallback;
}

export function translateLayoutName(name: string): string {
  if (!isChinese()) return name;
  return catalog.layouts[name] ?? name;
}

function translateEnum(enumName: string, variant: EnumVariant): EnumVariant {
  if (!isChinese()) return variant;
  const key = `${enumName}.${variant.name}`;
  return {
    ...variant,
    label: catalog.enums[key] ?? variant.label,
  };
}

function localizeLayoutItem(item: LayoutItem): LayoutItem {
  if ('link' in item) {
    return {
      link: {
        ...item.link,
        name: translateViewName(item.link.viewName, item.link.name),
      },
    };
  }

  return {
    container: {
      ...item.container,
      name: translateLayoutName(item.container.name),
      items: item.container.items.map(localizeSubItem),
    },
  };
}

function localizeSubItem(item: LayoutSubItem): LayoutSubItem {
  if (item.type === 'link') {
    return {
      ...item,
      name: translateViewName(item.viewName, item.name),
    };
  }

  return {
    ...item,
    name: translateLayoutName(item.name),
    items: item.items.map(localizeSubItem),
  };
}

function localizeForm(viewName: string, form: Form): Form {
  return {
    ...form,
    title: form.title ? translateViewName(viewName, form.title) : form.title,
    sections: form.sections.map((section: FormSection) => ({
      ...section,
      title: section.title ? translateFieldName(section.title) ?? section.title : section.title,
      fields: section.fields.map((field) => ({
        ...field,
        label: translateFieldName(field.name) ?? field.label,
        keyLabel: field.keyLabel ? translateFieldName(field.keyLabel) ?? field.keyLabel : field.keyLabel,
        valueLabel: field.valueLabel ? translateFieldName(field.valueLabel) ?? field.valueLabel : field.valueLabel,
      })),
    })),
  };
}

function localizeList(viewName: string, list: List): List {
  return {
    ...list,
    title: translateViewName(viewName, list.title),
    singularName: translateViewName(viewName, list.singularName),
    pluralName: translateViewName(viewName, list.pluralName),
    columns: list.columns.map((column) => ({
      ...column,
      label: translateFieldName(column.name) ?? column.label,
    })),
    filters: list.filters?.map((filter) => ({
      ...filter,
      label: translateFieldName(filter.field) ?? filter.label,
    })),
    massActions: list.massActions?.map((action) =>
      action.type === 'separator'
        ? action
        : { ...action, label: translateFieldName(action.label) ?? action.label },
    ),
    itemActions: list.itemActions?.map((action) =>
      action.type === 'separator'
        ? action
        : { ...action, label: translateFieldName(action.label) ?? action.label },
    ),
  };
}

export function localizeSchema(schema: Schema): Schema {
  if (!isChinese()) return schema;

  return {
    ...schema,
    layouts: schema.layouts.map((layout: Layout) => ({
      ...layout,
      items: layout.items.map(localizeLayoutItem),
    })),
    objects: Object.fromEntries(
      Object.entries(schema.objects).map(([name, object]) => [
        name,
        object.type === 'view'
          ? object
          : { ...object, description: catalog.views[name] ?? object.description },
      ]),
    ),
    schemas: Object.fromEntries(
      Object.entries(schema.schemas).map(([name, objectSchema]) => [
        name,
        objectSchema.type === 'single'
          ? objectSchema
          : {
              ...objectSchema,
              variants: objectSchema.variants.map((variant) => ({
                ...variant,
                label: translateViewName(`${name}/${variant.name}`, variant.label),
              })),
            },
      ]),
    ),
    forms: Object.fromEntries(Object.entries(schema.forms).map(([name, form]) => [name, localizeForm(name, form)])),
    lists: Object.fromEntries(Object.entries(schema.lists).map(([name, list]) => [name, localizeList(name, list)])),
    enums: Object.fromEntries(
      Object.entries(schema.enums).map(([name, values]) => [name, values.map((value) => translateEnum(name, value))]),
    ),
  };
}
