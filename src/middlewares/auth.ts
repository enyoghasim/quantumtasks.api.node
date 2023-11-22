import { NextFunction, Request, Response } from 'express';
import { sendErrorResponse } from '../utils/response';
import UserController from '../controllers/user.controller';

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.session.user?._id) {
      const userDetails = await UserController.getUserDetails(req.session.user?._id);

      if (!userDetails) {
        return sendErrorResponse(res, 401, null, 'Unauthorized.');
      }

      req.user = userDetails;
      return next();
    }
    return sendErrorResponse(res, 401, null, 'Unauthorized.');
  } catch (error) {
    return sendErrorResponse(res, 401, null, 'Unauthorized.');
  }
};

export default requireAuth;
