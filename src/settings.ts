import * as core from '@actions/core';

export class Inputs {
  public static get followSymbolicLinks(): boolean {
    const result = core.getInput('follow-symbolic-links');

    if (result == null) {
      return false;
    }

    return result.toUpperCase() !== 'FALSE';
  }

  public static get configFile(): string {
    const result = core.getInput('config-file');
    if (result === '' || result === null) {
      throw new Error('Did not specify the config file.');
    }

    return result;
  }

  public static get files(): string {
    const result = core.getInput('input-files');

    if (result == null) {
      throw new Error('Did not specify valid input files.');
    }

    return result;
  }

  public static get baseDirectory(): string | undefined {
    const result = core.getInput('base-directory');

    return result === '' || result === null ? undefined : result;
  }

  public static get outputPath(): string | undefined {
    const result = core.getInput('output-path');

    return result === '' || result === null ? undefined : result;
  }

  public static get fileListFile(): string | undefined {
    const result = core.getInput('file-list-file');

    return result === '' || result === null ? undefined : result;
  }

  public static get secret(): string {
    const result = core.getInput('sign-client-secret');
    if (result === '' || result === null) {
      throw new Error('Did not specify valid secret.');
    }

    return result;
  }

  public static get user(): string {
    const result = core.getInput('sign-client-user');
    if (result === '' || result === null) {
      throw new Error('Did not specify valid user.');
    }

    return result;
  }

  public static get projectName(): string {
    const result = core.getInput('project-name');
    if (result === '' || result === null) {
      throw new Error('Did not specify valid project name.');
    }

    return result;
  }

  public static get description(): string | undefined {
    const result = core.getInput('description');

    return result === '' || result === null ? undefined : result;
  }

  public static get descriptionUrl(): string | undefined {
    const result = core.getInput('description-url');

    return result === '' || result === null ? undefined : result;
  }

  public static get maxConcurrency(): number {
    const result = core.getInput('max-concurrency');

    if (result === '' || result === null) {
      return 4;
    }

    return parseInt(result);
  }

  public static get toolVersion(): string | undefined {
    const result = core.getInput('tool-version');
    return result === '' || result === null ? undefined : result;
  }
}
