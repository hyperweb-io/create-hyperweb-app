export interface BuildConfig {
  entryFile: string;
  outFile: string;
  externalPackages: string[];
}

export const configs: BuildConfig[] = [
  {
    entryFile: "src/hello/index.ts",
    outFile: "dist/contracts/hello.js",
    externalPackages: ["otherpackage", "~somepackage"],
  },
  {
    entryFile: "src/simple-state/index.ts",
    outFile: "dist/contracts/simple-state.js",
    externalPackages: ["otherpackage", "~somepackage"],
  },
  {
    entryFile: "src/bank/index.ts",
    outFile: "dist/contracts/bank.js",
    externalPackages: ["@hyperweb/bank"],
  },
  {
    entryFile: "src/token-factory/index.ts",
    outFile: "dist/contracts/token-factory.js",
    externalPackages: ["@hyperweb/token", "@hyperweb/bank"],
  },


];
