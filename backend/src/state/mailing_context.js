export class EmailContext {
  constructor() {
    this.state = null;
  }

  setState(state) {
    this.state = state;
  }

  async sendEmail({data, reqUser}) {
    if (!this.state) {
      throw new Error("❗ Email state is not defined.");
    }

    try {
      await this.state.sendEmail({data, reqUser});
    } catch (error) {
      console.error(`❗ Failed to send email: ${error.message}`);
    }
  }
}
