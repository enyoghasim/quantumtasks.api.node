import { Request, Response } from 'express';
import OpenAI from 'openai';
import { sendErrorResponse, sendSuccessResponse } from '../utils/response';
import { MAXIMUM_ACCEPTABLE_TEXT_LENGTH } from '../constants/core';
import { SYSTEM_MESSAGE } from '../constants/ai';

// everything here is just rough code will be updated!

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

class TodoController {
  static async generateTodo(req: Request, res: Response) {
    try {
      const { description } = req.body;
      if (!description?.trim()) {
        return sendErrorResponse(res, 400, null, 'Description is required');
      }
      if (description?.length > MAXIMUM_ACCEPTABLE_TEXT_LENGTH) {
        return sendErrorResponse(res, 400, null, `Description must be less than ${MAXIMUM_ACCEPTABLE_TEXT_LENGTH} characters`);
      }

      const prompt = `Generate a todo list based on the following description: "${description}"`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: SYSTEM_MESSAGE,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
      console.log(response?.choices[0]?.message.content);

      return sendSuccessResponse(res, 200, { todos: JSON.parse(response?.choices[0]?.message.content!) }, 'Todo generated successfully');
    } catch (error) {
      if (error instanceof SyntaxError) {
        return sendSuccessResponse(res, 200, { todos: [] }, 'Todo generated successfully');
      }
      return sendErrorResponse(res);
    }
  }
}

export default TodoController;
