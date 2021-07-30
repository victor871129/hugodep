/* eslint-disable no-console */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-plusplus */
const { exec, execSync } = require('child_process');
const fileSystem = require('fs-extra');
const nodePath = require('path');
const nodeOs = require('os');
const promiseLimit = require('p-limit');
const argumentVars = require('yargs') // https://github.com/yargs/yargs/issues/372#issuecomment-181960542
  .option('ignore-folder', {
    alias: 'i',
    type: 'string',
  })
  .option('use-npm', {
    alias: 'n',
    type: 'boolean',
  })
  .option('run', {
    alias: 'r',
    type: 'string',
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
  })
  .strict()
  .argv;
const packageJson = require('./package.json');

const failedTestCopy = false; // TODO TEST true
const isLowEndMachine = false; // TODO TEST
const argumentRun = Array.isArray(argumentVars.run) ? argumentVars.run : (argumentVars.run != null ? [argumentVars.run] : null);
const argumentFolder = Array.isArray(argumentVars.ignorefolder) ? argumentVars.ignorefolder : (argumentVars.ignorefolder != null ? [argumentVars.ignorefolder] : null);
const argumentVerb = argumentVars.verbose != null;
const argumentNpm = argumentVars['use-npm'] != null;
let progressBar = 1;
let progressTotal = 0;
const concurrentLimit = promiseLimit(isLowEndMachine ? 1 : 4);

// TODO
// - yarn bug
// - test without npm installed
// - test without node installed
// - breaking tests
// - test posix multiplatform
// - test check delete directory on finish
// - does it work with git submodules?
// - readFileSync catch, writeFileSync catch
// - npm ci: check package.json or npm-shrinkwrap.json
// - np --no-2fa

const filterFiles = (sourceFile) => {
  let ignoredRootFolders = ['node_modules', 'build'];
  if (argumentFolder != null) {
    ignoredRootFolders = argumentFolder;
  }

  return !ignoredRootFolders.some((actualFolder) => {
    if (sourceFile.replace(process.cwd(), '') === actualFolder) {
      return true;
    }

    return false;
  });
};

const allClean = (useReject, tempDirectory) => {
  fileSystem.remove(tempDirectory, (err) => {
    if (err) return useReject(err);

    return console.log(`${Math.round((progressBar++) * 100 / progressTotal)}%`, argumentVerb ? 'cleaned!' : '');
  });
};

const logClean = (useReject, errorValue, tempDirectory) => {
  // console.log('logClean');
  allClean(useReject, tempDirectory);
  useReject(errorValue);
};

const finalClean = (useReject, tempDirectory, actualIndex, maxLength) => {
  if (actualIndex === maxLength - 1) {
    allClean(useReject, tempDirectory);
  }
};

const runScript = (useReject, tempDirectory, currentLibraryVersion, callbackMethod) => {
  exec(argumentNpm ? 'npm install --prefer-offline --no-audit' : 'yarn install', { cwd: tempDirectory }, (err) => {
    if (err) return logClean(useReject, err, tempDirectory);

    let hasError = false;
    argumentRun.forEach((actualScript, scriptIndex) => {
      console.log(`${Math.round((progressBar++) * 100 / progressTotal)}%`, argumentVerb ? `npm run ${actualScript}` : '');
      if (hasError) return;

      try {
        execSync(argumentNpm ? `npm run ${actualScript}` : `yarn run ${actualScript}`, { cwd: tempDirectory, stdio: 'ignore' });
        // console.log(JSON.stringify(stdout))
        finalClean(useReject, tempDirectory, scriptIndex, argumentRun.length);
      } catch (error) {
        hasError = true;
        // console.log(error)
        allClean(useReject, tempDirectory);
      }
    });

    return callbackMethod(hasError, currentLibraryVersion);
  });
};

