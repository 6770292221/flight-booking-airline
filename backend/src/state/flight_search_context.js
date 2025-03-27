import redisClient from '../utils/redis_utils.js';
export class FlightSearchContext {

  setState(state) {
    this.state = state;
  }

  async search(reqBody, sharedData) {
    if (!this.state) {
      throw new Error("❗ Flight search state is not defined.");
    }
    return await this.state.search(reqBody, sharedData);
  }
}