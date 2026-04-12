import { Request, Response } from "express";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    res.json({
      message: "User profile fetched successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch profile",
    });
  }
};
