"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplate = exports.sendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
/**
 * Mail Service - Handles email notifications
 */
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025'),
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
});
const sendMail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: '"VELOIRE" <no-reply@veloire.com>',
            to,
            subject,
            html,
        });
        console.log('[MailService] Email sent:', info.messageId);
        return info;
    }
    catch (error) {
        console.error('[MailService] Error sending email:', error);
        // We don't throw here to avoid breaking the main request flow for now
        return null;
    }
};
exports.sendMail = sendMail;
const getTemplate = (name, data) => {
    // Simple string replacement template engine
    // In a real app, use ejs or handlebars
    const templates = {
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
exports.getTemplate = getTemplate;