const copyFiles = (useReject, tempDirectory, modifyFileMethod, callbackMethod) => {
  fileSystem.copy(process.cwd() + (failedTestCopy ? 'dummy' : ''), tempDirectory, { filter: filterFiles }, (err) => {
    if (err) return logClean(useReject, err, tempDirectory);

    console.log(`${Math.round((progressBar++) * 100 / progressTotal)}%`);

    const currentLibraryVersion = modifyFileMethod(tempDirectory);
    return runScript(useReject, tempDirectory, currentLibraryVersion, callbackMethod);
  });
};

const createFolder = (useReject, modifyFileMethod, callbackMethod) => {
  // https://nodejs.org/api/fs.html#fs_fs_mkdtemp_prefix_options_callback
  fileSystem.mkdtemp(nodePath.join(nodeOs.tmpdir(), 'dep-'), (err, tempDirectory) => {
    if (err) return useReject(err);

    return copyFiles(useReject, tempDirectory, modifyFileMethod, callbackMethod);
  });
};

const isolatedRun = ({ dependencyName: currentLibrary, currentVersion, isDevelopment }) => new Promise((useResolve, useReject) => {
  // Delete one dependency from package.json
  const modifyFileMethod = (tempDirectory) => {
    const rawData = fileSystem.readFileSync(nodePath.join(tempDirectory, 'package.json'));
    const parsedData = JSON.parse(rawData);

    if (isDevelopment) {
      delete parsedData.devDependencies[currentLibrary];
    } else {
      delete parsedData.dependencies[currentLibrary];
    }
    const finalData = JSON.stringify(parsedData, null, 2);
    fileSystem.writeFileSync(nodePath.join(tempDirectory, 'package.json'), finalData);
    return `${currentLibrary}@${currentVersion}`;
  };

  createFolder(useReject, modifyFileMethod, (hasError, currentLibraryVersion) => {
    console.log((hasError ? 'Dependency to ' : 'Unused dependency ') + currentLibraryVersion);
    return useResolve();
  });
});

const firstApp = () => {
  console.log(`Version: ${packageJson.version}`);
  if (argumentVars.run == null) return console.error('Pass --run parameters, please.');

  const rawData = fileSystem.readFileSync(nodePath.join(process.cwd(), 'package.json'));
  const parsedData = JSON.parse(rawData);
  const dependencyKeys = parsedData.dependencies != null ? Object.keys(parsedData.dependencies) : [];
  const developmentKeys = parsedData.devDependencies != null ? Object.keys(parsedData.devDependencies) : [];
  const useDependencies = dependencyKeys.map((dependencyName) => ({ dependencyName, currentVersion: parsedData.dependencies[dependencyName], isDevelopment: false }));
  const useDevelopment = developmentKeys.map((dependencyName) => ({ dependencyName, currentVersion: parsedData.devDependencies[dependencyName], isDevelopment: true }));
  const allDependencies = useDependencies.concat(useDevelopment);

  if (allDependencies.length === 0) return console.error('No dependencies.');

  progressTotal = (argumentRun.length + 1 + 1) // +1 because copyFiles log, +1 because runScript log
    * (allDependencies.length + 1) + 1; // +1 because First-isolated-run log

  new Promise((useResolve, useReject) => {
    // First-isolated-run, without touching package.json, to check if project is running
    createFolder(useReject, () => '', (hasError) => useResolve(hasError));
  })
    .then(async (hasError) => {
      if (hasError) return console.error('Your project must isolatedly run the package.json scripts.');

      // TODO version not working: Version: ${process.env.npm_package_version}
      console.log(`${Math.round((progressBar++) * 100 / progressTotal)}%`);
      // TODO message: Ignored these root folders: node_modules, build. Dependencies not analyzed with these package.json scripts: start, eject

      const usePromises = allDependencies.map((actualDependency) => concurrentLimit(isolatedRun, actualDependency));
      return Promise.all(usePromises);
    })
    .catch((error) => console.error(error)); // TODO check
};

exports.firstApp = firstApp;
exports.filterFiles = filterFiles;