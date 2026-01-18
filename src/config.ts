import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

export interface PackageRule {
  name: string;
  path: string;
}

export interface VokhConfig {
  port: number;
  rules: PackageRule[];
}

export const parse = (configFile: string): VokhConfig => {
  const configContent = fs.readFileSync(path.resolve(configFile), 'utf-8');
  const configYaml = YAML.parse(configContent) as Partial<VokhConfig>;
  return { port: 9999, rules: [], ...configYaml };
};
