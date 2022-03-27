import fs from 'fs'
import * as envalid from 'envalid'

const debugging = process.env.NODE_ENV === 'development'

let num: number = 0
const increment = (): number => num++
increment()

const Logger = debugging
  ? {
      log: console.log.bind(console),
      error: console.error.bind(console)
    }
  : {
      log: Function.prototype,
      error: Function.prototype
    }

type KeyValuePair<T> = { [key: string]: T };

type LooseObject = {
  [key: string]: any;
};

interface Options {
  isPhysicalFile?: boolean;
  lines?: KeyValuePair<string>;
  env?: KeyValuePair<string>;
  exampleFile?: string;
  envalidOptions?: LooseObject;
}

const defaultOptions: Options = {
  isPhysicalFile: true,
  exampleFile: '.env.example',
  envalidOptions: {
    strict: true
  }
}

const customReporter = (opts: envalid.ReporterOptions) => {
  const entries = Object.entries(opts.errors)
  if (entries.length === 0) return
  const message = entries
    .map((x) => `${x[0]}: ${x[1]}`)
    .reduce((acc, msg) => (acc += msg))
  throw new Error(message)
}

type ValidatorInfo = {
  name?: string;
  default?: string;
  choices?: string[];
};

type ValidatorFunction = (options: ValidatorInfo) => string;

function checkValidatorExists (name: string): ValidatorFunction | null {
  if (typeof (envalid as any)[name] === 'function') {
    return (envalid as any)[name]
  }

  return null
}

type Func<T, U> = (p: T) => U;

const normalise = (str: string, beg: string, end: string) =>
  str.slice(beg.length, end.length * -1)

function extract (beg: string, end: string): Func<string, string[]> {
  const matcher = new RegExp(`\\${beg}(.*?)\\${end}`, 'gm')
  return (str) => {
    const m = str.match(matcher)
    if (m) {
      return m.map((s) => normalise(s, beg, end))
    }
    return []
  }
}

const parameterExtractor = extract('(', ')')

function tryGetValidatorInfoFromLine (value: string): ValidatorInfo {
  const result: ValidatorInfo = {}

  try {
    const params = parameterExtractor(value)
    if (params.length > 0) {
      result.name = value.substring(0, value.indexOf('(')).toLowerCase()
      const splited = params[0].split(',')
      if (splited[0].length > 0) result.default = splited[0]
      else delete result.default

      const choices = splited[1].split('|')
      if (choices.length > 0) {
        result.choices = choices
      }
    } else {
      result.name = value
    }
  } catch (error) {}

  return result
}

function parseLine (line: string): KeyValuePair<string> | null {
  if (!line) return null
  if (line.trim().length === 0) return null
  try {
    const instruction = line.split('#')[0].trim()
    if (instruction.length === 0) return null
    const [key, value] = line.split('=')
    const result: KeyValuePair<string> = {
      key,
      value
    }
    const validatorInfo = tryGetValidatorInfoFromLine(value)
    if (validatorInfo.name) {
      const validatorPrepare = checkValidatorExists(validatorInfo.name)
      if (validatorPrepare) {
        try {
          const validatorConfig = validatorPrepare(validatorInfo)
          if (validatorConfig) {
            result.key = key
            result.value = validatorConfig
          }
        } catch (error) {}
      }
    }
    return result
  } catch (error) {
    return null
  }
}

function processLineByLine (
  filename: string = '',
  isPhysicalFile: boolean = true,
  variables = {}
): LooseObject | null {
  let contents
  if (isPhysicalFile) {
    try {
      contents = fs.readFileSync(filename, 'utf8')
    } catch {
      // file not found
    }
  } else {
    const entries = Object.entries(variables)
    const lines = []
    for (let i = 0; i < entries.length; i++) {
      const element = entries[i]
      lines.push(`${element[0]}=${element[1]}\n`)
    }
    contents = lines.join('')
  }
  if (!contents) return null

  const cfg: LooseObject = {}
  const lines = contents.split('\n')
  for (const line of lines) {
    const parsedConfig = parseLine(line)
    if (parsedConfig) {
      cfg[parsedConfig.key] = parsedConfig.value
    }
  }

  return cfg
}

function dotenvy (options: Options = {}): LooseObject {
  try {
    const finalOptions = Object.assign({}, defaultOptions, options)
    const config = processLineByLine(
      finalOptions.exampleFile,
      finalOptions.isPhysicalFile,
      finalOptions.lines
    )

    if (finalOptions.env) Object.assign(process.env, finalOptions.env)

    finalOptions.envalidOptions = finalOptions.envalidOptions || {}
    finalOptions.envalidOptions.reporter = customReporter

    const env = envalid.cleanEnv(
      finalOptions.env || process.env,
      (config as {}) || {},
      finalOptions.envalidOptions
    )
    return Object.assign({}, { ...env })
  } catch (ex) {
    if (ex instanceof Error) Logger.error(ex.message)
    else Logger.error(ex)
    throw ex
  }
}

export = dotenvy;
