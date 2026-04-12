declare module "morgan";
declare module "cors";

declare namespace Express {
  interface Request {
    auth?: {
      id: string;
      email?: string;
      iat?: number;
      exp?: number;
    };
    user?: {
      id: string;
      email?: string;
      iat?: number;
      exp?: number;
    };
    requestId?: string;
  }
}
