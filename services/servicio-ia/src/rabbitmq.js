import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const EXCHANGE = 'empleabilidad.events';

let channel = null;

export async function conectarRabbitMQ() {
  try {
    const conn = await amqp.connect(RABBITMQ_URL);
    channel = await conn.createChannel();

    // Declaramos el exchange tipo 'topic'
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

    console.log('[RabbitMQ - IA] Conectado y exchange declarado.');
    
    // ==========================================
    // (Opcional) CONFIGURACIÓN PARA ESCUCHAR EVENTOS
    // Si quieres que la IA haga cosas automáticamente cuando se crea una oferta:
    // const q = await channel.assertQueue('ia_queue', { durable: true });
    // await channel.bindQueue(q.queue, EXCHANGE, 'oferta.creada');
    // channel.consume(q.queue, (msg) => { ... });
    // ==========================================

    return channel;
  } catch (error) {
    console.error('[RabbitMQ - IA] Error de conexión:', error.message);
    // Reintentar en 5 segundos si falla
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