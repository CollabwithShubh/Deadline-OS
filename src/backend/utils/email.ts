import { Resend } from 'resend';

let resend: Resend | null = null;

export const sendWelcomeEmail = async (email: string, name: string) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not configured. Skipping welcome email.');
    return;
  }
  
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020204; color: #f4f4f5; padding: 40px; border-radius: 8px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #09090b; padding: 40px; border: 1px solid #27272a; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
        <h1 style="color: #ffffff; font-size: 24px; margin-top: 0;">Welcome to DeadlineOS</h1>
        <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6;">Hello ${name},</p>
        <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6;">Your operator console has been successfully generated. We're thrilled to have you onboard.</p>
        
        <div style="background-color: #18181b; padding: 20px; border-radius: 8px; margin: 30px 0; border: 1px solid #27272a;">
          <h2 style="color: #e4e4e7; font-size: 18px; margin-top: 0;">Your Next Steps:</h2>
          <ul style="color: #a1a1aa; line-height: 1.8;">
            <li>Set up your first project and tasks.</li>
            <li>Configure your focus timer parameters.</li>
            <li>Sync your compliance engine with your workflow.</li>
          </ul>
        </div>
        
        <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6;">Stay focused and keep executing.</p>
        <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 0;">- The DeadlineOS Terminal</p>
      </div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'DeadlineOS <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to DeadlineOS 🚀',
      html: htmlBody,
    });
    
    if (error) {
      if (error.name === 'validation_error') {
        console.warn('Welcome email skipped: Resend test domain can only send to verified emails.');
        return;
      }
      console.error('Resend API Error:', error);
      return;
    }
    
    console.log(`Welcome email sent to ${email}`, data);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};
