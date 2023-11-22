import 'express-session';
import { Schema } from 'mongoose';

declare module 'express-session' {
  interface SessionData {
    user: {
      _id: Schema.Types.ObjectId;
    };
  }
}
