declare module '@exodus/schemasafe' {
  type Validator = (object: unknown) => boolean;

  export function validator(schema: Record<string, unknown>): Validator;
}
