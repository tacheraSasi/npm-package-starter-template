import OTPX from "../src/index";

describe("OTPX.generateOtp", () => {
  it("generates a numeric OTP of default length", () => {
    const otp = OTPX.generateOtp();
    expect(otp).toMatch(/^\d{6}$/);
  });

  it("generates a numeric OTP of custom length", () => {
    const otp = OTPX.generateOtp(8, "numeric");
    expect(otp).toMatch(/^\d{8}$/);
  });

  it("generates an alphabetic OTP (mixed case)", () => {
    const otp = OTPX.generateOtp(10, "alphabetic");
    expect(otp).toMatch(/^[A-Za-z]{10}$/);
  });

  it("generates an alphanumeric OTP", () => {
    const otp = OTPX.generateOtp(12, "alphanumeric");
    expect(otp).toMatch(/^[A-Za-z0-9]{12}$/);
  });

  it("generates a hex OTP", () => {
    const otp = OTPX.generateOtp(16, "hex");
    expect(otp).toMatch(/^[a-f0-9]{16}$/);
  });

  it("excludes similar characters when requested", () => {
    const otp = OTPX.generateOtp(20, "alphanumeric", { excludeSimilar: true });
    expect(otp).not.toMatch(/[O0Il]/);
  });

  it("forces upper case", () => {
    const otp = OTPX.generateOtp(10, "alphabetic", { case: "upper" });
    expect(otp).toMatch(/^[A-Z]{10}$/);
  });

  it("forces lower case", () => {
    const otp = OTPX.generateOtp(10, "alphabetic", { case: "lower" });
    expect(otp).toMatch(/^[a-z]{10}$/);
  });

  it("accepts a custom charset", () => {
    const otp = OTPX.generateOtp(6, { custom: "aeiou" });
    expect(otp).toMatch(/^[aeiou]{6}$/);
  });

  it("calls options.run once after OTP is generated", () => {
    let called = 0;
    const otp = OTPX.generateOtp(6, "numeric", {
      run: (otp) => { 
        console.log(otp);
        called++; 
      }
    });
    expect(called).toBe(1);
    expect(otp).toMatch(/^\d{6}$/);
  });

  it("throws for length <= 0", () => {
    expect(() => OTPX.generateOtp(0)).toThrow();
    expect(() => OTPX.generateOtp(-1)).toThrow();
  });

  it("throws for invalid charset", () => {
  expect(() => OTPX.generateOtp(6, "invalid" as any)).toThrow();
    expect(() => OTPX.generateOtp(6, { custom: "" })).toThrow();
  });
});

describe("OTPX shorthand methods", () => {
  it("numeric() produces only digits", () => {
    expect(OTPX.numeric(8)).toMatch(/^\d{8}$/);
  });

  it("alphabetic() produces only letters", () => {
    expect(OTPX.alphabetic(7)).toMatch(/^[A-Za-z]{7}$/);
  });

  it("alphanumeric() produces only letters and digits", () => {
    expect(OTPX.alphanumeric(9)).toMatch(/^[A-Za-z0-9]{9}$/);
  });

  it("hex() produces only hex chars", () => {
    expect(OTPX.hex(10)).toMatch(/^[a-f0-9]{10}$/);
  });
});
