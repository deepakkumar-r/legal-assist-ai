export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}
export const errorBody = (error: unknown) =>
  error instanceof AppError
    ? { status: error.status, body: { error: { code: error.code, message: error.message } } }
    : {
        status: 500,
        body: { error: { code: 'INTERNAL_ERROR', message: 'The request could not be completed.' } },
      };
