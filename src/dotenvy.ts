import fs from "fs";
import path from "path";
import * as envalid from "envalid";

type DotEnvy = unknown

type KeyValuePair<T> = { [key: string]: T }

interface Options {
  isPhysicalFile?: boolean
  lines?: KeyValuePair<string>
  env?: KeyValuePair<string>
  exampleFile?: string
  dir?: string
  strict?: boolean
}

const defaultOptions: Options = {
  isPhysicalFile: true,
  lines: {},
  env: {},
  exampleFile: '.env.example',
  dir: path.resolve('./'),
  strict: true
}

interface LooseObject {
  [key: string]: any
}


type ValidatorInfo = {
  name?: string
  default?: string
  choices?: string[]
}

type ValidatorFunction = (options: ValidatorInfo) => string

function checkValidatorExists(name: string): ValidatorFunction | null {

  if (typeof (envalid as any)[name] === 'function')
    return (envalid as any)[name]

  return null

}

type Func<T> = () => T
type Func2<T, U> = (p: T) => U

const normalise = (str: string, beg: string, end: string) => str.slice(beg.length, end.length * -1)

function extract(beg: string, end: string): Func2<string, string[]> {
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


function tryGetValidatorInfoFromLine(value: string): ValidatorInfo {
  const result: ValidatorInfo = {}

  try {
    const params = parameterExtractor(value)
    if (params.length > 0) {
      result.name = value.substring(0, value.indexOf('(')).toLowerCase()
      const splited = params[0].split(',')
      result.default = splited[0]
      const choices = splited[1].split('|')
      if (choices.length > 0) {
        result.choices = choices
      }
    } else {
      result.name = value
    }
  } catch (error) {

  }

  return result
}

function parseLine(line: string): KeyValuePair<string> | null {
  if (!line) return null
  if (line.trim().length === 0) return null
  try {
    const instruction = line.split('#')[0].trim()
    if (instruction.length === 0) return null
    const [key, value] = line.split('=')
    const result: KeyValuePair<string> = {
      key, value
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
        } catch (error) {

        }
      }
    }
    return result
  } catch (error) {
    return null
  }
}



function processLineByLine(filename: string, isPhysicalFile: boolean = false, variables = {}): LooseObject | null {

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
      const element = entries[i];
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


export default function dotenvy(options: Options): LooseObject {
  try {
    const finalOptions = Object.assign({}, defaultOptions, options)
    const exampleFileName = finalOptions.dir && finalOptions.exampleFile ? path.resolve(finalOptions.dir, finalOptions.exampleFile) : ''
    const config = processLineByLine(exampleFileName, options.isPhysicalFile, options.lines)
    if (options.env) Object.assign(process.env, options.env)
    const env = envalid.cleanEnv(process.env, config as {}, finalOptions)
    return Object.assign({}, { ...env })
  } catch (ex) {
    throw new Error('Error running dotenvyjs: ' + ex)
  }
}
