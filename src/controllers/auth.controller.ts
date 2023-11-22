import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { sendErrorResponse, sendSuccessResponse } from '../utils/response';
import UserController from './user.controller';

export interface ISignupRequestBody {
  name: string;
  email: string;
  password: string;
}

export interface ILoginRequestBody {
  email: string;
  password: string;
}

class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        // return res.status(400).json({ errors: errors.array() });
        return sendErrorResponse(res, 400, errors.array());
      }
      return sendSuccessResponse(res, 200, null, 'Login successful.');
    } catch (error) {
      return sendErrorResponse(res);
    }
  }

  static async signup(req: Request<{}, {}, ISignupRequestBody>, res: Response) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return sendErrorResponse(res, 400, errors.array());
      }

      const userDetails = await UserController.getUserDetails(req.body.email);

      if (userDetails) {
        return sendErrorResponse(res, 409, null, 'User with that email already exists.');
      }

      // const hashedPassword = await Bun.password.hash(req.body.password);

      const newUser = await UserController.createUser({
        ...req.body,
        // password: hashedPassword,
      });

      if (!newUser) {
        return sendErrorResponse(res, 500, null, 'Error creating user.');
      }

      // TODO   try sending email here
      // TODO   try sending email here

      return sendSuccessResponse(res, 201, null, 'Signup successful, you can now login.');
    } catch (error: any) {
      console.log(error);

      return sendErrorResponse(res);
    }
  }
}

export default AuthController;
