import { Document, model, Schema } from 'mongoose';

export interface IPayment extends Document {
  amount: number;
  type: string;
  user: Schema.Types.ObjectId;
  id: string;
  reference: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  method: string;
}

const PaymentSchema = new Schema<IPayment>(
  {
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal'],
    },
    id: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    reference: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'failed', 'successful'],
      default: 'pending',
    },
    method: {
      type: String,
      enum: ['paystack'],
      default: 'paystack',
    },
  },
  {
    timestamps: true,
  },
);

export default model<IPayment>('Payments', PaymentSchema);
