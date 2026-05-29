import type { Response } from "express";

interface SendResponseResult<T> {
  statusCode: number;
  message: string;
  success: boolean;
  data?: T;
  error?: any;
}

const sendResponse = <T>(res: Response, result: SendResponseResult<T>) => {
  res.status(result.statusCode).json({
    message: result.message,
    success: result.success,
    data: result.data,
    error: result.error,
  });
};

export default sendResponse;
