import { Prisma } from '../../generated/prisma/client.js';

export const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  googleId: true,
  githubId: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
  online: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{
  select: typeof safeUserSelect;
}>;
