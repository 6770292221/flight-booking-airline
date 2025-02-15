import express from "express";
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
    // throw new Error("Failed to send message to Slack");
  }
};

// app.post("/slack/send", async (req, res) => {
//   const { text } = req.body;

//   if (!text) {
//     return res.status(400).json({ error: "Text message is required" });
//   }

//   try {
//     await sendSlackMessage(text);
//     res.json({ success: true, message: "Message sent to Slack successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
