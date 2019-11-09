let expect = require("expect");

const { isRealString } = require("../validation");

describe("isRealString", () => {
  it("should reject non-string values", () => {
    let res = isRealString(68);
    expect(res).toBe(false);
  });

  it("should reject string with only spaces", () => {
    let res = isRealString("      ");
    expect(res).toBe(false);
  });

  it("should reject string with only spaces", () => {
    let res = isRealString("     ");
    expect(res).toBe(false);
  });
  it("should allow strings with non space characters", () => {
    let res = isRealString("  Asdf  ");
    expect(res).toBe(true);
  });
});
