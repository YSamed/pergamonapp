import type { User } from '../types';
import { mockUser } from '../mock';

let _user: User = { ...mockUser };

export const profileService = {
  async getProfile(): Promise<User> {
    return _user;
  },

  async updateProfile(updates: Partial<Pick<User, 'displayName' | 'avatarUrl'>>): Promise<User> {
    _user = { ..._user, ...updates };
    return _user;
  },
};
