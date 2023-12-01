export interface ISignupRequestBody {
  name: string;
  email: string;
  password: string;
}

export interface ILoginRequestBody {
  email: string;
  password: string;
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
