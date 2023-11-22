import { Request, Response } from 'express';

import { FilterQuery, Types } from 'mongoose';
import Users, { IUser } from '../models/user.model';
import { ISignupRequestBody } from './auth.controller';

// export interface ISignupRequestBody {
//   name: string;
//   email: string;
//   password: string;
// }

class UserController {
  static async getUserDetails(selector: string): Promise<IUser | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const arrOfSelectors: FilterQuery<IUser>[] = [
          {
            email: selector,
          },
        ];

        if (Types.ObjectId.isValid(selector)) {
          arrOfSelectors.push({
            _id: selector,
          });
        }

        const details: IUser | null = await Users.findOne({
          $or: arrOfSelectors,
        });

        return resolve(details);
      } catch (error) {
        return reject(error);
      }
    });
  }

  static async createUser(body: ISignupRequestBody): Promise<IUser | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const savedUser = await Users.create(body);
        return resolve(savedUser);
      } catch (error) {
        return reject(error);
      }
    });
  }
}

export default UserController;
