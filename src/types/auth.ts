import { Request } from 'express';
import * as core from 'express-serve-static-core';

export interface IRequest<B, P = {}> extends Request {
  body: B;
  params: P & core.ParamsDictionary;
}

export interface ISignupRequestBody {
  name: string;
  email: string;
  password: string;
}

export interface ILoginRequestBody {
  email: string;
  password: string;
}

export interface IUserLoginDeviceDetails {
  ip: string;
  os: string;
  platform: string;
  source: string;
  browser: string;
  version: string;
  updatedAt: Date;
  sessionID: string;
}

export interface IForgetPasswordRequestBody {
  email: string;
}

export interface IResetPasswordRequestParams {
  selector: string;
  token: string;
}
export interface IResetPasswordRequestBody {
  password: string;
  confirmPassword: string;
}
