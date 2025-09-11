import { randomInt } from "crypto";

/**
 * Supported character sets for OTP generation.
 */
type OtpCharset =
  | "numeric"
  | "alphabetic"
  | "alphanumeric"
  | "hex"
  | { custom: string };

/**
 * Options to customize OTP generation.
 */
interface OtpOptions {
  /** Exclude visually similar characters (O, 0, I, l). */
  excludeSimilar?: boolean;
  /** Force case transformation. */
  case?: "upper" | "lower" | "mixed";
}

/**
 * OTPX - A simple, secure OTP generator.
 *
 * Provides multiple modes (numeric, alphabetic, alphanumeric, hex, custom)
 * with secure randomness via Node.js `crypto`.
 */
class OTPX {
  /** Default character sets. */
  private static charsets = {
    numeric: "0123456789",
    alphabetic: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    alphanumeric:
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    hex: "0123456789abcdef",
  };

  /**
   * Generate a random OTP string.
   *
   * @param length - Number of characters in the OTP (default: 6).
   * @param charset - Character set type or custom string (default: "numeric").
   * @param options - Extra options (excludeSimilar, case).
   * @returns Random OTP string.
   *
   * @example
   * ```ts
   * OTPX.generateOtp(6, "alphanumeric", { excludeSimilar: true });
   *  => "9dXkQ2"
   * ```
   */
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

  /**
   * Generate a numeric-only OTP.
   *
   * @param length - Number of digits (default: 6).
   * @returns Numeric OTP string.
   *
   * @example
   * ```ts
   * OTPX.numeric(4); // => "4821"
   * ```
   */
  static numeric(length: number = 6): string {
    return this.generateOtp(length, "numeric");
  }

  /**
   * Generate an alphabetic OTP (A-Z, a-z).
   *
   * @param length - Number of characters (default: 6).
   * @param opts - Options (excludeSimilar, case).
   * @returns Alphabetic OTP string.
   *
   * @example
   * ```ts
   * OTPX.alphabetic(5, { case: "upper" }); // => "KDJQP"
   * ```
   */
  static alphabetic(length: number = 6, opts: OtpOptions = {}): string {
    return this.generateOtp(length, "alphabetic", opts);
  }

  /**
   * Generate an alphanumeric OTP (A-Z, a-z, 0-9).
   *
   * @param length - Number of characters (default: 6).
   * @param opts - Options (excludeSimilar, case).
   * @returns Alphanumeric OTP string.
   *
   * @example
   * ```ts
   * OTPX.alphanumeric(8, { excludeSimilar: true }); // => "b7XhQ2Zk"
   * ```
   */
  static alphanumeric(length: number = 6, opts: OtpOptions = {}): string {
    return this.generateOtp(length, "alphanumeric", opts);
  }

  /**
   * Generate a hexadecimal OTP (0-9, a-f).
   *
   * @param length - Number of characters (default: 6).
   * @returns Hexadecimal OTP string.
   *
   * @example
   * ```ts
   * OTPX.hex(8); // => "9af3c120"
   * ```
   */
  static hex(length: number = 6): string {
    return this.generateOtp(length, "hex");
  }
}

export default OTPX;
export type { OtpCharset, OtpOptions };
