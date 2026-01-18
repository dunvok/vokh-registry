import type { VokhConfig } from '@/config';
import { type FastifyInstance } from 'fastify';
import fs from 'fs';
import { findLocalPackage } from './resolver';

const metadatResolution = (fastify: FastifyInstance, config: VokhConfig) => {
  fastify.get('/:pkgName', async (request, reply) => {
    const { pkgName } = request.params as { pkgName: string };
    const name = decodeURIComponent(pkgName);
    const packageInfo = await findLocalPackage(name, config);

    if (!packageInfo) {
      return reply.code(404).send({ error: 'Not found in local vokh registry' });
    }

    const manifest = {
      _id: name,
      name: name,
      'dist-tags': {
        latest: packageInfo.version,
      },
      versions: {
        [packageInfo.version]: {
          name: name,
          version: packageInfo.version,
          dist: {
            tarball: `http://${request.hostname}:${request.port}/content/-/${encodeURIComponent(packageInfo.path)}`,
            shasum: packageInfo.shasum,
          },
        },
      },
    };

    return reply.type('application/json').send(manifest);
  });
};

const packageContent = (fastify: FastifyInstance) => {
  fastify.get('/content/-/:filename', async (request, reply) => {
    const { filename } = request.params as { filename: string };
    if (!fs.existsSync(filename)) {
      return reply.code(404).send({ error: 'Artifact not found' });
    }

    reply.header('Content-Type', 'application/octet-stream');
    reply.header('Content-Length', fs.statSync(filename).size);

    const stream = fs.createReadStream(filename);
    return reply.send(stream);
  });
};

export const registryRoutes = (fastify: FastifyInstance, config: VokhConfig) => {
  metadatResolution(fastify, config);
  packageContent(fastify);
};
