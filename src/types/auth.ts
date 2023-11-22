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
