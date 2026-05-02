export type JSONPrimitive = string | number | boolean | null;

export type JSONValue = JSONPrimitive | JSONObject | JSONArray;

export interface JSONObject {
  [key: string]: JSONValue;
}

export type JSONArray = JSONValue[];

export type SchemaPath = Array<string | number>;

export type SchemaKind = 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object' | 'mixed';

interface BaseSchemaNode {
  kind: SchemaKind;
  path: SchemaPath;
  optional?: boolean;
}

export interface StringSchemaNode extends BaseSchemaNode {
  kind: 'string';
}

export interface NumberSchemaNode extends BaseSchemaNode {
  kind: 'number';
}

export interface BooleanSchemaNode extends BaseSchemaNode {
  kind: 'boolean';
}

export interface NullSchemaNode extends BaseSchemaNode {
  kind: 'null';
}

export interface ArraySchemaNode extends BaseSchemaNode {
  kind: 'array';
  item?: SchemaNode;
  itemKinds: SchemaKind[];
  length: number;
  isMixed: boolean;
}

export interface ObjectSchemaNode extends BaseSchemaNode {
  kind: 'object';
  fields: Record<string, SchemaNode>;
}

export interface MixedSchemaNode extends BaseSchemaNode {
  kind: 'mixed';
  variants: SchemaNode[];
}

export type SchemaNode =
  | StringSchemaNode
  | NumberSchemaNode
  | BooleanSchemaNode
  | NullSchemaNode
  | ArraySchemaNode
  | ObjectSchemaNode
  | MixedSchemaNode;
