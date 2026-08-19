export class ApiResponse<T = any> {
  constructor(
    public readonly message: string,
    public readonly data: T,
    public readonly status: number,
  ) {}

  static ok<T = null>(message: string, data: T = null as T): ApiResponse<T> {
    return new ApiResponse(message, data, 200);
  }

  static created<T = null>(message: string, data: T = null as T): ApiResponse<T> {
    return new ApiResponse(message, data, 201);
  }

  static noContent<T = null>(message: string, data: T = null as T): ApiResponse<T> {
    return new ApiResponse(message, data, 204);
  }

  static badRequest<T = null>(message: string, data: T = null as T): ApiResponse<T> {
    return new ApiResponse(message, data, 400);
  }

  static unauthorized<T = null>(message: string, data: T = null as T): ApiResponse<T> {
    return new ApiResponse(message, data, 401);
  }

  static forbidden<T = null>(message: string, data: T = null as T): ApiResponse<T> {
    return new ApiResponse(message, data, 403);
  }

  static notFound<T = null>(message: string, data: T = null as T): ApiResponse<T> {
    return new ApiResponse(message, data, 404);
  }

  static conflict<T = null>(message: string, data: T = null as T): ApiResponse<T> {
    return new ApiResponse(message, data, 409);
  }

  static unprocessableEntity<T = null>(message: string, data: T = null as T): ApiResponse<T> {
    return new ApiResponse(message, data, 422);
  }

  static internalServerError<T = null>(message: string, data: T = null as T): ApiResponse<T> {
    return new ApiResponse(message, data, 500);
  }
}
