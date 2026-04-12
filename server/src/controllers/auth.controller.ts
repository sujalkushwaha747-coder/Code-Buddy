import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { signAuthToken } from "../config/jwt";

// ------------------ REGISTER ------------------
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // ✅ check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User already exists",
        requestId: (req as any).requestId,
      });
    }

    // ✅ hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    res.json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Register error:", error.message);
    res.status(500).json({
      success: false,
      error: "Register failed",
      requestId: (req as any).requestId,
    });
  }
};

// ------------------ LOGIN ------------------
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // ✅ find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "User not found",
        requestId: (req as any).requestId,
      });
    }

    // ✅ compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Invalid credentials",
        requestId: (req as any).requestId,
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        githubToken: null,
      },
    });

    // ✅ generate JWT
    const token = signAuthToken({ id: user.id, email: user.email });

    res.json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error: any) {
    console.error("Login error:", error.message);
    res.status(500).json({
      success: false,
      error: "Login failed",
      requestId: (req as any).requestId,
    });
  }
};
