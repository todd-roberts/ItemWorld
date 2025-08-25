import type { Project } from "./shared/schema";

declare global {
  interface Window {
    api: {
      getDefaultProject: () => Promise<string>;
      openProject: () => Promise<string | null>;
      loadProject: (dir: string) => Promise<Project>;
      saveProject: (dir: string, data: Project) => Promise<boolean>;
      addThumbnail: (projectDir: string, srcPath: string) => Promise<string>;
      exportHW: (
        projectDir: string
      ) => Promise<{
        outDir: string;
        databaseFile: string;
        thumbnailsDir: string;
      }>;
      openExternal: (url: string) => Promise<boolean>;
    };
  }
}
export {};
