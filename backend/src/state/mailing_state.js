export class EmailState {
    async sendEmail( { bookingResponse, reqUser }) {
      throw new Error("sendEmail() must be implemented in each state.");
    }
  }
  