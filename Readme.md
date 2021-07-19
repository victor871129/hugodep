# hugodep

The same goals as depcheck, but this library works 100% guaranteed without false alarms, with a 2% of their lines of code. hugodep, is for analyzing the dependencies in a project to see: how each dependency is used, and which dependencies are useless.

Take into account what package.json scripts you pass to run, because if you forget to pass any critical script you are going to get inaccurate results.

Its preferred to be run overnight. If you want faster results, deactivate your antivirus, and use an SSD.

# Usage
## Package.json scripts

The package.json scripts should have a finish, i.e., scripts should not be on watch mode.

With create-react-app use the **build** script as is. [Modify the **test** script as:](https://create-react-app.dev/docs/running-tests/#command-line-interface)
```
"scripts": {
    "test": "react-scripts test --watchAll=false",
    ...
}
```


## Example
Analyze the dependencies running only with the script **build** and with the script **test**:

```
hugodep --run build --run test
```
