import { Router, Request, Response } from 'express';
import { sendErrorResponse, sendSuccessResponse } from '../utils/response';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const user = req?.user;

    if (!user) {
      return sendErrorResponse(res, 401, null, 'Unauthorized.');
    }

    return sendSuccessResponse(
      res,
      200,
      {
        _id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      'User details retrieved successfully.',
    );
  } catch (error) {
    return sendErrorResponse(res);
  }
});

router.get('/security/login-history', async (req: Request, res: Response) => {
  try {
    const user = req?.user;

    if (!user) {
      return sendErrorResponse(res, 401, null, 'Unauthorized.');
    }

    return sendSuccessResponse(
      res,
      200,
      user.loggedInDevices.map(e => {
        return {
          ip: e.ip,
          os: e.os,
          platform: e.platform,
          source: e.source,
          browser: e.browser,
          version: e.version,
          updatedAt: e.updatedAt,
          isCurrentSession: e.sessionID === req.sessionID,
        };
      }),
      'Login history retrieved successfully.',
    );
  } catch (error) {
    return sendErrorResponse(res);
  }
});

export default router;
