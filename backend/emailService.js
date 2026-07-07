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

const sendInterviewEmail = async (candidateEmail, candidateName, jobTitle, company, scheduledAt, location, notes) => {
  const interviewDate = new Date(scheduledAt).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const mailOptions = {
    from: `"HR Platform" <${process.env.EMAIL_USER}>`,
    to: candidateEmail,
    subject: `Interview Invitation — ${jobTitle} at ${company}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0F766E">📅 Interview Invitation</h2>
        <p>Dear ${candidateName},</p>
        <p>
          We are pleased to invite you for an interview for the position of
          <strong>${jobTitle}</strong> at <strong>${company}</strong>.
        </p>
        <div style="background: #F0F9F8; border-left: 4px solid #0F766E; padding: 16px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 4px 0"><strong>📅 Date & Time:</strong> ${interviewDate}</p>
          <p style="margin: 4px 0"><strong>📍 Location:</strong> ${location}</p>
          ${notes ? `<p style="margin: 4px 0"><strong>📝 Notes:</strong> ${notes}</p>` : ''}
        </div>
        <p>Please log in to your HR Platform account to confirm or cancel this interview.</p>
        <p>Best regards,<br/><strong>HR Platform Team</strong></p>
        <hr style="border: 1px solid #E5E1D8; margin-top: 20px"/>
        <p style="font-size: 12px; color: #888;">This is an automated message from HR Platform.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendApplicationStatusEmail, sendInterviewEmail };