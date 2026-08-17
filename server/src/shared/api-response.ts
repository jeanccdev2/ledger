export class ApiResponse<T> {
  constructor(
    public readonly message: string,
    public readonly data: T,
    public readonly status: number,
  ) {}

  static ok<T>(message: string, data: T): ApiResponse<T> {
    return new ApiResponse(message, data, 200);
  }

  static created<T>(message: string, data: T): ApiResponse<T> {
    return new ApiResponse(message, data, 201);
  }

  static noContent<T>(message: string, data: T): ApiResponse<T> {
    return new ApiResponse(message, data, 204);
  }

  static badRequest<T>(message: string, data: T): ApiResponse<T> {
    return new ApiResponse(message, data, 400);
  }

  static unauthorized<T>(message: string, data: T): ApiResponse<T> {
    return new ApiResponse(message, data, 401);
  }

  static forbidden<T>(message: string, data: T): ApiResponse<T> {
    return new ApiResponse(message, data, 403);
  }

  static notFound<T>(message: string, data: T): ApiResponse<T> {
    return new ApiResponse(message, data, 404);
  }

  static conflict<T>(message: string, data: T): ApiResponse<T> {
    return new ApiResponse(message, data, 409);
  }

  static unprocessableEntity<T>(message: string, data: T): ApiResponse<T> {
    return new ApiResponse(message, data, 422);
  }

  static internalServerError<T>(message: string, data: T): ApiResponse<T> {
    return new ApiResponse(message, data, 500);
  }
}
