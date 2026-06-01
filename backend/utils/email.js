const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1) Create a transporter
    // For development, you can use Mailtrap or similar.
    // For Gmail, you'd need an App Password.
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        connectionTimeout: 5000, // 5 seconds connection timeout
        greetingTimeout: 5000,   // 5 seconds greeting timeout
        socketTimeout: 5000,     // 5 seconds socket timeout
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // 2) Define the email options
    const mailOptions = {
        from: 'PlantCare AI <noreply@plantcare.ai>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: 
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
