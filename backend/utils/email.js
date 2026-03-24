import nodemailer from "nodemailer";

let transporter;
let resolvedMailConfig;

const getMailConfig = () => {
    if (resolvedMailConfig) return resolvedMailConfig;

    const host = process.env.MAIL_HOST || process.env.SMTP_HOST || process.env.EMAIL_HOST;
    const portValue = process.env.MAIL_PORT || process.env.SMTP_PORT || process.env.EMAIL_PORT;
    const port = portValue ? Number(portValue) : undefined;
    const secureValue = process.env.MAIL_SECURE || process.env.SMTP_SECURE || process.env.EMAIL_SECURE;
    const secure = secureValue === "true";
    const service = process.env.MAIL_SERVICE || process.env.SMTP_SERVICE || process.env.EMAIL_SERVICE;
    const user = process.env.MAIL_USER || process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.MAIL_PASS || process.env.SMTP_PASS || process.env.EMAIL_PASS;
    const from = process.env.MAIL_FROM || process.env.SMTP_FROM || process.env.EMAIL_FROM || (user ? `TrekTales <${user}>` : undefined);

    resolvedMailConfig = { host, port, secure, service, user, pass, from };
    return resolvedMailConfig;
};

export const isMailConfigured = () => {
    const config = getMailConfig();

    const hasServer = Boolean(config.service || (config.host && config.port));
    return Boolean(
        hasServer &&
        config.user &&
        config.pass &&
        config.from
    );
};

const getTransporter = async () => {
    if (transporter) return transporter;

    const config = getMailConfig();

    const transportOptions = config.service
        ? {
            service: config.service,
            secure: config.secure,
            auth: {
                user: config.user,
                pass: config.pass,
            },
        }
        : {
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: config.user,
                pass: config.pass,
            },
        };

    transporter = nodemailer.createTransport(transportOptions);

    return transporter;
};

export const sendEmail = async ({ to, subject, text, html }) => {
    if (!isMailConfigured()) {
        console.warn("Email skipped: SMTP environment variables are not fully configured.");
        return { success: false, skipped: true, reason: "smtp_not_configured" };
    }

    const mailTransporter = await getTransporter();
    const config = getMailConfig();

    await mailTransporter.sendMail({
        from: config.from,
        to,
        subject,
        text,
        html,
    });

    return { success: true };
};
