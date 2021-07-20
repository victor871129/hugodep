# hugodep

hugodep is for analyzing the dependencies in a project to see: how each dependency is used, and which dependencies are useless. The same goals as depcheck, but this library works 100% guaranteed without false alarms, with a 2% of their lines of code. 

Take into account what package.json scripts you pass to run, because if you forget to pass any critical script you are going to get inaccurate results.

Its preferred to be run overnight. If you want faster results use an SSD and any file monitor.

# Usage
## Package.json scripts

The package.json scripts should have a finish, i.e., scripts should not be on watch mode. For example, with [create-react-app](https://create-react-app.dev/docs/running-tests/#command-line-interface) modify the **test** script as:
```
"scripts": {
    "test": "react-scripts test --watchAll=false",
    ...
}
```


## Example
Analyze the dependencies running only the script **build** and only the script **test**:

```
npx hugodep --run build --run test
```
