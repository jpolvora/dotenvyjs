# dotenvyjs

Another Node Environment Variables Manager with dotenv (.env) files and validation by example

The goal is to provide a simple way to work with environment variables

## Installation

```shell
npm install --save jpolvora/dotenvyjs
```

# WorkFlow

Create a file named `.env.example` that can be commited and shared across the team. 

Place you keys and values of your application in form of an example / validator.
The format is `KEY=__validation-string__`

Check below an example of a `.env.example` file:

```env
# .env.example

API_KEY=trim|fallback(123)|number
CI_ENV=trim|required|enum(development,production)
```

As you could see above, there are some built-in validators in `doenvyjs` which are:

- `required`: A validator that indicates a required key/value pair.

```shell
# .env.example
API_KEY=required
# .env
API_KEY=some string #pass
API_KEY= #fail
```

- `number`: value cannot be empty and must be coercible to an integer (Number)

```shell
# .env.example
PORT=number
# .env
PORT=8080 #pass
PORT=abc #fail (NaN)
```

- `boolean`: value cannot be empty and must be convertible to boolean (Number(Boolean()))
- `bool` : alias of `boolean`

```shell
# .env.example
ENABLED=bool|boolean
# .env
ENABLED=1 #pass
ENABLED=true #pass
ENABLED=0 #pass
ENABLED=FALSE #pass
ENABLED=foo #pass
```

- `enum`: value cannot be empty and should be one of the following options

```shell
# .env.example
NODE_ENV=enum(development,production)
# .env
NODE_ENV=development #pass
NODE_ENV=production #pass
NODE_ENV= #FAIL
NODE_ENV=staging #fail
```

- `fallback`:Value can be empty, but will be fallback to desired value

```shell
# .env.example
APP_LANG=fallback(en-us)
# .env
APP_LANG=pt-br # $_ENV['APP_LANG'] will be 'pt-br'
APP_LANG= # $_ENV['APP_LANG'] will fallback to 'en-us'
```

- `trim`:Just trims the string before set to env vars

```shell
# .env.example
WHITE_SPACES=trim
# .env
WHITE_SPACES=   string_that_should_be_trimmed #will trim left and right trailling white spaces
```

### important:

Order of validators are mandatory. They will run sequentially, passing the resulting value to the next validator, in a middleware mode. In case validator evaluates to invalid, the pipeline will be interrupted and an exception will be thrown

## Custom validators

You can create custom validators and feed Dotenvy with an array with key:value function name, function ref.
Rules:

- Validators must be functions with the following signature:

```javascript
function (key, value, args) {
    /* your logic here */
    return "some value to next validator"
}
```

- You must always return a string that will be passed to next validator in validator chain/pipeline. If you pass null or empty string, the value will be ignored.
- If you want to invalidate the value, you must throw an exception and tell the user what happened.

```javascript
const options = {
  'custom_validators': {
        uppercase:  (key, value, args) => {
        return strtoupper(value)
        },
        lowercase: (key, value, args) => {
        return strtolower(value)
        }
    }
}

const env = require('dotenvyjs').run(options)
```

Reference your validator in `.env.example`

```shell
#.env.example
ANOTHER_ENV_VAR=uppercase
```

```shell
#.env
ANOTHER_ENV_VAR=this_value_will_be_uppercased #will evaluate to THIS_VALUE_WILL_BE_UPPERCASED
```

# Usage

```javascript
const dotenvyjs = require('dotenvyjs')
const env = dotenvyjs.run(options)

module.exports = {
    ...env
}

```