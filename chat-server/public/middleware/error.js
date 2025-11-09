"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error_handler = void 0;
const error_handler = (err, req, res, next) => {
    console.log(` ${err.message}`);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: "error",
        message: err.message || "Internal Server Error",
    });
};
exports.error_handler = error_handler;
