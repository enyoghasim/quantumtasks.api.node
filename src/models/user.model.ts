import { Document, model, Schema } from 'mongoose';
import { IUserLoginDeviceDetails } from '../types/auth';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  activeSession: string;
  createdAt: Date;
  updatedAt: Date;
  loggedInDevices: IUserLoginDeviceDetails[];
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    activeSession: {
      type: String,
    },
    loggedInDevices: {
      type: [Object],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default model<IUser>('Users', UserSchema);
