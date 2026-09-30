import { SafeUser } from '../../user/types/safe-user.type.js';

export type AuthResult = {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
};
