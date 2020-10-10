import * as core from '@actions/core';
import * as path from 'path';
import * as os from 'os';
import * as glob from '@actions/glob';
import {exec} from '@actions/exec';
import {Inputs} from './settings';

async function run(): Promise<void> {
  try {
    // install sign client
    const installArgs = ['tool', 'install', '-g', 'signclient'];
    if (Inputs.toolVersion) {
      installArgs.push('--version', Inputs.toolVersion);
    }

    let exitCode = await exec('dotnet', installArgs, {
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

      exitCode = await exec('SignClient', runArgs);

      if (exitCode > 1) {
        core.warning(`could not sign package ${file}`);
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
