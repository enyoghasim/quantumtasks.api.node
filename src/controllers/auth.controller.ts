import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { compare, genSalt, hash } from 'bcryptjs';
import { sendErrorResponse, sendSuccessResponse } from '../utils/response';
import UserController from './user.controller';
import { ISignupRequestBody } from '../types/auth';
import sessionStore from '../config/SessionStore';

class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        // return res.status(400).json({ errors: errors.array() });
        return sendErrorResponse(res, 400, errors.array(), 'An error occurred.');
      }

      const userDetails = await UserController.getUserDetails(req.body.email);

      if (!userDetails) {
        return sendErrorResponse(res, 401, null, 'Invalid credentials.');
      }

      const isPasswordValid = await compare(req.body.password, userDetails.password);

      if (!isPasswordValid) {
        return sendErrorResponse(res, 401, null, 'Invalid credentials.');
      }

      req.session.user = {
        _id: userDetails?._id,
      };

      if (userDetails.activeSession !== req.sessionID) {
        sessionStore.destroy(userDetails.activeSession);
      }

      userDetails.activeSession = req.sessionID;
      await userDetails.save();

      return sendSuccessResponse(res, 201, null, 'Login successful.');
    } catch (error) {
      return sendErrorResponse(res);
    }
  }

  static async signup(req: Request<{}, {}, ISignupRequestBody>, res: Response) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return sendErrorResponse(res, 400, errors.array(), 'An error occurred.');
      }

      const userDetails = await UserController.getUserDetails(req.body.email);

      if (userDetails) {
        return sendErrorResponse(res, 409, null, 'User with that email already exists.');
      }

      const salt = await genSalt(10);
      const hashedPassword = await hash(req.body.password, salt);
      const newUser = await UserController.createUser({
        ...req.body,
        password: hashedPassword,
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
