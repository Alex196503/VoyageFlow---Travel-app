// Error class for handling bad requests
export class BadRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "BadRequestError"
  }
}

// Error class for handling Unauthorized requests
export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "UnauthorizedError"
  }
}

// Error class for handling not found errors
export class NotFoundError extends Error{
  constructor(message : string)
  {
    super(message);
    this.name = "NotFoundError"
  }
}