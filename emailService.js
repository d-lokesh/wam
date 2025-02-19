const nodemailer = require('nodemailer');

// Set up email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nanibook1@gmail.com', // Replace with your Gmail
        pass: process.env.Email_pass  // Use an App Password if 2FA is enabled
    }
});

// Function to send email alerts
const sendEmailAlert = async (from, to, body) => {
    try {
        const mailOptions = {
            from: 'nanibook1@gmail.com',
            to: 'dlokesh900@gmail.com', // Change this to your notification email
            subject: 'Email Script Alert',
            text: `Eamil script ran sucessfully`
        };

        await transporter.sendMail(mailOptions);
        console.log('📧 Alert email sent!');
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
};

module.exports = { sendEmailAlert };
