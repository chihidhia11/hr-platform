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

const sendVerificationEmail = async (userEmail, userName, verificationToken) => {
  const verificationUrl = `http://localhost:5173/verify/${verificationToken}`;

  const mailOptions = {
    from: `"HR Platform" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: '✉️ Verify your HRPlatform account',
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F8FAFC; padding: 40px 20px;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 28px; font-weight: 800; color: #0F172A; margin: 0; letter-spacing: -0.02em;">
            HR<span style="color: #2563EB;">Platform</span>
          </h1>
        </div>

        <!-- Card -->
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E2E8F0;">
          
          <div style="text-align: center; margin-bottom: 28px;">
            <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #2563EB, #06B6D4); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 16px;">
              ✉️
            </div>
            <h2 style="font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 8px;">
              Verify your email
            </h2>
            <p style="color: #64748B; font-size: 15px; margin: 0;">
              Hi <strong>${userName}</strong>, welcome to HRPlatform!
            </p>
          </div>

          <p style="color: #64748B; font-size: 15px; line-height: 1.7; margin-bottom: 28px; text-align: center;">
            Please click the button below to verify your email address and activate your account. This link expires in <strong>24 hours</strong>.
          </p>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 28px;">
            <a href="${verificationUrl}" style="
              display: inline-block;
              background: linear-gradient(135deg, #2563EB, #1D4ED8);
              color: white;
              padding: 14px 32px;
              border-radius: 10px;
              font-size: 16px;
              font-weight: 700;
              text-decoration: none;
              box-shadow: 0 4px 16px rgba(37,99,235,0.35);
              letter-spacing: 0.01em;
            ">
              ✅ Verify My Account →
            </a>
          </div>

          <p style="color: #94A3B8; font-size: 13px; text-align: center; margin: 0;">
            If the button doesn't work, copy and paste this link:<br/>
            <a href="${verificationUrl}" style="color: #2563EB; word-break: break-all;">${verificationUrl}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 24px;">
          <p style="color: #94A3B8; font-size: 12px; margin: 0;">
            If you didn't create an account, you can safely ignore this email.<br/>
            © 2026 HRPlatform. All rights reserved.
          </p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendApplicationStatusEmail, sendInterviewEmail, sendVerificationEmail };