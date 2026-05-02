import type {
  ArraySchemaNode,
  JSONObject,
  ObjectSchemaNode,
  SchemaKind,
  SchemaNode,
  SchemaPath,
  JSONValue,
} from '../types/schema';

export function detectSchema(value: JSONValue, path: SchemaPath = []): SchemaNode {
  if (value === null) {
    return { kind: 'null', path };
  }

  if (Array.isArray(value)) {
    return detectArraySchema(value, path);
  }

  switch (typeof value) {
    case 'string':
      return { kind: 'string', path };
    case 'number':
      return { kind: 'number', path };
    case 'boolean':
      return { kind: 'boolean', path };
    case 'object':
      return detectObjectSchema(value, path);
    default:
      return { kind: 'mixed', path, variants: [] };
  }
}

function detectArraySchema(value: JSONValue[], path: SchemaPath): ArraySchemaNode {
  if (value.length === 0) {
    return {
      kind: 'array',
      path,
      itemKinds: [],
      length: 0,
      isMixed: false,
    };
  }

  const itemSchemas = value.map((item, index) => detectSchema(item, [...path, index]));
  const item = mergeSchemas(itemSchemas, [...path, 0]);
  const itemKinds = uniqueKinds(itemSchemas);

  return {
    kind: 'array',
    path,
    item,
    itemKinds,
    length: value.length,
    isMixed: item.kind === 'mixed' || itemKinds.length > 1,
  };
}

function detectObjectSchema(value: JSONObject, path: SchemaPath): ObjectSchemaNode {
  const fields = Object.entries(value).reduce<Record<string, SchemaNode>>((acc, [key, item]) => {
    acc[key] = detectSchema(item, [...path, key]);
    return acc;
  }, {});

  return {
    kind: 'object',
    path,
    fields,
  };
}

function mergeSchemas(schemas: SchemaNode[], path: SchemaPath): SchemaNode {
  if (schemas.length === 0) {
    return { kind: 'mixed', path, variants: [] };
  }

  const kinds = uniqueKinds(schemas);

  if (kinds.length === 1) {
    const kind = kinds[0];

    if (kind === 'object') {
      return mergeObjectSchemas(schemas.filter(isObjectSchema), path);
    }

    if (kind === 'array') {
      return mergeArraySchemas(schemas.filter(isArraySchema), path);
    }

    return { ...schemas[0], path };
  }

  return {
    kind: 'mixed',
    path,
    variants: compactVariants(schemas),
  };
}

function mergeObjectSchemas(schemas: ObjectSchemaNode[], path: SchemaPath): ObjectSchemaNode {
  const allKeys = new Set<string>();

  schemas.forEach((schema) => {
    Object.keys(schema.fields).forEach((key) => allKeys.add(key));
  });

  const fields = Array.from(allKeys).reduce<Record<string, SchemaNode>>((acc, key) => {
    const presentSchemas = schemas
      .map((schema) => schema.fields[key])
      .filter((schema): schema is SchemaNode => Boolean(schema));
    const missingCount = schemas.length - presentSchemas.length;
    const merged = mergeSchemas(presentSchemas, [...path, key]);

    acc[key] = {
      ...merged,
      optional: missingCount > 0 || presentSchemas.some((schema) => schema.optional),
    };

    return acc;
  }, {});

  return {
    kind: 'object',
    path,
    fields,
  };
}

function mergeArraySchemas(schemas: ArraySchemaNode[], path: SchemaPath): ArraySchemaNode {
  const itemSchemas = schemas
    .map((schema) => schema.item)
    .filter((schema): schema is SchemaNode => Boolean(schema));
  const item = itemSchemas.length > 0 ? mergeSchemas(itemSchemas, [...path, 0]) : undefined;
  const itemKinds = uniqueKinds(itemSchemas);

  return {
    kind: 'array',
    path,
    item,
    itemKinds,
    length: Math.max(...schemas.map((schema) => schema.length)),
    isMixed: item?.kind === 'mixed' || itemKinds.length > 1,
  };
}

function uniqueKinds(schemas: SchemaNode[]): SchemaKind[] {
  return Array.from(new Set(schemas.map((schema) => schema.kind)));
}

function compactVariants(schemas: SchemaNode[]): SchemaNode[] {
  const variants = new Map<string, SchemaNode>();

  schemas.forEach((schema) => {
    variants.set(schemaSignature(schema), schema);
  });

  return Array.from(variants.values());
}

function schemaSignature(schema: SchemaNode): string {
  if (schema.kind === 'object') {
    return `object:${Object.keys(schema.fields).sort().join(',')}`;
  }

  if (schema.kind === 'array') {
    return `array:${schema.item ? schemaSignature(schema.item) : 'empty'}`;
  }

  return schema.kind;
}

function isObjectSchema(schema: SchemaNode): schema is ObjectSchemaNode {
  return schema.kind === 'object';
}

function isArraySchema(schema: SchemaNode): schema is ArraySchemaNode {
  return schema.kind === 'array';
}
