export interface RegisterInput {
  email: string;
  displayName: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UserData {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthToken {
  user: UserData;
}
