"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureRole = exports.ensureAdmin = exports.isAuthenticated = void 0;
const auth_1 = require("../utils/auth");
const response_1 = require("../utils/response");
const isAuthenticated = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return (0, response_1.sendError)(res, 'Authentication required', 'ERR_AUTH_UNAUTHORIZED', undefined, 401);
    }
    const payload = (0, auth_1.verifyToken)(token);
    if (!payload) {
        return (0, response_1.sendError)(res, 'Invalid or expired token', 'ERR_AUTH_UNAUTHORIZED', undefined, 401);
    }
    req.user = payload;
    next();
};
exports.isAuthenticated = isAuthenticated;
const ensureAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return (0, response_1.sendError)(res, 'Admin access required', 'ERR_AUTH_FORBIDDEN', undefined, 403);
    }
    next();
};
exports.ensureAdmin = ensureAdmin;
const ensureRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return (0, response_1.sendError)(res, 'Insufficient permissions', 'ERR_AUTH_FORBIDDEN', undefined, 403);
        }
        next();
    };
};
exports.ensureRole = ensureRole;
