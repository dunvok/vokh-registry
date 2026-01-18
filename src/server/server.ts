import Fastify, { type FastifyInstance } from 'fastify';
import type { VokhConfig } from '../config';
import { registryRoutes } from './routes';

export const buildServer = (config: VokhConfig): FastifyInstance => {
  const server = Fastify({
    logger: true,
    disableRequestLogging: true,
  });

  registryRoutes(server, config);

  return server;
};
