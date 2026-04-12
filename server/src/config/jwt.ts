import jwt from "jsonwebtoken";
import { env } from "./env";

const JWT_SECRET = env.JWT_SECRET;

export type AuthTokenPayload = {
  id: string;
  email?: string;
  iat?: number;
  exp?: number;
};

export const signAuthToken = (payload: { id: string; email?: string }) =>
  jwt.sign(payload, JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });

export const verifyAuthToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
};
