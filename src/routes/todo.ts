import { Request, Response, Router } from 'express';
import { sendErrorResponse, sendSuccessResponse } from '../utils/response';
import TodoController from '../controllers/todo.controllers';

const router = Router();

router.post('/generate', TodoController.generateTodo);

router.post('/update-todo-details', async (req: Request, res: Response) => {
  try {
    return sendSuccessResponse(res, 200, { todoList: 'todoList' }, 'Todo updated successfully');
  } catch (error) {
    return sendErrorResponse(res);
  }
});

export default router;
