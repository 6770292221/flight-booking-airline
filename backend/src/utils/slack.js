import axios from "axios";
import dotenv from "dotenv";

dotenv.config({path: "../config/config.env"} );


export const sendSlackMessage = async (message) => {
    const slackUrl = process.env.SLACK_WEBHOOK_URL 
    console.log(slackUrl)
  try {
    const response = await axios.post(
      slackUrl,
      { text: message },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Slack Webhook Error:",
      error.response?.data || error.message
    );
  }
};