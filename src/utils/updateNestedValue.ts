import type { JSONArray, JSONObject, JSONValue, SchemaPath } from '../types/schema';

export function updateNestedValue(
  root: JSONValue,
  path: SchemaPath,
  nextValue: JSONValue,
): JSONValue {
  if (path.length === 0) {
    return nextValue;
  }

  const [segment, ...remainingPath] = path;

  if (Array.isArray(root)) {
    return updateArray(root, segment, remainingPath, nextValue);
  }

  if (isObject(root)) {
    return updateObject(root, segment, remainingPath, nextValue);
  }

  return root;
}

function updateArray(
  value: JSONArray,
  segment: string | number,
  remainingPath: SchemaPath,
  nextValue: JSONValue,
): JSONArray {
  if (typeof segment !== 'number') {
    return value;
  }

  return value.map((item, index) =>
    index === segment ? updateNestedValue(item, remainingPath, nextValue) : item,
  );
}

function updateObject(
  value: JSONObject,
  segment: string | number,
  remainingPath: SchemaPath,
  nextValue: JSONValue,
): JSONObject {
  if (typeof segment !== 'string') {
    return value;
  }

  const currentValue = value[segment] ?? null;

  return {
    ...value,
    [segment]: updateNestedValue(currentValue, remainingPath, nextValue),
  };
}

function isObject(value: JSONValue): value is JSONObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
