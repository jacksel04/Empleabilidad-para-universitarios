import amqp from 'amqplib';
import 'dotenv/config';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const EXCHANGE = 'empleabilidad.events';
const QUEUE = 'cola.notificaciones';

async function iniciarWorker() {
  try {
    const conn = await amqp.connect(RABBITMQ_URL);
    const channel = await conn.createChannel();

    // Declarar exchange (debe coincidir con el publicador)
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

    // Declarar la cola propia de este servicio
    await channel.assertQueue(QUEUE, { durable: true });

    // Suscribirse SOLO a eventos de postulación (según arquitectura)
    await channel.bindQueue(QUEUE, EXCHANGE, 'postulacion.creada');

    console.log('[Servicio Notificaciones] Worker activo. Esperando eventos...');

    // Procesar mensajes de uno en uno (prefetch: 1)
    channel.prefetch(1);
    channel.consume(QUEUE, async (msg) => {
      if (!msg) return;

      try {
        const evento = JSON.parse(msg.content.toString());
        console.log('[Notificaciones] Evento recibido:', evento);

        // Aquí va la lógica de notificación según el canal que uses:
        await procesarNotificacion(evento);

        // Confirmar que el mensaje fue procesado correctamente
        channel.ack(msg);
      } catch (error) {
        console.error('[Notificaciones] Error procesando mensaje:', error.message);
        // Rechazar y NO reencolar (evita loop infinito con mensajes corruptos)
        channel.nack(msg, false, false);
      }
    });

  } catch (error) {
    console.error('[Notificaciones] Error conectando a RabbitMQ:', error.message);
    setTimeout(iniciarWorker, 5000); // Reintentar en 5s
  }
}

async function procesarNotificacion(evento) {
  const { estudiante_id, oferta_id, titulo_puesto, empresa_nombre } = evento;

  // --- Canal EMAIL (simulado — integrar con SendGrid, Nodemailer, etc.) ---
  console.log(`[EMAIL] → Estudiante ${estudiante_id}`);
  console.log(`  Asunto: Tu postulación fue recibida`);
  console.log(`  Cuerpo: Te postulaste a "${titulo_puesto}" en ${empresa_nombre}.`);

  // --- Canal SMS (simulado — integrar con Twilio, etc.) ---
  console.log(`[SMS] → Enviando SMS a estudiante ${estudiante_id}`);

  // --- Canal PUSH (simulado — integrar con Firebase FCM, etc.) ---
  console.log(`[PUSH] → Notificación push para estudiante ${estudiante_id}`);

  // Ejemplo real con Nodemailer (descomenta si lo usas):
  // await transporter.sendMail({
  //   from: 'noreply@unmsm.edu.pe',
  //   to: correoEstudiante,
  //   subject: `Postulación recibida: ${titulo_puesto}`,
  //   text: `Tu postulación a "${titulo_puesto}" en ${empresa_nombre} fue registrada.`
  // });
}

iniciarWorker();