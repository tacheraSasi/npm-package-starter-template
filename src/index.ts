import { randomInt, createHmac } from "crypto";

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
 *
 * @property excludeSimilar Exclude visually similar characters (O, 0, I, l).
 * @property case Force case transformation: "upper", "lower", or "mixed".
 * @property run Optional callback invoked once after OTP is generated. Useful for logging, hooks, or side effects.
 * @example
 * OTPX.generateOtp(6, "numeric", { run: () => console.log("OTP generated!") });
 */
interface OtpOptions {
  /** Exclude visually similar characters (O, 0, I, l). */
  excludeSimilar?: boolean;
  /** Force case transformation. */
  case?: "upper" | "lower" | "mixed";
  /**
   * Optional callback invoked once after OTP is generated.
   * Useful for logging, hooks, or side effects.
   */
  run?: (otp: string) => void | Promise<void>;
}

/**
 * Options for generating an HOTP (HMAC-based One-Time Password).
 */
interface HotpOptions {
  /** The shared secret key. For best results, use a Base32 encoded string. */
  secret: string;
  /** The counter value. */
  counter: number;
  /** The hashing algorithm to use. */
  algorithm?: "SHA1" | "SHA256" | "SHA512";
  /** The number of digits in the OTP. */
  digits?: number;
}

/**
 * Options for generating a TOTP (Time-based One-Time Password).
 */
interface TotpOptions {
  /** The shared secret key. For best results, use a Base32 encoded string. */
  secret: string;
  /** The hashing algorithm to use. */
  algorithm?: "SHA1" | "SHA256" | "SHA512";
  /** The number of digits in the OTP. */
  digits?: number;
  /** The time step in seconds. */
  period?: number;
  /** The Unix timestamp to generate the OTP for. Defaults to the current time. */
  timestamp?: number;
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
    if (options.run) {
      options.run(otp);
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

  /**
   * Generates an HOTP (HMAC-based One-Time Password) according to RFC 4226.
   *
   * @param options - The options for generating the HOTP.
   * @returns A numeric HOTP string.
   *
   * @example
   * ```ts
   * const hotp = OTPX.hotp({ secret: "MySecret", counter: 1 });
   * // => "287082"
   * ```
   */
  static hotp({
    secret,
    counter,
    algorithm = "SHA1",
    digits = 6,
  }: HotpOptions): string {
    // NOTE:The secret should ideally be a Buffer, but we accept a string.
    // TODO:handle Base32 decoding here,
    // but for now, we'll use the string directly.
    const secretBuffer = Buffer.from(secret, "utf8");

    // RFC 4226 specifies an 8-byte counter
    const counterBuffer = Buffer.alloc(8);
    let tempCounter = counter;
    for (let i = 7; i >= 0; i--) {
      counterBuffer[i] = tempCounter & 0xff;
      tempCounter >>= 8;
    }

    // Create an HMAC digest
    const hmac = createHmac(algorithm, secretBuffer);
    hmac.update(counterBuffer);
    const hmacResult = hmac.digest();

    // Dynamic truncation
    const offset = hmacResult[hmacResult.length - 1] & 0x0f;
    const binary =
      ((hmacResult[offset] & 0x7f) << 24) |
      ((hmacResult[offset + 1] & 0xff) << 16) |
      ((hmacResult[offset + 2] & 0xff) << 8) |
      (hmacResult[offset + 3] & 0xff);

    // Get the code and pad with leading zeros if necessary
    const code = binary % 10 ** digits;
    return code.toString().padStart(digits, "0");
  }

  /**
   * Generates a TOTP (Time-based One-Time Password) according to RFC 6238.
   *
   * @param options - The options for generating the TOTP.
   * @returns A numeric TOTP string.
   *
   * @example
   * ```ts
   * const totp = OTPX.totp({ secret: "MySecret" });
   * // => e.g., "123456" (changes every 30 seconds)
   * ```
   */
  static totp({
    secret,
    algorithm = "SHA1",
    digits = 6,
    period = 30,
    timestamp = Date.now(),
  }: TotpOptions): string {
    const counter = Math.floor(timestamp / 1000 / period);
    return this.hotp({ secret, counter, algorithm, digits });
  }
}

export default OTPX;
export type { OtpCharset, OtpOptions, HotpOptions, TotpOptions };
