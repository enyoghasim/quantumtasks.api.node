import { Document, model, Schema } from 'mongoose';

export interface IResetPasswordToken extends Document {
  user: Schema.Types.ObjectId;
  selector: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

const ResetPasswordTokenSchema = new Schema<IResetPasswordToken>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    selector: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default model<IResetPasswordToken>('ResetPasswordTokens', ResetPasswordTokenSchema);
