type OtpCharset = 'numeric' | 'alphanumeric';

/**
 * The EkiliRelay class handles email sending and file upload functionality
 * using a provided API key. It connects to remote API endpoints and sends requests
 * based on the given parameters.
 */
class OTPX {
  static generateOtp(
  length: number = 6,
  charset: OtpCharset = 'numeric',
  options: { excludeSimilar?: boolean } = {},
): string {
  let chars = charset === 'numeric'
    ? '0123456789'
    : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  if (options.excludeSimilar) {
    chars = chars.replace(/[O0Il]/g, '');
  }

  let otp = '';
  for (let i = 0; i < length; i++) {
    const randIndex = Math.floor(Math.random() * chars.length);
    otp += chars[randIndex];
  }
  return otp;
}
}

export default OTPX;
export type { OtpCharset };