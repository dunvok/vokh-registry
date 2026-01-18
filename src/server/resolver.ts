import type { VokhConfig } from '@/config';
import crypto from 'crypto';
import fs from 'fs';
import micromatch from 'micromatch';
import path from 'path';

export interface PackageInfo {
  version: string;
  path: string;
  shasum: string;
}

const replaceMatches = (glob: string, path: string, outputGlob: string) => {
  const matches = micromatch.capture(glob, path);
  if (matches == null) return outputGlob;
  let counter = 0;
  return outputGlob
    .split('/')
    .map((part) => {
      if (part.includes('*')) {
        const m = matches[counter++]!;
        return part.replace('**', m).replace('*', m);
      }
      return part;
    })
    .join('/');
};

const calculateShasum = (path: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha1');
    const stream = fs.createReadStream(path);
    stream.on('error', (err) => reject(err));
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });
  });
};

const getPackageVersion = (packagePath: string): string => {
  const fileName = path.basename(packagePath);
  const versionStartIx = fileName.lastIndexOf('-');
  const versionEndIx = fileName.lastIndexOf('.');
  return fileName.substring(versionStartIx + 1, versionEndIx);
};

export const findLocalPackage = async (
  packageName: string,
  config: VokhConfig,
): Promise<PackageInfo | null> => {
  for (const { scope, path } of config.rules) {
    if (micromatch.isMatch(packageName, scope)) {
      const resolvedPath = replaceMatches(scope, packageName, path);
      if (fs.existsSync(resolvedPath)) {
        const shasum = await calculateShasum(resolvedPath);
        return {
          version: getPackageVersion(resolvedPath),
          path: resolvedPath,
          shasum: shasum,
        };
      }
      return null;
    }
  }
  return null;
};
