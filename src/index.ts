import { randomInt } from "crypto";

type OtpCharset =
  | "numeric"
  | "alphabetic"
  | "alphanumeric"
  | "hex"
  | { custom: string };

interface OtpOptions {
  excludeSimilar?: boolean;
  case?: "upper" | "lower" | "mixed";
}

class OTPX {
  private static charsets = {
    numeric: "0123456789",
    alphabetic: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    alphanumeric:
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    hex: "0123456789abcdef",
  };

  static generateOtp(
    length: number = 6,
    charset: OtpCharset = "numeric",
    options: OtpOptions = {}
  ): string {
    if (length <= 0) throw new Error("OTP length must be > 0");

    let chars =
      typeof charset === "string"
        ? this.charsets[charset]
        : charset.custom || "";

    if (!chars) throw new Error("Invalid charset");

    if (options.excludeSimilar) {
      chars = chars.replace(/[O0Il]/g, "");
    }

    if (options.case === "upper") {
      chars = chars.toUpperCase();
    } else if (options.case === "lower") {
      chars = chars.toLowerCase();
    }

    let otp = "";
    for (let i = 0; i < length; i++) {
      const randIndex = randomInt(0, chars.length);
      otp += chars[randIndex];
    }
    return otp;
  }

  static numeric(length: number = 6): string {
    return this.generateOtp(length, "numeric");
  }

  static alphabetic(length: number = 6, opts: OtpOptions = {}): string {
    return this.generateOtp(length, "alphabetic", opts);
  }

  static alphanumeric(length: number = 6, opts: OtpOptions = {}): string {
    return this.generateOtp(length, "alphanumeric", opts);
  }

  static hex(length: number = 6): string {
    return this.generateOtp(length, "hex");
  }
}

export default OTPX;
export type { OtpCharset, OtpOptions };
