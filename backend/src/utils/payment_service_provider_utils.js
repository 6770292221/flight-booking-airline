import { StatusMessages } from "../enums/enums.js";
export const paymentServiceProvider = {
  paymentIntents: {
    create: async (paymentData) => {
      return {
        ...paymentData,
        status: StatusMessages.SUCCESS,
      };
    },
  },
};

export const bankPaymentService = {
  paymentIntents: {
    create: async (paymentData) => {
      return {
        ...paymentData,
        status: StatusMessages.SUCCESS,
      };
    },
  },
}