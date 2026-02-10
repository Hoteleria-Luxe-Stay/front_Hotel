import { UserResponse } from "./userResponse.interface";

export type RegisterRequest = {
  username: string | null;
  email: string | null;
  password: string | null;
  telefono: string | null;

}

export type LoginRequest = {
  email: string | null;
  password: string | null;
}


export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
}

export type PasswordResetRequest = {
  email: string | null;
}

export type PasswordResetVerifyRequest = {
  email: string | null;
  code: string | null;
}

export type PasswordResetConfirmRequest = {
  email: string | null;
  code: string | null;
  newPassword: string | null;
}




