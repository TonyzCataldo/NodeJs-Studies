interface VerificationEmailProps {
  name: string;
  verificationLink: string;
}

export function getVerificationEmailTemplate({
  name,
  verificationLink,
}: VerificationEmailProps): string {
  return `
      <div style="font-family: sans-serif; font-size: 16px; color: #111;">
        <p>Olá, <strong>${name}</strong>!</p>
        <p>Obrigado por se cadastrar no Tático Questões.</p>
        <p>Para ativar sua conta, clique no botão abaixo:</p>
        <p>
          <a href="${verificationLink}" style="background-color: #2563eb; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verificar Email
          </a>
        </p>
        <p>Ou copie e cole este link: ${verificationLink}</p>
        <p>Se você não criou esta conta, ignore este email.</p>
      </div>
  `;
}
