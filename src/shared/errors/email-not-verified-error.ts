export class EmailNotVerifiedError extends Error {
  constructor() {
    super("Email não verificado. Verifique seu inbox.");
  }
}
