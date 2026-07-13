import { useState, useRef, useEffect } from 'react';

const getRuleBasedResponse = (message, user) => {
  const msg = message.toLowerCase();

  // Greetings
  if (msg.match(/^(hi|hello|hey|bonjour|salut|salam)/)) {
    return `👋 Hello${user ? ` ${user.name}` : ''}! I'm HRBot, your AI assistant. How can I help you today?\n\nYou can ask me about:\n• 🔍 Finding jobs\n• 📄 Applying with your CV\n• 🤖 AI match scores\n• 📅 Interview scheduling\n• ⚙️ How the platform works`;
  }

  // Jobs
  if (msg.includes('job') && (msg.includes('find') || msg.includes('search') || msg.includes('available') || msg.includes('look'))) {
    return `🔍 To find jobs:\n\n1. Go to the **Jobs** page\n2. Use the search bar to filter by title, company, location or skill\n3. Use filter chips (Frontend, Backend, AI, etc.)\n4. Sort by newest, salary, or best match\n\n⭐ Jobs with a match badge are recommended based on your profile skills!`;
  }

  // Apply
  if (msg.includes('apply') || msg.includes('application')) {
    return `📝 To apply for a job:\n\n1. Go to the Jobs page\n2. Find a job you like\n3. Click **Apply Now**\n4. Upload your CV (PDF) for best AI matching\n5. Or paste your CV text manually\n\n🤖 Our AI will automatically calculate your skill match score!`;
  }

  // AI matching
  if (msg.includes('ai') || msg.includes('match') || msg.includes('score') || msg.includes('skill')) {
    return `🤖 Our AI matching system:\n\n• Analyzes your CV text or PDF\n• Compares your skills against job requirements\n• Calculates a match percentage (0-100%)\n• Shows ✅ matched skills and ❌ missing skills\n• Auto-ranks candidates for recruiters\n\n💡 Tip: Add your skills to your Profile for automatic job recommendations!`;
  }

  // CV / PDF
  if (msg.includes('cv') || msg.includes('resume') || msg.includes('pdf')) {
    return `📄 About CV upload:\n\n• Upload your CV as a **PDF file**\n• Our AI extracts the text automatically\n• Skills are matched against job requirements\n• The better your CV matches, the higher your score\n\n💡 Make sure your CV clearly lists your technical skills!`;
  }

  // Interview
  if (msg.includes('interview')) {
    return `📅 Interview scheduling:\n\n**For candidates:**\n• You'll receive an email when an interview is scheduled\n• Go to My Applications to confirm or cancel\n• Meeting links (Google Meet, Zoom) are included\n\n**For recruiters:**\n• Go to My Applicants\n• Click "Schedule Interview" next to a candidate\n• Set date, time, location and notes\n• Candidate gets an automatic email invitation`;
  }

  // Email / notification
  if (msg.includes('email') || msg.includes('notification')) {
    return `📧 Email notifications:\n\n You receive emails when:\n• Your application is accepted ✅\n• Your application is rejected ❌\n• An interview is scheduled 📅\n• Account verification needed\n\nCheck your spam folder if you don't see them!`;
  }

  // Profile / skills
  if (msg.includes('profile') || msg.includes('skills')) {
    return `👤 Your Profile:\n\n1. Click your name in the navbar\n2. Update your name and email\n3. Add your skills (comma separated)\n4. Change your password\n\n🤖 Skills you add are used by AI to recommend matching jobs automatically on the Jobs page!`;
  }

  // Recruiter
  if (msg.includes('recruiter') || msg.includes('post job') || msg.includes('post a job') || msg.includes('hire') || msg.includes('posting')) {
    return `🏢 For Recruiters:\n\n• **Post a Job** — click "Post a Job" in the navbar\n• **My Applicants** — see all candidates ranked by AI match\n• **Schedule interviews** — directly from the dashboard\n• **Accept/Reject** — with automatic email to candidate\n• **Close/Reopen jobs** — control application flow`;
  }

  // Admin
  if (msg.includes('admin')) {
    return `⚡ Admin Dashboard:\n\n• View total users, jobs and applications\n• See charts (users by role, jobs by status)\n• Manage all users (delete accounts)\n• Search and filter users by role\n\nOnly admin accounts can access this page.`;
  }

  // Registration / login
  if (msg.includes('register') || msg.includes('signup') || msg.includes('sign up') || msg.includes('create account')) {
    return `✨ Creating an account:\n\n1. Click **Get Started** in the navbar\n2. Choose your role: Candidate or Recruiter\n3. Fill in your details\n4. Check your email for verification link\n5. Click the link to activate your account\n6. Sign in and start exploring!`;
  }

  if (msg.includes('login') || msg.includes('sign in') || msg.includes('password')) {
    return `🔐 Login help:\n\n• Go to the Sign In page\n• Enter your email and password\n• Make sure you verified your email first\n• Use "Forgot password?" if needed\n\n⚠️ Unverified accounts cannot log in — check your inbox!`;
  }

  // Thank you
  if (msg.match(/(thank|thanks|merci|شكر)/)) {
    return `😊 You're welcome! Is there anything else I can help you with?`;
  }

  // Help
  if (msg.includes('help') || msg.includes('what can you do') || msg.includes('?')) {
    return `🤖 I can help you with:\n\n• 🔍 Finding and searching jobs\n• 📄 Applying with your CV\n• 🤖 Understanding AI match scores\n• 📅 Interview scheduling\n• 👤 Profile and skills setup\n• 🏢 Recruiter features\n• ⚡ Admin dashboard\n• 📧 Email notifications\n\nJust ask me anything about the platform!`;
  }

  // Default
  return `🤔 I'm not sure about that specific question. Here's what I can help with:\n\n• Finding and applying to jobs\n• Understanding your AI match score\n• Interview scheduling\n• Profile and skills setup\n• Platform features\n\nTry asking something like "How do I apply?" or "What is AI matching?"`;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m HRBot, your AI assistant. I can help you find jobs, understand your match scores, or answer any questions about the platform. What can I help you with?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    // Simulate thinking delay
    setTimeout(() => {
      const reply = getRuleBasedResponse(userMessage, user);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      setLoading(false);
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '24px',
          width: '380px',
          height: '520px',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          border: '1px solid rgba(226,232,240,0.8)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'chatSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0F172A, #1E3A5F)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', flexShrink: 0
            }}>
              🤖
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '15px', margin: 0 }}>HRBot</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 }}>
                AI Assistant • Online
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                marginLeft: 'auto', background: 'rgba(255,255,255,0.1)',
                border: 'none', color: 'white', width: '32px', height: '32px',
                borderRadius: '50%', cursor: 'pointer', fontSize: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'none', padding: 0, flexShrink: 0
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: '12px'
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end', gap: '8px'
              }}>
                {msg.role === 'assistant' && (
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', flexShrink: 0
                  }}>🤖</div>
                )}
                <div style={{
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #2563EB, #1D4ED8)'
                    : '#F1F5F9',
                  color: msg.role === 'user' ? 'white' : '#0F172A',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px'
                }}>🤖</div>
                <div style={{
                  padding: '10px 14px', borderRadius: '18px 18px 18px 4px',
                  background: '#F1F5F9', display: 'flex', gap: '4px', alignItems: 'center'
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: '#94A3B8',
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex', gap: '8px', alignItems: 'flex-end'
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              rows={1}
              style={{
                flex: 1, resize: 'none', border: '1.5px solid #E2E8F0',
                borderRadius: '12px', padding: '10px 14px', fontSize: '14px',
                fontFamily: 'var(--font-body)', outline: 'none',
                transition: 'border-color 0.2s',
                maxHeight: '80px', lineHeight: 1.5
              }}
              onFocus={e => e.target.style.borderColor = '#2563EB'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: input.trim() && !loading
                  ? 'linear-gradient(135deg, #2563EB, #1D4ED8)'
                  : '#E2E8F0',
                border: 'none',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', flexShrink: 0, padding: 0,
                boxShadow: input.trim() && !loading ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {loading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: isOpen
            ? 'linear-gradient(135deg, #1E3A5F, #0F172A)'
            : 'linear-gradient(135deg, #2563EB, #06B6D4)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: '0 8px 32px rgba(37,99,235,0.4)',
          zIndex: 1001,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: 0
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? '×' : '🤖'}
      </button>

      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}