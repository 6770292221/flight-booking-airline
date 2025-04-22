import { Kafka } from 'kafkajs';
import axios from 'axios';

const kafka = new Kafka({
    clientId: 'ticket-consumer',
    brokers: ['localhost:9093'],
});

const consumer = kafka.consumer({ groupId: 'ticket-consumer-group' });

export async function startTicketConsumer() {
    await consumer.connect();
    await consumer.subscribe({ topic: 'dev-ticket-request-event', fromBeginning: false });

    console.log('ticket-consumer listening for messages...');

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            try {
                const raw = message.value?.toString();
                const parsed = JSON.parse(raw);
                const bookingNumber = parsed.bookingNumber;


                if (!bookingNumber) {
                    console.error('bookingNumber not found in message');
                    return;
                }

                const port = process.env.PORT || 3001;
                const url = `http://localhost:${port}/api/v1/ticket-core-api/ticket/${bookingNumber}/request-ticket-issued`;

                console.log(`Consume Message: bookingNumber: ${bookingNumber}`);
                const res = await axios.get(url);
                console.log(`API call success! Status: ${res.status}`);
            } catch (err) {
                console.error('Failed to handle Kafka message or call API:', err.message);
            }
        },
    });
}
