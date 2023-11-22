export interface ISignupRequestBody {
  name: string;
  email: string;
  password: string;
}

export interface ILoginRequestBody {
  email: string;
  password: string;
}
