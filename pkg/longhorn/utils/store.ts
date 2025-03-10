const createId = (schema: any, resource: any) => {
  const name = resource.meta?.name || resource.name;
  const namespace = resource.meta?.namespace || resource.namespace;

  if (schema?.attributes?.namespaced && namespace) {
    return `${ namespace }/${ name }`;
  }

  return name;
};

export const longhornfy = (obj: any, schema: any, type: any) => ({
  ...obj,
  // Note - these must be applied here ... so things that need an id before classifying have access to them
  id: createId(schema, obj),
  type,
});
