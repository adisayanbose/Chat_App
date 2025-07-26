import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export function userauth(req: Request, res: Response, next: NextFunction) {
  if (process.env.JWT_SECRET && req.headers.token) {
    const token = req.headers.token;
    try {
      const data = jwt.verify(token as string, process.env.JWT_SECRET);
      req.userId = (data as JwtPayload).userId;
      next();
    } catch (e) {
      res.json({
        message:"unauthorized",
        error:e
      })
    }
  } else {
    if (!req.headers.token) {
      res.json({
        message: "unauthorized access",
      });
    }
    if (!process.env.JWT_SECRET) {
      res.json({
        message: "JWT_SECRET not provided",
      });
    }
  }
}
