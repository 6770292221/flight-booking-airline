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
        firstName: {
          type: String,
          required: [true, "First name is required"],
          minlength: [2, "First name must be at least 2 characters"],
          maxlength: [50, "First name cannot exceed 50 characters"],
          trim: true,
        },
        lastName: {
          type: String,
          required: [true, "Last name is required"],
          minlength: [2, "Last name must be at least 2 characters"],
          maxlength: [50, "Last name cannot exceed 50 characters"],
          trim: true,
        },
        password: {
          type: String,
          required: false,
          minlength: [6, "Password must be at least 6 characters"],
          maxlength: [20, "Password cannot exceed 20 characters"],
        },
        email: {
          type: String,
          required: [true, "Email is required"],
          unique: true,
          trim: true,
          lowercase: true,
          match: [/^[\w.-]+@[\w.-]+\.\w{2,}$/, "Please enter a valid email address"],
        },
        phoneNumber: {
          type: String,
          required: false,
          match: [/^\d{10}$/, "Phone number must be 10 digits"],
        },
        isAdmin: {
          type: Boolean,
          default: false,
        },
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
