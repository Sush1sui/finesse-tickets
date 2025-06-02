import { IUser } from "../../models/User"; // Adjust the path as necessary

declare global {
  namespace Express {
    export interface User extends IUser {}
  }
}
