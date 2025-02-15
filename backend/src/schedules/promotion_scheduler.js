import cron from 'node-cron';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: "./src/config/config.env" });

export const sendPromotion = async () => {
    try {
        console.log('Sending promotion...');
        const promotionMessage = {
            messages: [
                {
                    type: 'text',
                    text: '🎉 Special Promotion! Get 20% off your next purchase! 🎉'
                }
            ]
        };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.LINE_BOT_ACCESS_TOKEN}`
            }
        };

        const response = await axios.post(process.env.LINE_BOT_URL, promotionMessage, config);
        console.log('Promotion sent successfully:', response.data);
    } catch (error) {
        console.error('Error sending promotion:', error);
    }
};

// cron.schedule('0 7 * * *', sendPromotion);
// cron.schedule('*/1 * * * *', sendPromotion); 
