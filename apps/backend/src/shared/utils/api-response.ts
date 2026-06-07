// src/shared/utils/api-response.ts

import { Response } from 'express';

export interface ApiResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiSuccessPayload<T> {
  success: true;
  message: string;
  data: T;
  meta?: ApiResponseMeta;
  timestamp: string;
}

export interface ApiErrorPayload {
  success: false;
  message: string;
  code: string;
  errors?: Record<string, string[]> | string[];
  timestamp: string;
}

export class ApiResponse {
  /**
   * Send a successful response.
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
    meta?: ApiResponseMeta,
  ): Response {
    const payload: ApiSuccessPayload<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      ...(meta && { meta }),
    };
    return res.status(statusCode).json(payload);
  }

  /**
   * Send a created (201) response.
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Created successfully',
  ): Response {
    return ApiResponse.success(res, data, message, 201);
  }

  /**
   * Send a no-content (204) response.
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send an error response.
   */
  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    errors?: Record<string, string[]> | string[],
  ): Response {
    const payload: ApiErrorPayload = {
      success: false,
      message,
      code,
      timestamp: new Date().toISOString(),
      ...(errors && { errors }),
    };
    return res.status(statusCode).json(payload);
  }
}