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

  static error <T = null>(
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
