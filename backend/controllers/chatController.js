const axios = require('axios');

exports.chat = async (req, res) => {
  try {
    const { messages, userRole, userName } = req.body;

    console.log('📨 Messages received:', JSON.stringify(messages, null, 2));
    console.log('🔑 API Key exists:', !!process.env.ANTHROPIC_API_KEY);

    const systemPrompt = `You are HRBot, a helpful AI assistant for HRPlatform — a modern AI-powered HR and recruitment platform built in Tunisia.

You help:
- Candidates find jobs, understand their AI match scores, prepare for interviews, and improve their CVs
- Recruiters post jobs, review applicants, schedule interviews, and manage their hiring pipeline
- Anyone understand how the platform works

Platform features:
- Job listings with AI-powered skill matching (candidates upload CV PDFs, AI scores them)
- Negation-aware AI matching (understands "I have not worked with Docker" correctly)
- Email notifications when applications are accepted/rejected
- Interview scheduling with email invitations
- Admin dashboard with charts and user management
- Profile page where candidates list their skills for job recommendations
- Real-time job search and filtering
- Application progress tracking

Keep responses concise, friendly, and helpful. Use emojis occasionally.
${userName ? `Current user: ${userName}, role: ${userRole}` : ''}`;

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: systemPrompt,
        messages
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    res.json({ reply: response.data.content[0].text });

  } catch (error) {
    console.log('❌ Chat error status:', error.response?.status);
    console.log('❌ Chat error data:', JSON.stringify(error.response?.data, null, 2));
    res.status(500).json({ message: 'Chat service unavailable' });
  }
};