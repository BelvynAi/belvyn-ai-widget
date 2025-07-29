# Belvyn AI Assistant Widget

A premium dark-themed chat widget that integrates with n8n webhooks for AI-powered conversations.

## Features

- 🎨 Premium dark theme matching Belvyn brand
- 💬 Real-time chat interface with animated typing indicators
- 🔗 n8n webhook integration
- 📱 Responsive widget design (30% viewport width)
- 🎯 Easy embedding in any website
- 🔒 Secure iframe implementation with curved edges
- ♿ Accessibility compliant
- 💾 Session persistence
- 🔐 Privacy policy integration

## Quick Start

### 1. Deploy the Application

Deploy this Next.js application to Vercel or your preferred hosting platform.

### 2. Embed in Your Website

Add this script to your website's HTML, just before the closing `</body>` tag:

\`\`\`html
<script src="https://YOUR-DOMAIN.vercel.app/embed.js" defer></script>
\`\`\`

### For Framer (belvynai.com):
1. Go to Site Settings → Custom Code
2. Add the script to "End of `<body>` tag"
3. The widget will appear as a floating chat button that opens a curved widget taking 30% of the screen
4. Publish your site

### For Webflow:
1. Go to Project Settings → Custom Code
2. Add the script to "Footer Code"
3. Publish your site

## API Integration

The widget sends POST requests to:
\`\`\`
https://n8n.srv896614.hstgr.cloud/webhook/c469aedf-7307-4f41-a472-f991fdaf90a5/chat
\`\`\`

### Request Format:
\`\`\`json
{
  "chatInput": "user message here",
  "sessionId": "session_1722162000000_abc123def"
}
\`\`\`

### Response Handling:
- Plain text responses are displayed directly
- JSON responses are parsed to extract text content
- Supports markdown formatting (bold, italic, code)

## Usage

Once embedded, users will see a floating purple chat button in the bottom-right corner. Clicking it opens a full-screen modal with the chat interface.

### Starter Prompts:
- "What are AI Agents?"
- "How can Belvyn help my team?"
- "What kind of AI solutions do you offer?"

### Special Commands:
- `/clear` - Clears the conversation history

## Customization

The widget uses CSS custom properties for theming:
- `--bg-0`: Primary background (#0B0B10)
- `--bg-1`: Secondary background (#111116)
- `--brand`: Primary brand color (#4316B8)
- `--text-0`: Primary text (#EDEDF1)

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Security

- CSP headers configured for iframe embedding
- Content sanitization for assistant responses
- No API keys exposed to client
- Session data stored locally only
