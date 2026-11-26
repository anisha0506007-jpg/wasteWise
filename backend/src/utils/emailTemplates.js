const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const passwordResetEmail = ({ name, resetUrl, expiresInMinutes }) => ({
  subject: 'Reset your WasteWise password',
  text: `Hi ${name},

We received a request to reset your WasteWise password.
Open this link to choose a new password (valid for ${expiresInMinutes} minutes):

${resetUrl}

If you did not request this, you can ignore this email. Your password will not change.`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#24332D">
      <h2 style="color:#176B4D">Reset your password</h2>
      <p>Hi ${escapeHtml(name)},</p>
      <p>We received a request to reset your WasteWise password. This link is valid for ${expiresInMinutes} minutes.</p>
      <p>
        <a href="${escapeHtml(resetUrl)}"
           style="display:inline-block;padding:12px 24px;background:#176B4D;color:#ffffff;text-decoration:none;border-radius:999px;font-weight:bold">
          Choose a new password
        </a>
      </p>
      <p style="font-size:13px;color:#718078">If you did not request this, you can safely ignore this email.</p>
    </div>`,
});