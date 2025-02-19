// import mongoose from "mongoose";

// class AccountServiceModel {
//   constructor(name, password, email, telephone, isAdmin) {
//     this.name = name;
//     this.password = password;
//     this.email = email;
//     this.telephone = telephone;
//     this.isAdmin = isAdmin;
//   }

//   static getSchema() {
//     return new mongoose.Schema(
//       {
//         name: { type: String, required: true },
//         password: { type: String, required: true },
//         email: { type: String, required: true, unique: true },
//         telephone: { type: String, required: true },
//         isAdmin: { type: Boolean, default: false },
//       },
//       { timestamps: true }
//     );
//   }
// }

// const AccountMongooseModel = mongoose.model("Account", AccountServiceModel.getSchema());

// export { AccountServiceModel, AccountMongooseModel };
