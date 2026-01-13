import { IMailProvider } from "../mail-provider";

interface Message {
  to: string;
  subject: string;
  body: string;
}

export class FakeMailProvider implements IMailProvider {
  private messages: Message[] = [];

  async sendMail(to: string, subject: string, body: string): Promise<void> {
    this.messages.push({
      to,
      subject,
      body,
    });
  }
}
