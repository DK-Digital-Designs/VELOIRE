"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const error_1 = require("./middleware/error");
// Routes
const auth_1 = __importDefault(require("./routes/auth"));
const public_1 = __importDefault(require("./routes/public"));
const admin_1 = __importDefault(require("./routes/admin"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Security & Base Middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // For demo ease with external images
}));
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// API Routes
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1', public_1.default);
app.use('/api/v1/admin', admin_1.default);
// Serve static files from root
// We assume the server is running from server/dist or server/src
// Root is two levels up from server/src or server/dist
app.use(express_1.default.static(path_1.default.join(__dirname, '../../')));
// Fallback to index.html for SPA-like behavior if needed, 
// though we use multiple HTML files here.
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error Handling (Must be last)
app.use(error_1.errorHandler);
app.listen(PORT, () => {
    console.log(`[Veloire Server] Running on http://localhost:${PORT}`);
    console.log(`[Mode] ${process.env.NODE_ENV || 'development'}`);
});
