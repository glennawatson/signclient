import * as core from '@actions/core';
import * as glob from '@actions/glob';
import * as os from 'os';
import * as path from 'path';
import {Inputs} from './settings';
import {exec} from '@actions/exec';

async function run(): Promise<void> {
  try {
    // install sign client
    const installArgs = ['tool', 'install', '-g', 'signclient'];
    if (Inputs.toolVersion) {
      installArgs.push('--version', Inputs.toolVersion);
    }

    const exitCode = await exec('dotnet', installArgs, {
      ignoreReturnCode: true
    });
    if (exitCode > 1) {
      throw new Error('dotnet tool install failed.');
    }

    // add .dotnet/tools to the path
    core.addPath(path.join(os.homedir(), '.dotnet', 'tools'));

    const files = Inputs.files;

    if (files === undefined) {
      throw new Error('files glob has not been defined.');
    }

    const globOptions = {
      followSymbolicLinks: Inputs.followSymbolicLinks
    };

    const globber = await glob.create(files, globOptions);

    const defaultArgs = [
      'sign',
      '-s',
      Inputs.secret,
      '-r',
      Inputs.user,
      '-c',
      Inputs.configFile,
      '-n',
      Inputs.projectName
    ];

    if (Inputs.description) {
      defaultArgs.push('-d', Inputs.description);
    }

    if (Inputs.descriptionUrl) {
      defaultArgs.push('-u', Inputs.descriptionUrl);
    }

    if (Inputs.maxConcurrency) {
      defaultArgs.push('-m', Inputs.maxConcurrency.toString());
    }

    if (Inputs.fileListFile) {
      defaultArgs.push('-f', Inputs.fileListFile);
    }

    if (Inputs.baseDirectory) {
      defaultArgs.push('-b', Inputs.baseDirectory);
    }

    for await (const file of globber.globGenerator()) {
      const runArgs = [...defaultArgs];
      runArgs.push('-i', file);
      runArgs.push('-o', file);

      await exec('SignClient', runArgs);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.setFailed(error);
    } else {
      core.setFailed('');
    }
  }
}

run();
