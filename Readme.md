# hugodep

hugodep is for analyzing the dependencies in a project to see: how each dependency is used, and which dependencies are useless. The same goals as depcheck, but this library works 100% guaranteed without false alarms, with a 2% of their lines of code.

## Any syntax, any language
Without need of plugins, this tool supports every language and every syntax you can define in the **scripts** section of the package.json file.

## Usage

Pass all the package.json scripts that test and build your code. The package.json scripts should have a finish, i.e., omit scripts or modify scripts that are always running or in watch mode. 

For example, with [create-react-app](https://create-react-app.dev/docs/running-tests/#command-line-interface) modify the **test** script as:
```
"scripts": {
    "test": "react-scripts test --watchAll=false",
    ...
}
```
Then calling [npx](https://nodejs.dev/learn/the-npx-nodejs-package-runner), analyze the dependencies running the **build** and **test** scripts, omitting **start** and **eject** scripts:

```
npx hugodep --run build --run test
```
This tool requires *node.js*. If you want faster results use an SSD. 

Set `--use-yarn` argument for using the faster **yarn**. Omitting that argument uses **npm**.
