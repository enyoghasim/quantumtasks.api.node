// import { Request, Response } from 'express';

import { FilterQuery, ObjectId, Types } from 'mongoose';
import Users, { IUser } from '../models/user.model';
import { ISignupRequestBody } from '../types/auth';
import { caseInSensitiveRegex } from '../utils/helpers';

class UserController {
  static getUserDetails(selector: string | ObjectId, selectDetails?: string): Promise<IUser | null> {
    return new Promise((resolve, reject) => {
      try {
        const arrOfSelectors: FilterQuery<IUser>[] = [
          {
            email: caseInSensitiveRegex(selector.toString()),
          },
        ];

        if (Types.ObjectId.isValid(selector?.toString())) {
          arrOfSelectors.push({
            _id: selector,
          });
        }

        Users.findOne({
          $or: arrOfSelectors,
        })
          .select(selectDetails ?? '')
          .then(details => {
            resolve(details);
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  static async createUser(body: ISignupRequestBody): Promise<IUser | null> {
    return new Promise((resolve, reject) => {
      try {
        Users.create({ ...body, email: body.email.toLowerCase() })
          .then(savedUser => {
            resolve(savedUser);
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default UserController;
