import { HyperwebBuild, HyperwebBuildOptions } from '@hyperweb/build';
import { join } from 'path';

interface BuildConfig {
  entryFile: string;
  outFile: string;
  externalPackages: string[];
}

const configs: BuildConfig[] = [
  {
    entryFile: 'src/simple-state/index.ts',
    outFile: 'dist/contracts/simpleState.js',
    externalPackages: ['otherpackage', '~somepackage']
  },
  {
    entryFile: 'src/amm-contract/index.ts',
    outFile: 'dist/contracts/ammContract.js',
    externalPackages: ['~bank'],
  }
];

const rootDir = join(__dirname, '/../');

async function buildInterweb(config: BuildConfig): Promise<void> {
  const { entryFile, outFile, externalPackages } = config;

  const options: Partial<HyperwebBuildOptions> = {
    entryPoints: [join(rootDir, entryFile)],
    outfile: join(rootDir, outFile),
    external: externalPackages
  };

  try {
    await HyperwebBuild.build(options);
    console.log(`Build completed successfully! Output: ${options.outfile}`);
  } catch (error) {
    console.error('Build failed:', error);
    throw error;
  }
}

async function main() {
  for (const config of configs) {
    try {
      await buildInterweb(config);
    } catch (error) {
      console.error(`Build failed for ${config.entryFile}:`, error);
    }
  }
}

main().catch(console.error);