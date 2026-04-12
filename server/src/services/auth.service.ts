import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "../repositories/user.repository";
import { prisma } from "../config/prisma";

// REGISTER USER
export const registerUser = async (
  email: string,
  password: string,
  name?: string
) => {
  // Check if user already exists
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password using :contentReference[oaicite:0]{index=0}
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user in database using :contentReference[oaicite:1]{index=1}
  const user = await createUser({
    email,
    password: hashedPassword,
    name,
  });

  // Remove password before returning user
  const { password: _, ...safeUser } = user;

  return safeUser;
};

// LOGIN USER
export const loginUser = async (email: string, password: string) => {
  // Find user by email
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Compare password with bcrypt
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      githubToken: null,
    },
  });

  // Generate token using :contentReference[oaicite:2]{index=2}
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET as string,
    { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"] }
  );

  // Remove password before returning user
  const { password: _, ...safeUser } = user;

  return {
    token,
    user: safeUser,
  };
};
