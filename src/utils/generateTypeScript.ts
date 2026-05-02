import type { ObjectSchemaNode, SchemaNode } from '../types/schema';

interface InterfaceDeclaration {
  name: string;
  body: string;
}

export function generateTypeScript(schema: SchemaNode, rootName = 'Root'): string {
  const declarations: InterfaceDeclaration[] = [];
  const emitted = new Set<string>();
  const safeRootName = toPascalCase(rootName) || 'Root';
  const rootType = renderType(schema, safeRootName, declarations, emitted);

  if (schema.kind === 'object') {
    return declarations.map((declaration) => declaration.body).join('\n\n');
  }

  return [
    `type ${safeRootName} = ${rootType};`,
    ...declarations.map((declaration) => declaration.body),
  ].join('\n\n');
}

function renderType(
  schema: SchemaNode,
  suggestedName: string,
  declarations: InterfaceDeclaration[],
  emitted: Set<string>,
): string {
  switch (schema.kind) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'null':
      return 'null';
    case 'array': {
      if (!schema.item) {
        return 'unknown[]';
      }

      const itemName =
        schema.item.kind === 'object'
          ? schema.path.length === 0
            ? singularizeTypeName(suggestedName)
            : suggestedName
          : `${suggestedName}Item`;
      const itemType = renderType(schema.item, itemName, declarations, emitted);

      return itemType.includes(' | ') ? `(${itemType})[]` : `${itemType}[]`;
    }
    case 'object':
      emitInterface(schema, suggestedName, declarations, emitted);
      return suggestedName;
    case 'mixed': {
      if (schema.variants.length === 0) {
        return 'unknown';
      }

      return unique(
        schema.variants.map((variant, index) =>
          renderType(variant, `${suggestedName}Variant${index + 1}`, declarations, emitted),
        ),
      ).join(' | ');
    }
  }
}

function emitInterface(
  schema: ObjectSchemaNode,
  name: string,
  declarations: InterfaceDeclaration[],
  emitted: Set<string>,
): void {
  if (emitted.has(name)) {
    return;
  }

  emitted.add(name);

  const fields = Object.entries(schema.fields).map(([key, fieldSchema]) => {
    const fieldName = formatPropertyName(key, fieldSchema.optional);
    const typeName = toPascalCase(`${name} ${singularizeWord(key)}`);
    const type = renderType(fieldSchema, typeName, declarations, emitted);
    return `  ${fieldName}: ${type};`;
  });

  declarations.push({
    name,
    body: [
      `interface ${name} {`,
      ...(fields.length > 0 ? fields : ['  [key: string]: never;']),
      '}',
    ].join('\n'),
  });
}

function formatPropertyName(key: string, optional?: boolean): string {
  const suffix = optional ? '?' : '';

  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) {
    return `${key}${suffix}`;
  }

  return `${JSON.stringify(key)}${suffix}`;
}

function toPascalCase(value: string): string {
  const words = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);

  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

function singularizeTypeName(value: string): string {
  if (value.endsWith('ies')) {
    return `${value.slice(0, -3)}y`;
  }

  if (value.endsWith('ses')) {
    return value.slice(0, -2);
  }

  if (value.endsWith('s') && value.length > 1) {
    return value.slice(0, -1);
  }

  return `${value}Item`;
}

function singularizeWord(value: string): string {
  if (value.endsWith('ies')) {
    return `${value.slice(0, -3)}y`;
  }

  if (value.endsWith('s') && value.length > 1) {
    return value.slice(0, -1);
  }

  return value;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
