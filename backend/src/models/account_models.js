import mongoose from "mongoose";

class AccountServiceModel {
  constructor(firstName, lastName, password, email, telephone, isAdmin, twoFactorSecret, qrCode, verified) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.password = password;
    this.email = email;
    this.phoneNumber = telephone;
    this.isAdmin = isAdmin;
    this.twoFactorSecret = twoFactorSecret;
    this.qrCode = qrCode;
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
        twoFactorSecret: { type: String, required: true },
        qrCode: { type: String, required: true },
        verified: {
          type: Boolean,
          default: false,
        },

      },
      { timestamps: true }
    );
  }
}

const AccountMongooseModel = mongoose.model("Account", AccountServiceModel.getSchema());

export { AccountServiceModel, AccountMongooseModel };
