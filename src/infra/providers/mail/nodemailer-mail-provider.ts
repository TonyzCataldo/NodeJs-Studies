import nodemailer, { Transporter } from "nodemailer";
import { IMailProvider } from "../../../shared/providers/mail-provider";

export class NodemailerMailProvider implements IMailProvider {
  private client!: Transporter;

  constructor() {
    // We defer initialization or do it here.
    // Since we are in strict mode and need 'client' to be assigned,
    // and createTestAccount is async, we handle this carefully.
    // For now, let's just assert it will be created on send or use a basic setup.
  }

  async sendMail(to: string, subject: string, body: string): Promise<void> {
    if (!this.client) {
      if (process.env.SMTP_HOST) {
        // Production / SMTP
        this.client = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } else {
        // Development / Ethereal
        const account = await nodemailer.createTestAccount();
        this.client = nodemailer.createTransport({
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          auth: {
            user: account.user,
            pass: account.pass,
          },
        });

        console.log("📨 Ethereal Mail Configured!");
      }
    }

    const message = await this.client.sendMail({
      from: "Tático Questões <noreply@taticoquestoes.com.br>",
      to,
      subject,
      html: body,
    });

    console.log("Message sent: %s", message.messageId);
    if (!process.env.SMTP_HOST) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(message));
    }
  }
}
