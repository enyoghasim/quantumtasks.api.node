import { Request, Response } from 'express';
import axios from 'axios';
import { createHmac } from 'crypto';
import { IRequest } from '../types/core';
import { sendErrorResponse, sendSuccessResponse } from '../utils/response';
import Payments from '../models/payment.model';
import UserController from './user.controller';

class PaymentController {
  private readonly _paystackBaseUrl: string;

  private readonly _secretKey = process.env.PAYSTACK_TEST_SECRET_KEY || '';

  private readonly _publicKey = process.env.PAYSTACK_TEST_PUBLIC_KEY || '';

  private Axios = axios.create({});

  constructor() {
    this._paystackBaseUrl = 'https://api.paystack.co';
    this.Axios.defaults.headers.common.Authorization = `Bearer ${this._secretKey}`;
    this.Axios.defaults.baseURL = this._paystackBaseUrl;
  }

  initPayment = async (req: IRequest<{ amount: string | number; method?: string }>, res: Response) => {
    try {
      const { amount } = req.body;

      if (!amount) {
        return sendErrorResponse(res, 400, null, 'Amount is required.');
      }

      if (Number(amount) < 100) {
        return sendErrorResponse(res, 400, null, 'Amount must be at least 100.');
      }

      const { method } = req.body;

      if (method === 'paystack' || !method) {
        const { data } = await this.Axios.post('/transaction/initialize', {
          amount: Number(amount) * 100,
          email: req.user?.email,
        });

        if (!data?.data?.authorization_url) {
          return sendErrorResponse(res, 500, null, 'Error initializing payment.');
        }

        return sendSuccessResponse(
          res,
          200,
          {
            url: data.data.authorization_url,
          },
          'Payment initialized successfully.',
        );
      }

      return sendErrorResponse(res, 400, null, 'Invalid payment method.');
    } catch (error) {
      return sendErrorResponse(res);
    }
  };

  handlePaystackWebhook = async (req: Request, res: Response) => {
    try {
      const hash = createHmac('sha512', this._secretKey).update(JSON.stringify(req.body)).digest('hex');

      if (hash === req.headers['x-paystack-signature']) {
        console.log('Valid Paystack webhook received.');

        const { event, data } = req.body;

        switch (event) {
          case 'charge.success':
            if (data) {
              const { id, reference, customer } = data;

              if (id && reference) {
                const paymentWithRef = await Payments.findOne({ reference, id });

                if (!paymentWithRef) {
                  const userWithDetails = await UserController.getUserDetails(customer.email);

                  if (userWithDetails) {
                    const payment = new Payments({
                      amount: data.amount / 100,
                      type: 'deposit',
                      user: userWithDetails._id,
                      id,
                      reference,
                      status: 'successful',
                      method: 'paystack',
                    });

                    await payment.save();

                    userWithDetails.balance = Number(userWithDetails.balance) + data.amount / 100;

                    await userWithDetails.save();
                  }
                }
                // if (!paymentWithRef) {
                //   await Payments.create({
                //     amount: data.amount / 100,
                //     type: 'deposit',
                //     user: req.user?._id,
                //     id,
                //     reference,
                //     status: 'successful',
                //   });
                // }
              }
            }

            break;
          case 'transfer.success':
            // await this.handleSuccessfulTransfer(data);
            break;
          default:
            break;
        }

        return sendSuccessResponse(res, 200, null, 'Webhook received successfully.');
      }

      return sendErrorResponse(res);
    } catch (error) {
      return sendErrorResponse(res);
    }
  };
}

export default PaymentController;
