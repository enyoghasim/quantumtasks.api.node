import { Request } from 'express';
import * as core from 'express-serve-static-core';

export interface IRequest<B, P = {}> extends Request {
  body: B;
  params: P & core.ParamsDictionary;
}
