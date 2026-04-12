import { prisma } from "../config/prisma";

type AuthPayload = {
  id?: string;
  email?: string;
};

export const updateUserGithubToken = async (
  userId: string,
  token: string
) => {
  return prisma.user.update({
    where: { id: userId },
    data: { githubToken: token },
  });
};

export const clearUserGithubToken = async (userId: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { githubToken: null },
  });
};

export const getUserGithubToken = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { githubToken: true },
  });

  return user?.githubToken || null;
};

export const resolveAuthenticatedUser = async (payload?: AuthPayload | null) => {
  if (!payload) {
    return null;
  }

  if (payload.id) {
    const userById = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, name: true, githubToken: true },
    });

    if (userById) {
      return userById;
    }
  }

  if (payload.email) {
    const userByEmail = await prisma.user.findUnique({
      where: { email: payload.email },
      select: { id: true, email: true, name: true, githubToken: true },
    });

    if (userByEmail) {
      return userByEmail;
    }
  }

  return null;
};
