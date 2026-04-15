class ApiError extends Error {
  public statusCode: number;
  public fields?: Record<string, string>;

  constructor(
    statusCode: number,
    errorMsg: string = 'internal server error',
    fields?: Record<string, string>,
    stack: string = '',
  ) {
    super(errorMsg);
    this.statusCode = statusCode;
    this.name = 'ApiError';

    if (fields) {
      this.fields = fields;
    }

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
