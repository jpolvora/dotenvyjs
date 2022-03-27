import path from 'path'
import fs from 'fs/promises'
import dotenvy from './index'

const envContents = `
API_KEY=str(000000)
API_SECRET=str()
CI_ENV=str(stage,development|production)
PORT=num(8000)
DB=num()
`.trim()

const exampleFileName = path.join(process.cwd(), '.env.tests')

describe('insert', () => {
  beforeAll(async () => {
    await fs.writeFile(exampleFileName, envContents)
  })

  afterAll(async () => {
    await fs.unlink(exampleFileName)
  })

  it('it should throw on missing vars', async() => {

    const env = expect(() => dotenvy({
      exampleFile: exampleFileName
    })).toThrow()

    expect(env).toBeFalsy()

    // expect(env.MY_CONFIG).toEqual('123')
    // expect(env.MY_CONFIG_N).toEqual(0)
    // expect(env.ANY_STR).toEqual('ABC')
  })

  it('it should set default value', async() => {
    const env = expect(() => dotenvy({
      exampleFile: exampleFileName
    })).toThrow()

    expect(env).toBeFalsy()

    // expect(env.MY_CONFIG).toEqual('123')
    // expect(env.MY_CONFIG_N).toEqual(0)
    // expect(env.ANY_STR).toEqual('ABC')
  })
})
