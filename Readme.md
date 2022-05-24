# hugodep

hugodep is for analyzing the dependencies in a project to see: how each dependency is used, and which dependencies are useless. The same goals as depcheck, but this code works 100% guaranteed without false alarms, with a 2% of their lines of code.

## Any syntax, any language
Without need of plugins, this tool supports every language and every syntax you can define in the **scripts** section of the package.json file.

## Usage

Pass all the package.json scripts that test and build your code. The package.json scripts should have a finish, i.e. modify scripts that are not builders or stay in watch-mode. 

For example and tutorial, with [create-react-app](https://create-react-app.dev/docs/running-tests/#command-line-interface) we have 4 scripts: **start**, **build**, **test** and **eject**. Modify the **test** script to have an execution exit:
```
"scripts": {
    "test": "react-scripts test --watchAll=false",
    ...
}
```
Then calling [npx](https://nodejs.dev/learn/the-npx-nodejs-package-runner), analyze the dependencies for the **build**, **test** and **eject** scripts, omitting **start** script because is an always-on server:

```
npx hugodep --run build --run test --run eject
```
This tool requires *node.js*. If you want faster results use an SSD. 

Set `--use-yarn` argument for using the faster **yarn**. Omitting that argument uses **npm**.
