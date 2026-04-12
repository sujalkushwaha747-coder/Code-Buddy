import prisma from "../config/prisma";

export const createUser = async (data: {
  email: string;
  password: string;
  name?: string;
}) => {
  return prisma.user.create({
    data,
  });
};

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};
