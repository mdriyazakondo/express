export const USER_ROLE = {
  admin: "admin",
  agent: "agent",
  user: "user",
} as const;

export type UserRole = "admin" | "agent" | "user";
