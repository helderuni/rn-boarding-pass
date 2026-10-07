/* eslint-env node */
const fastify = require('fastify')({
  logger: true,
});

const { createTravelPass } = require('./apple/createTravelPass');
const { createGooglePass } = require('./google/createGooglePass');

fastify.get('/', function (request, reply) {
  reply.send({ status: 'ok' });
});

fastify.post('/', async (request, reply) => {
  const { name, tenantId } = request.body ?? {};

  try {
    const buffer = await createTravelPass({ tenantId, name });
    reply.header('Content-Type', 'application/vnd.apple.pkpass');
    reply.send(buffer);
  } catch (error) {
    const statusCode = error.statusCode ?? 500;
    reply.code(statusCode).send({ status: 'error', message: error.message });
  }
});

fastify.post('/google', async (request, reply) => {
  const { name, tenantId } = request.body ?? {};

  try {
    const result = await createGooglePass({ tenantId, name });
    reply.send(result);
  } catch (error) {
    const statusCode = error.statusCode ?? 500;
    request.log.error({ statusCode, message: error.message }, 'google pass failed');
    reply.code(statusCode).send({ status: 'error', message: error.message });
  }
});

fastify.listen({ port: process.env.PORT ?? 3000, host: '0.0.0.0' }, function (err) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
