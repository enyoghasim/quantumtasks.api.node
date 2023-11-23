import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { compare, genSalt, hash } from 'bcryptjs';
import { Ipware } from '@fullerstack/nax-ipware';
import userAgent from 'express-useragent';
import { sendErrorResponse, sendSuccessResponse } from '../utils/response';
import UserController from './user.controller';
import {
  IForgetPasswordRequestBody,
  IRequest,
  ILoginRequestBody,
  ISignupRequestBody,
  IResetPasswordRequestBody,
  IResetPasswordRequestParams,
} from '../types/auth';
import sessionStore from '../config/SessionStore';

class AuthController {
  static async login(req: IRequest<ILoginRequestBody>, res: Response) {
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

      const ipware = new Ipware();

      const ipInfo = ipware.getClientIP(req);
      const deviceInfo: string | undefined = req.headers['user-agent'];

      if (deviceInfo) {
        const agentDetails = userAgent.parse(deviceInfo);
        const loggedInDevices = userDetails?.loggedInDevices;

        const deviceWithCurrenSessionId = loggedInDevices.find(device => device.sessionID === req.sessionID);

        if (deviceWithCurrenSessionId) {
          deviceWithCurrenSessionId.updatedAt = new Date();
          userDetails.loggedInDevices = loggedInDevices.map(device => {
            if (device.sessionID === req.sessionID) {
              return deviceWithCurrenSessionId;
            }

            return device;
          });
        } else {
          let newHistory = [
            {
              ip: ipInfo?.ip!,
              os: agentDetails.os,
              platform: agentDetails.platform,
              source: agentDetails.source,
              browser: agentDetails.browser,
              version: agentDetails.version,
              updatedAt: new Date(),
              sessionID: req.sessionID,
            },
            ...userDetails.loggedInDevices,
          ];

          newHistory = newHistory.length > 10 ? newHistory.slice(0, 10) : newHistory;

          userDetails.loggedInDevices = newHistory;
        }
      }

      userDetails.activeSession = req.sessionID;
      await userDetails.save();

      return sendSuccessResponse(res, 201, null, 'Login successful.');
    } catch (error) {
      return sendErrorResponse(res);
    }
  }

  static async signup(req: IRequest<ISignupRequestBody>, res: Response) {
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

  static async logout(req: Request, res: Response) {
    try {
      const user = req?.user;

      if (!user) {
        return sendErrorResponse(res, 401, null, 'Unauthorized.');
      }

      return req.session.destroy(err => {
        if (err) {
          return sendErrorResponse(res);
        }

        return sendSuccessResponse(res, 200, null, 'Logout successful.');
      });
    } catch (error) {
      return sendErrorResponse(res);
    }
  }

  static async forgotPassword(req: IRequest<IForgetPasswordRequestBody>, res: Response) {
    try {
      return sendSuccessResponse(res, 200, null, 'Password reset link sent successfully.');
    } catch (error) {
      return sendErrorResponse(res);
    }
  }

  static async resetPassword(req: IRequest<IResetPasswordRequestBody, IResetPasswordRequestParams>, res: Response) {
    try {
      return sendSuccessResponse(res, 200, null, 'Password reset successfully.');
    } catch (error) {
      return sendErrorResponse(res);
    }
  }
}

export default AuthController;
