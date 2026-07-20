import amqp from 'amqplib';
import { supabase } from './supabase.js';
import 'dotenv/config';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const EXCHANGE = 'empleabilidad.events';
const QUEUE = 'cola.bi';

async function iniciarWorkerBI() {
  try {
    const conn = await amqp.connect(RABBITMQ_URL);
    const channel = await conn.createChannel();

    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    await channel.assertQueue(QUEUE, { durable: true });

    // BI se suscribe a TODOS los eventos para reportes
    await channel.bindQueue(QUEUE, EXCHANGE, 'oferta.creada');
    await channel.bindQueue(QUEUE, EXCHANGE, 'postulacion.creada');

    console.log('[Servicio BI] Worker activo. Escuchando eventos...');

    channel.prefetch(1);
    channel.consume(QUEUE, async (msg) => {
      if (!msg) return;
      try {
        const evento = JSON.parse(msg.content.toString());
        const routingKey = msg.fields.routingKey;

        // Guardar en DB Reportes según tipo de evento
        await supabase.from('reportes').insert([{
          tipo_evento: routingKey,
          payload: evento,
          timestamp: evento.timestamp
        }]);

        console.log(`[BI] Reporte guardado para evento: ${routingKey}`);
        channel.ack(msg);
      } catch (error) {
        console.error('[BI] Error:', error.message);
        channel.nack(msg, false, false);
      }
    });
  } catch (error) {
    console.error('[BI] Error conectando:', error.message);
    setTimeout(iniciarWorkerBI, 5000);
  }
}

iniciarWorkerBI();