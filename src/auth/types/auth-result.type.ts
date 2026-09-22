import { SafeUser } from 'src/user/types/safe-user.type.js';

export type AuthResult = {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
};
