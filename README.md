# OTPX
A lightweight, flexible OTP (One-Time Password) generator for Node.js and TypeScript.

Supports multiple charsets (numeric, alphabetic, alphanumeric, hex, or custom), case options, and exclusion of ambiguous characters like `O0Il`.

---

## Features
- Generate OTPs with customizable length
- Built-in charsets: `numeric`, `alphabetic`, `alphanumeric`, `hex`
- Provide your own custom charset
- Exclude visually similar characters (`O`, `0`, `I`, `l`)
- Case handling: upper, lower, or mixed
- Secure random generation using Node.js `crypto`

---

## Installation

```bash
npm install otpx
# or

```

---

## Usage

### Basic Example

```ts
import OTPX from "otpx";

// Generate a 6-digit numeric OTP
const otp = OTPX.numeric();
console.log(otp); // e.g. "583920"
```

---

### Using Different Charsets

```ts
import OTPX from "otpx";

// Alphabetic OTP (mixed case)
console.log(OTPX.alphabetic(8)); // e.g. "aZkPqTrB"

// Alphanumeric OTP with options
console.log(OTPX.alphanumeric(10, { excludeSimilar: true }));
// e.g. "9kPz3Hd2Gq"

// Hexadecimal OTP
console.log(OTPX.hex(12)); // e.g. "a3f92b8e10d7"
```

---

### Custom Charset

```ts
import OTPX from "otpx";

// Only vowels
const otp = OTPX.generateOtp(6, { custom: "aeiou" });
console.log(otp); // e.g. "uaeioe"
```

---

### Case Options

```ts
import OTPX from "otpx";

console.log(OTPX.alphabetic(6, { case: "upper" })); // "QTRPZB"
console.log(OTPX.alphabetic(6, { case: "lower" })); // "xndqem"
console.log(OTPX.alphabetic(6, { case: "mixed" })); // "xNdQeM"
```

---

## API Reference

### `OTPX.generateOtp(length?, charset?, options?)`

* `length` (default `6`) → Number of characters
* `charset` → `"numeric" | "alphabetic" | "alphanumeric" | "hex" | { custom: string }`
* `options`:

  * `excludeSimilar?: boolean` → Excludes confusing chars (`O0Il`)
  * `case?: "upper" | "lower" | "mixed"` → Controls casing
  * `run?: () => void` → Optional callback invoked once after OTP is generated. Useful for logging, hooks, or side effects.

### Shorthand Methods

* `OTPX.numeric(length?)`
* `OTPX.alphabetic(length?, options?)`
* `OTPX.alphanumeric(length?, options?)`
* `OTPX.hex(length?)`

---

### Using the `run` Option

You can pass a `run` callback to `generateOtp` to perform actions after the OTP is generated (e.g., logging, hooks, analytics):

```ts
import OTPX from "otpx";

OTPX.generateOtp(6, "numeric", {
  run: () => {
    console.log("OTP was generated!");
  }
});
```

---

## Example with NestJS

```ts
import { Injectable } from "@nestjs/common";
import OTPX from "otpx";

@Injectable()
export class OtpService {
  generateLoginOtp() {
    return OTPX.numeric(6);
  }
}
```

---

## License

MIT

