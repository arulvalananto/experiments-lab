# dotenvx

## Run Anywhere

```bash
$ echo "HELLO=World" > .env
$ echo "console.log('Hello ' + process.env.HELLO)" > index.js

$ node index.js
Hello undefined

$ dotenvx run -- node index.js
Hello World
```

## Set new environment variable

```bash
dotenvx set HELLO "encrypted"
```
