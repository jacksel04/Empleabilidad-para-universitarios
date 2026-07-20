import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const EXCHANGE = 'empleabilidad.events';

let channel = null;

export async function conectarRabbitMQ() {
  try {
    const conn = await amqp.connect(RABBITMQ_URL);
    channel = await conn.createChannel();

    // Declaramos el exchange tipo 'topic' — permite enrutar por nombre de evento
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

    console.log('[RabbitMQ - Postulaciones] Conectado y exchange declarado.');
    return channel;
  } catch (error) {
    console.error('[RabbitMQ - Postulaciones] Error de conexión:', error.message);
    // Reintentar en 5 segundos si falla (RabbitMQ tarda en arrancar en Docker)
    setTimeout(conectarRabbitMQ, 5000);
  }
}

export function publicarEvento(routingKey, payload) {
  if (!channel) {
    console.warn('[RabbitMQ] Canal no disponible. Evento no publicado:', routingKey);
    return;
  }
  const mensaje = Buffer.from(JSON.stringify(payload));
  channel.publish(EXCHANGE, routingKey, mensaje, { persistent: true });
  console.log(`[RabbitMQ] Evento publicado → ${routingKey}`, payload);
}