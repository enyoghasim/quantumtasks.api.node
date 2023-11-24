import { Request, Response } from 'express';
import { compare, genSalt, hash } from 'bcryptjs';
import { Ipware } from '@fullerstack/nax-ipware';
import userAgent from 'express-useragent';
import { config } from 'dotenv';
import isEmail from 'validator/lib/isEmail';
import isHexadecimal from 'validator/lib/isHexadecimal';
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
import ResetPasswordTokens from '../models/resetPasswordTokens';
import { generateRandomHexadecimalToken } from '../utils/helpers';

config();

class AuthController {
  static async login(req: IRequest<ILoginRequestBody>, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email?.trim() || !password?.trim()) {
        return sendErrorResponse(res, 401, null, 'All fields are required');
      }

      if (password.length < 8) {
        return sendErrorResponse(res, 401, null, 'Invalid credentials.');
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
      const { email, password, name } = req.body;

      if (!email?.trim() || !password?.trim() || !name?.trim()) {
        return sendErrorResponse(res, 401, null, 'All fields are required');
      }

      if (!isEmail(email)) {
        return sendErrorResponse(res, 401, null, 'Invalid email address.');
      }

      if (!/^[a-zA-Z ]+$/.test(name)) {
        return sendErrorResponse(res, 401, null, 'Name can only contain letters and spaces.');
      }

      if (password.length < 8) {
        return sendErrorResponse(res, 401, null, 'Password must be at least 8 characters long.');
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
      const { email } = req.body;

      if (!email?.trim()) {
        return sendErrorResponse(res, 401, null, 'Email is required.');
      }

      if (!isEmail(email)) {
        return sendErrorResponse(res, 401, null, 'Invalid email.');
      }

      const userDetails = await UserController.getUserDetails(req.body.email);

      if (!userDetails) {
        return sendErrorResponse(res, 404, null, 'User with that email does not exist.');
      }

      await ResetPasswordTokens.deleteMany({
        user: userDetails._id,
      });

      const selector = generateRandomHexadecimalToken();
      const token = generateRandomHexadecimalToken();

      const salt = await genSalt(10);
      const hashedToken = await hash(token, salt);

      const resetPasswordToken = await ResetPasswordTokens.create({
        user: userDetails._id,
        selector,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 15),
      });

      if (!resetPasswordToken) {
        return sendErrorResponse(res, 500, null, 'Error creating reset password token.');
      }

      // TODO   try sending email here
      console.log(`token is http://localhost:${process.env.PORT}/api/auth/reset-password/${selector}/${token}`);
      // TODO   try sending email here

      return sendSuccessResponse(res, 200, null, 'Password reset link sent successfully please check your email.');
    } catch (error) {
      return sendErrorResponse(res);
    }
  }

  static async resetPassword(req: IRequest<IResetPasswordRequestBody, IResetPasswordRequestParams>, res: Response) {
    try {
      const { password, confirmPassword } = req.body;
      const { selector, token } = req.params;

      if (!selector?.trim() || !token?.trim()) {
        return sendErrorResponse(res, 401, null, 'All fields are required.');
      }

      if (!isHexadecimal(selector) || !isHexadecimal(token)) {
        return sendErrorResponse(res, 401, null, 'Invalid password reset link');
      }

      if (!password?.trim() || !confirmPassword?.trim()) {
        return sendErrorResponse(res, 401, null, 'All fields are required.');
      }

      if (password.length < 8) {
        return sendErrorResponse(res, 401, null, 'Password must be at least 8 characters long.');
      }

      if (password !== confirmPassword) {
        return sendErrorResponse(res, 401, null, 'Passwords do not match.');
      }

      const resetPasswordToken = await ResetPasswordTokens.findOne({
        selector,
        expiresAt: {
          $gt: new Date(),
        },
      });

      if (!resetPasswordToken) {
        return sendErrorResponse(res, 401, null, 'Invalid password reset link');
      }

      const isTokenValid = await compare(token, resetPasswordToken.token);

      if (!isTokenValid) {
        return sendErrorResponse(res, 401, null, 'Invalid password reset link');
      }

      const userDetails = await UserController.getUserDetails(resetPasswordToken.user);

      if (!userDetails) {
        return sendErrorResponse(res, 404, null, 'User with that email does not exist.');
      }

      const salt = await genSalt(10);

      userDetails.password = await hash(password, salt);

      await userDetails.save();

      return sendSuccessResponse(res, 200, null, 'Password reset successfully.');
    } catch (error) {
      return sendErrorResponse(res);
    }
  }
}

export default AuthController;
