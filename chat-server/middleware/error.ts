import { CustomRequest } from "../config/express";
import { Response, NextFunction } from "express";

export const error_handler = (
  err: any,
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  console.log(` ${err.message}`);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
};
