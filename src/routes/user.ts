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
        balance: user.balance,
      },
      'User details retrieved successfully.',
    );
  } catch (error) {
    return sendErrorResponse(res);
  }
});

export default router;
