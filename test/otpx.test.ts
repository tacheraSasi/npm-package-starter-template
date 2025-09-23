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

describe("Standard OTPs (HOTP/TOTP)", () => {
  // RFC 4226 test vectors
  const secret = "12345678901234567890";

  describe("HOTP (RFC 4226)", () => {
    const expectedValues = [
      "755224",
      "287082",
      "359152",
      "969429",
      "338314",
      "254676",
      "287922",
      "162583",
      "399871",
      "520489",
    ];

    expectedValues.forEach((expected, i) => {
      it(`generates correct OTP for counter ${i}`, () => {
        const otp = OTPX.hotp({ secret, counter: i });
        expect(otp).toBe(expected);
      });
    });
  });

  // RFC 6238 test vectors
  describe("TOTP (RFC 6238)", () => {
    it("generates correct OTP for SHA1", () => {
      const totp = OTPX.totp({
        secret,
        timestamp: 59 * 1000, // T=59s
        digits: 8,
        algorithm: "SHA1",
      });
      expect(totp).toBe("94287082");
    });

    it("generates correct OTP for SHA256", () => {
      const secret256 = "12345678901234567890123456789012";
      const totp = OTPX.totp({
        secret: secret256,
        timestamp: 59 * 1000, // T=59s
        digits: 8,
        algorithm: "SHA256",
      });
      expect(totp).toBe("46119246");
    });

    it("generates correct OTP for SHA512", () => {
      const secret512 =
        "1234567890123456789012345678901234567890123456789012345678901234";
      const totp = OTPX.totp({
        secret: secret512,
        timestamp: 59 * 1000, // T=59s
        digits: 8,
        algorithm: "SHA512",
      });
      expect(totp).toBe("90693936");
    });
  });
});