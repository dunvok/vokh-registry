import { describe, expect, it } from 'vitest';
import { parse } from './config';

describe('config', () => {
  it('should parse config', () => {
    const config = parse('./assets/vokh.config.yaml');
    expect(config).toEqual({
      port: 8080,
      rules: [
        {
          name: 'vokh-registry',
          path: '.',
        },
      ],
    });
  });

  it('should parse partial config', () => {
    const config = parse('./assets/partial-vokh.config.yaml');
    expect(config).toEqual({
      port: 9999,
      rules: [
        {
          name: 'vokh-registry',
          path: '.',
        },
      ],
    });
  });
});
