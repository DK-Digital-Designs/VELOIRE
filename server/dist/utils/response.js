"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, meta, statusCode = 200) => {
    const response = {
        success: true,
        data,
        meta,
    };
    return res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, code = 'ERR_INTERNAL_SERVER', details, statusCode = 500) => {
    const response = {
        success: false,
        error: message,
        code,
        details,
    };
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
