export interface AuthUser {
  id: number;
  username: string;
  role: string;
  key: string;
}

export interface Credentials {
  username: string;
  password: string;
  key?: string;
}
