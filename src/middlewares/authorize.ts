import type { NextFunction, Request, Response } from "express";
import type { Role } from "../../generated/prisma/client";

const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as Request & { user?: { role: Role } }).user;

    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "You are not authorized. Please log in first.",
      });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        status: 403,
        message: "You are not allowed to perform this action",
      });
    }

    next();
  };
};

export default authorize;
