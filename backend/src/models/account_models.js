import mongoose from "mongoose";
import { userDb } from "../config/connections.js";

class AccountServiceModel {
  constructor(firstName, lastName, password, email, telephone, isAdmin, verified) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.password = password;
    this.email = email;
    this.phoneNumber = telephone;
    this.isAdmin = isAdmin;
    this.verified = verified;
  }

  static getSchema() {
    return new mongoose.Schema(
      {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        password: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phoneNumber: { type: String, required: true },
        isAdmin: { type: Boolean, default: false },
        verified: {
          type: Boolean,
          default: false,
        },

      },
      { timestamps: true }
    );
  }
}

const AccountMongooseModel = userDb.model("users", AccountServiceModel.getSchema());

export { AccountServiceModel, AccountMongooseModel };
