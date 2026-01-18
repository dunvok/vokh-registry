import { cac } from 'cac';
import { parse } from './config';
import { buildServer } from './server/server';

const cli = cac('vokh-registry');

cli
  .command('serve', 'Initialize the local registry')
  .option('--config <path>', 'Path to custom topology rules and port', {
    default: 'vokh.config.yaml',
  })
  .action(async (options) => {
    const config = parse(options.config);
    const server = buildServer(config);
    await server.listen({ port: config.port });
  });

cli.help();
cli.version('1.0.0');

const parsed = cli.parse();

if (!cli.matchedCommand && !parsed.options.help) {
  cli.outputHelp();
}
