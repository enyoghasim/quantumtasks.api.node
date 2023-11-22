import express from 'express';
import compression from 'compression';
import cors from 'cors';
import session from 'express-session';
import connectToDb from './config/MongoDB';

import Routes from './routes/index';
import sessionStore from './config/SessionStore';

import { config } from 'dotenv';

config();

const server = (): void => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.disable('x-powered-by');
  app.use(compression());
  app.use(cors());

  app.use(
    session({
      secret: process.env.SESSION_SECRET! as string,
      resave: true,
      saveUninitialized: true,
      store: sessionStore,
      proxy: true,
      cookie: {
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
        sameSite: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    }),
  );

  app.use('/api', Routes);

  connectToDb()
    .then(() => {
      console.log('Connected to DB');
    })
    .then(() => {
      app.listen(process.env.PORT! as string, () => {
        console.log(`Listening on port http://localhost:${process.env.PORT}`);
      });
    })
    .catch(e => {
      console.log(e);
    });
};

export default server;
