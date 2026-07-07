const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendApplicationStatusEmail = async (candidateEmail, candidateName, jobTitle, company, status) => {
  const isAccepted = status === 'accepted';

  const mailOptions = {
    from: `"HR Platform" <${process.env.EMAIL_USER}>`,
    to: candidateEmail,
    subject: `Your application for ${jobTitle} at ${company} — ${isAccepted ? 'Congratulations!' : 'Update'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: ${isAccepted ? '#0F766E' : '#B91C1C'}">
          ${isAccepted ? '🎉 Congratulations!' : 'Application Update'}
        </h2>
        <p>Dear ${candidateName},</p>
        <p>
          We wanted to update you on your application for the position of 
          <strong>${jobTitle}</strong> at <strong>${company}</strong>.
        </p>
        ${isAccepted
          ? `<p style="color: #0F766E; font-weight: bold;">
               Your application has been <strong>accepted</strong>! 
               The recruiter will be in touch with you shortly.
             </p>`
          : `<p style="color: #B91C1C;">
               After careful consideration, your application was not selected 
               for this position. We encourage you to keep applying!
             </p>`
        }
        <p>Best regards,<br/><strong>HR Platform Team</strong></p>
        <hr style="border: 1px solid #E5E1D8; margin-top: 20px"/>
        <p style="font-size: 12px; color: #888;">This is an automated message from HR Platform.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendApplicationStatusEmail };