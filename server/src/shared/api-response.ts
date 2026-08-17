type PaginationResponse = {
  totalRows: number;
  totalPages: number;
  limit: number;
  currentPage: number;
};

type SimpleApiResponse<T = null> = {
  status: number;
  message: string;
  data: T;
};

type PaginatedApiResponse<T = null> = {
  status: number;
  message: string;
  data: T;
  pagination: PaginationResponse;
};

export class ApiResponse {
  static success<T = null>(message: string, data: T): SimpleApiResponse<T> {
    return {
      status: 200,
      message,
      data,
    };
  }

  static successPaginated<T = null>(
    message: string,
    data: T,
    pagination: PaginationResponse,
  ): PaginatedApiResponse<T> {
    return {
      status: 200,
      message,
      data,
      pagination,
    };
  }

  static created<T = null>(message: string, data: T): SimpleApiResponse<T> {
    return {
      status: 201,
      message,
      data,
    };
  }

  static noContent<T = null>(message: string, data: T): SimpleApiResponse<T> {
    return {
      status: 204,
      message,
      data,
    };
  }

  static badRequest<T = null>(message: string, data: T): SimpleApiResponse<T> {
    return {
      status: 400,
      message,
      data,
    };
  }

  static unauthorized<T = null>(
    message: string,
    data: T,
  ): SimpleApiResponse<T> {
    return {
      status: 401,
      message,
      data,
    };
  }

  static forbidden<T = null>(message: string, data: T): SimpleApiResponse<T> {
    return {
      status: 403,
      message,
      data,
    };
  }

  static notFound<T = null>(message: string, data: T): SimpleApiResponse<T> {
    return {
      status: 404,
      message,
      data,
    };
  }

  static conflict<T = null>(message: string, data: T): SimpleApiResponse<T> {
    return {
      status: 409,
      message,
      data,
    };
  }

  static unprocessableEntity<T = null>(
    message: string,
    data: T,
  ): SimpleApiResponse<T> {
    return {
      status: 422,
      message,
      data,
    };
  }

  static internalServerError<T = null>(
    message: string,
    data: T,
  ): SimpleApiResponse<T> {
    return {
      status: 500,
      message,
      data,
    };
  }

  static error<T = null>(
    status: number,
    message: string,
    data: T,
  ): SimpleApiResponse<T> {
    return {
      status,
      message,
      data,
    };
  }
}
