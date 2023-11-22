import { Response } from 'express';

interface IResponseData {
  [key: string]: any;
}

// interface ErrorResponseData {
//   message: string;
// }

export function sendSuccessResponse(res: Response, status: number = 200, data: IResponseData | null = null, message?: string): Response {
  return res.status(status).json({
    status: 'success',
    message: message || 'Request successful',
    data,
  });
}

export function sendErrorResponse(res: Response, statusCode?: number, errors: IResponseData | null = null, message?: string): Response {
  return res.status(statusCode || 500).json({
    status: 'error',
    message: message || 'Internal Server Error',
    errors,
  });
}
