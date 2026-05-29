export interface userInterface {
  id?: string;
  name: string;
  email: string;
  age: string;
  role?: "admin" | "agent" | "user";
  password: string;
  is_active?: string;
}
