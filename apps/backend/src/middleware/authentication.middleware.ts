import type { Response, Request, NextFunction } from "express";
import prisma from "@repo/db/client";

export async function authenticationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Check if session and sessionId exist
  if (!req.session || !req.session.sessionId) {
    res.status(401).json({ error: "Unauthorized - No session" });
    return;
  }

  try {
    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: req.session.sessionId },
    });

    if (!user) {
      // User doesn't exist - session is invalid
      req.session.destroy((err) => {
        if (err) console.error("Session destroy error:", err);
      });
      res.status(401).json({ error: "Unauthorized - User not found" });
      return;
    }

    // User is valid, proceed
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
