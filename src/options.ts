import { boolean, create, defaulted, Infer, object, string } from 'superstruct';

export const OPTIONS_TYPE = object({
  /**
   * The name of the domain struct.
   *
   * Default: "EIP712Domain"
   */
  domain: defaulted(string(), 'EIP712Domain'),

  /**
   * Whether to verify if the domain matches the EIP-712 specification. When this is disabled, you can use any arbitrary
   * fields in the domain.
   *
   * Default: true
   */
  verifyDomain: defaulted(boolean(), true)
});

export type Options = Partial<Infer<typeof OPTIONS_TYPE>>;

export const getOptions = (options: unknown): Required<Options> => {
  return create(options ?? {}, OPTIONS_TYPE);
};
