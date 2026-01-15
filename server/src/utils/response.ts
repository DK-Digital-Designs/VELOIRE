import { Response } from 'express';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    meta?: any;
    error?: string;
    code?: string;
    details?: any;
}

export const sendSuccess = <T>(res: Response, data: T, meta?: any, statusCode = 200) => {
    const response: ApiResponse<T> = {
        success: true,
        data,
        meta,
    };
    return res.status(statusCode).json(response);
};

export const sendError = (
    res: Response,
    message: string,
    code = 'ERR_INTERNAL_SERVER',
    details?: any,
    statusCode = 500
) => {
    const response: ApiResponse = {
        success: false,
        error: message,
        code,
        details,
    };
    return res.status(statusCode).json(response);
};
