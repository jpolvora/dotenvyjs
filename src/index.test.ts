import path from "path";
import fs from "fs/promises";
import dotenvy from "./index";

const envContents = `
API_KEY=str(000000)
API_SECRET=str()
CI_ENV=str(ci,development|ci|production)
PORT=num(8000)
DB=num()
`.trim();

const exampleFileName = path.join(process.cwd(), ".env.tests");

beforeAll(async () => {
  await fs.writeFile(exampleFileName, envContents);
});

afterAll(async () => {
  await fs.unlink(exampleFileName);
});

describe("environment", () => {
  it("it should throw on missing vars", async () => {
    const customEnv = {

    };
    const env = expect(() =>
      dotenvy({
        exampleFile: exampleFileName,
        envalidOptions: { strict: true },
        env: customEnv
      })
    ).toThrow();

    expect(env).toBeFalsy();

    // expect(env.MY_CONFIG).toEqual('123')
    // expect(env.MY_CONFIG_N).toEqual(0)
    // expect(env.ANY_STR).toEqual('ABC')
  });

  it("it should set default value", async () => {
    const customEnv = {
      DB: "123",
      API_SECRET: "12321",
    };
    const env = dotenvy({
      exampleFile: exampleFileName,
      env: customEnv
    });

    expect(env).toBeTruthy();

    expect(env.PORT).toEqual(8000);
    expect(env.API_KEY).toEqual("000000");
  });
});
