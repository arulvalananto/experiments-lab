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

# will create .env.keys file and add the encrypted value of HELLO in the .env file
```

## Run application with new environment variable

```bash
dotenvx run -- node index.js
Hello encrypted
```

Refer to the [documentation](https://dotenvx.com/docs/quickstart) for more details and advanced usage.
