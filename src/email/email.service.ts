import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendTestEmail(to: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Testing Brevo 🚀',
        html: `
          <p>Hello!</p>
          <p>If you received this email, Brevo SMTP is configured successfully.</p>
        `,
      });
      this.logger.log(`Test email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send test email to ${to}`, error.stack);
      throw new InternalServerErrorException('Failed to send test email.');
    }
  }

  async sendVerificationEmail(to: string, verificationLink: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Verify your email address - Porto Dev',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; color: #111827;">
            <div style="text-align: center; padding: 20px 0;">
              <h1 style="font-size: 24px; font-weight: 800; margin: 0; letter-spacing: 1px;">
                <span style="font-size: 22px;">⬢</span> PORTO
              </h1>
            </div>
            <div style="background-color: #f4efe9; padding: 40px 30px; border-radius: 12px 12px 0 0;">
              <p style="color: #a88a6d; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin: 0 0 10px 0;">Welcome to Porto</p>
              <h2 style="font-family: Georgia, serif; font-size: 38px; font-weight: normal; margin: 0 0 20px 0; color: #111;">Verify your<br>email address</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #374151; margin: 0;">
                Thanks for creating your account.<br>
                Please verify your email address to<br>
                activate your account and start<br>
                building <strong>your portfolio</strong>.
              </p>
            </div>
            <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 12px; margin-top: -15px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); text-align: center;">
              <div style="background-color: #f4efe9; width: 64px; height: 64px; border-radius: 50%; display: inline-block; line-height: 64px; margin-bottom: 20px; font-size: 24px;">✉️</div>
              <p style="font-size: 15px; color: #4b5563; margin: 0 0 24px 0; line-height: 1.5;">
                Click the button below to verify your email<br>
                and secure your account.
              </p>
              <a href="${verificationLink}" style="background-color: #111827; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
                Verify Email Address &nbsp;&rarr;
              </a>
              <p style="font-size: 13px; color: #9ca3af; margin: 24px 0 0 0;">
                <span style="vertical-align: middle;">⏱️</span> This verification link will expire in 30 minutes.
              </p>
            </div>
            <div style="background-color: #ffffff; border-radius: 12px; margin-top: 16px; border: 1px solid #f3f4f6; padding: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="50" valign="top">
                    <div style="background-color: #f4efe9; width: 40px; height: 40px; border-radius: 50%; display: inline-block; text-align: center; line-height: 40px;">
                      <span style="font-size: 18px; opacity: 0.7;">?</span>
                    </div>
                  </td>
                  <td valign="top" style="padding-left: 16px;">
                    <h3 style="font-size: 15px; font-weight: 600; margin: 0 0 4px 0; color: #111827;">Didn't create an account?</h3>
                    <p style="font-size: 14px; margin: 0; color: #6b7280; line-height: 1.5;">
                      If you didn't sign up for Porto, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </div>
            <div style="text-align: center; padding: 40px 0 20px 0;">
              <p style="color: #a88a6d; font-size: 13px; font-weight: 500; margin: 0 0 8px 0;">Build your portfolio. Own your story.</p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; 2026 Porto. All rights reserved.</p>
            </div>
          </div>
        `,
      });
      this.logger.log(`Verification email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error.stack);
      throw new InternalServerErrorException(
        `Failed to send verification email. Error: ${error.message || 'Unknown error'}`
      );
    }
  }

  async sendPasswordChangeNotification(to: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Security Alert: Password Changed - Porto Dev',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; color: #111827;">
            <div style="text-align: center; padding: 20px 0;">
              <h1 style="font-size: 24px; font-weight: 800; margin: 0; letter-spacing: 1px;">
                <span style="font-size: 22px;">⬢</span> PORTO
              </h1>
            </div>
            <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); text-align: center;">
              <div style="background-color: #fee2e2; width: 64px; height: 64px; border-radius: 50%; display: inline-block; line-height: 64px; margin-bottom: 20px; font-size: 24px;">🔒</div>
              <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 16px 0; color: #111;">Password Changed</h2>
              <p style="font-size: 15px; color: #4b5563; margin: 0 0 24px 0; line-height: 1.5;">
                This is a confirmation that the password for your Porto account has just been changed.
              </p>
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; text-align: left; margin-top: 24px;">
                <h3 style="font-size: 14px; font-weight: 600; color: #991b1b; margin: 0 0 8px 0;">Didn't make this change?</h3>
                <p style="font-size: 13px; color: #b91c1c; margin: 0; line-height: 1.5;">
                  If you did not authorize this change, please contact support immediately to secure your account.
                </p>
              </div>
            </div>
            <div style="text-align: center; padding: 40px 0 20px 0;">
              <p style="color: #a88a6d; font-size: 13px; font-weight: 500; margin: 0 0 8px 0;">Build your portfolio. Own your story.</p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; 2026 Porto. All rights reserved.</p>
            </div>
          </div>
        `,
      });
      this.logger.log(`Password change notification sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password change notification to ${to}`, error.stack);
      // We don't throw an error here because the password was already successfully changed.
      // We just log the failure of the notification email.
    }
  }
}
