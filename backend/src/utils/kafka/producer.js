import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'payment-service',
    brokers: ['localhost:9093'],
});

const producer = kafka.producer();
let isConnected = false;

export async function sendTicketRequestToKafka({ bookingNumber }) {
    try {
        if (!isConnected) {
            console.log("Connecting to Kafka @ kafka:9092...");
            await producer.connect();
            isConnected = true;
        }

        console.log("Sending Kafka message:", { bookingNumber });

        await producer.send({
            topic: 'dev-ticket-request-event',
            messages: [
                {
                    key: bookingNumber.toString(),
                    value: JSON.stringify({ bookingNumber }),
                },
            ],
        });

        console.log("Kafka message sent!");
    } catch (error) {
        console.error("Kafka send failed:", error);
    }
}

