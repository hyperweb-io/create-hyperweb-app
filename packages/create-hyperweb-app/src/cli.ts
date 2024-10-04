import { CHA_URL } from "./constants";
import { createGitApp } from "./git-cca-template";
export const cli = async (argv, version) => {
  const repo = argv.repo ?? CHA_URL;
  const createApp = createGitApp(repo, version);
  await createApp(argv);
};