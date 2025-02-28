import { IUser } from '../entities/user.interface';

export interface IUserService {
  create(userData: Partial<IUser>): Promise<IUser>;
  findById(id: string): Promise<IUser>;
  findByEmail(email: string): Promise<IUser>;
  update(id: string, userData: Partial<IUser>): Promise<IUser>;
  delete(id: string): Promise<boolean>;
  changePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<boolean>;
}
