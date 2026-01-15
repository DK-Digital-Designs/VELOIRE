import nodemailer from 'nodemailer';

/**
 * Mail Service - Handles email notifications
 */

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025'),
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
});

export const sendMail = async (to: string, subject: string, html: string) => {
    try {
        const info = await transporter.sendMail({
            from: '"VELOIRE" <no-reply@veloire.com>',
            to,
            subject,
            html,
        });
        console.log('[MailService] Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('[MailService] Error sending email:', error);
        // We don't throw here to avoid breaking the main request flow for now
        return null;
    }
};

export const getTemplate = (name: string, data: Record<string, string>) => {
    // Simple string replacement template engine
    // In a real app, use ejs or handlebars
    const templates: Record<string, string> = {
        'rfa-submitted': `
      <h1>Request Received</h1>
      <p>Hello {{clientName}},</p>
      <p>We have received your request for access to VELOIRE. Our team will review your application manually.</p>
      <p>Vehicle: {{vehicleName}}</p>
      <p>Dates: {{startDate}} - {{endDate}}</p>
      <br>
      <p>Best Regards,<br>The VELOIRE Team</p>
    `,
        'owner-applied': `
      <h1>Partnership Enquiry</h1>
      <p>Hello {{name}},</p>
      <p>Thank you for your interest in listing your vehicle with VELOIRE. A member of our concierge team will contact you shortly.</p>
      <br>
      <p>Best Regards,<br>The VELOIRE Team</p>
    `
    };

    let template = templates[name] || '<p>No template found</p>';
    Object.keys(data).forEach(key => {
        template = template.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
    });

    return template;
};
