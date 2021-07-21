# hugodep

hugodep is for analyzing the dependencies in a project to see: how each dependency is used, and which dependencies are useless. The same goals as depcheck, but this library works 100% guaranteed without false alarms, with a 2% of their lines of code.

## Any syntax, any language
Without need of plugins, this tool supports every language and every syntax you can define in the **scripts** section of the package.json file.

## Usage

If you want faster results use an SSD and deactivate any file monitor. Its preferred to be run overnight. 

Take into account what package.json scripts you pass to run, because if you forget to pass any critical script you are going to get inaccurate results.

Set `--use-npm` argument for utilizing *npm* instead of the faster *yarn*.

This example uses [npx](https://nodejs.dev/learn/the-npx-nodejs-package-runner) and analyzes the dependencies running only the script **build** and only the script **test**:

```
npx hugodep --run build --run test
```
## Package.json scripts

The package.json scripts should have a finish, i.e., scripts should not be on watch mode. For example, with [create-react-app](https://create-react-app.dev/docs/running-tests/#command-line-interface) modify the **test** script as:
```
"scripts": {
    "test": "react-scripts test --watchAll=false",
    ...
}
```