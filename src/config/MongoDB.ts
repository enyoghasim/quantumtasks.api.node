import { connect, connection, MongooseError } from 'mongoose';

import { config } from 'dotenv';

config();

const connectToDb = (): Promise<MongooseError | null | any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const connectDetails = await connect(process.env.MONGO_URI! as string);
      return resolve(connectDetails);
    } catch (error: MongooseError | any) {
      console.log(error);
      reject(error);
    }
  });
};

// export { connection };
export default connectToDb;
