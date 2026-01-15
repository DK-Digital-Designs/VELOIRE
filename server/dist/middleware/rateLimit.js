"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.publicActionLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * Rate limiting for public endpoints to prevent abuse
 */
exports.publicActionLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests, please try again later.',
        code: 'ERR_TOO_MANY_REQUESTS'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 login attempts per hour
    message: {
        success: false,
        error: 'Too many login attempts, please try again in an hour.',
        code: 'ERR_TOO_MANY_REQUESTS'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
