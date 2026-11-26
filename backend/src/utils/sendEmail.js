import nodemailer from 'nodemailer';

const isSmtpConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const createTransporter = () => {
  const port = Number(process.env.SMTP_PORT) || 587;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
};

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!isSmtpConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SMTP is not configured');
    }
    console.log('\n📧 [DEV] SMTP not configured. Email NOT sent, printed here instead:');
    console.log(`To: ${to}\nSubject: ${subject}\n\n${text}\n`);
    return;
  }

  await createTransporter().sendMail({
    from: process.env.EMAIL_FROM || `WasteWise <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
};