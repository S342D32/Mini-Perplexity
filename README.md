# Mini Perplexity - AI-Powered Search Assistant

A simplified version of Perplexity AI built with Next.js 14, TypeScript, Tailwind CSS, and Shadcn UI. Get instant, conversational answers with sources instead of traditional search results.

![Mini Perplexity](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

## 🚀 Features

- **AI-Powered Chat Interface**: Perplexity-style conversational UI with auto-scroll
- **Collapsible Sidebar**: Mobile and desktop responsive sidebar with recent chats
- **Real-time Search**: Integration with Google Gemini 2.0 Flash for intelligent responses
- **Source Citations**: Displays sources and references for transparency
- **Modern UI**: Built with Shadcn UI components and Tailwind CSS
- **Authentication**: Secure user accounts with NextAuth

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes
- **AI**: Google Gemini 2.0 Flash for summarization
- **Search**: Tavily API for web search (configurable)
- **Database**: PostgreSQL (optional)
- **Authentication**: NextAuth

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nextjs-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   TAVILY_API_KEY=your_tavily_api_key_here (optional)
   NEXTAUTH_SECRET=your_nextauth_secret_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 API Keys Setup

### Gemini API Key (Required)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file as `GEMINI_API_KEY`

### Tavily API Key (Optional)
1. Visit [Tavily](https://tavily.com) 
2. Sign up and get your API key
3. Add it to your `.env` file as `TAVILY_API_KEY`

*Note: Without Tavily API, the app uses mock search results for demonstration.*

## 🎯 Usage

1. **Start a New Chat**: Click "New Chat" in the sidebar
2. **Ask Questions**: Type any question in natural language
3. **Get Instant Answers**: Receive comprehensive responses with sources
4. **Follow-up Questions**: Continue the conversation naturally
5. **View History**: Access recent chats from the sidebar

## 🏗️ Project Structure

```
app/
├── api/
│   └── chat/
│       └── route.ts          # Chat API endpoint
├── dashboard/
│   ├── components/
│   │   ├── chat-interface.tsx # Main chat component
│   │   └── perplexity-sidebar.tsx # Sidebar component
│   ├── layout.tsx            # Dashboard layout
│   └── (overview)/
│       └── page.tsx          # Main dashboard page
├── login/                    # Authentication pages
├── signup/
└── page.tsx                  # Landing page
```

## 🔧 Customization

### Adding New Features
- **Custom Search Sources**: Modify the search function in `/api/chat/route.ts`
- **UI Themes**: Update Tailwind classes in components
- **Additional AI Models**: Configure different OpenAI models

### Styling
- Built with Tailwind CSS and Shadcn UI
- Dark/light mode support
- Fully responsive design

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Docker
```bash
# Build and run with Docker
docker build -t mini-perplexity .
docker run -d -p 3000:3000 \
  -e GEMINI_API_KEY=your_gemini_api_key \
  -e NEXTAUTH_SECRET=your_secret \
  mini-perplexity

# Or use Docker Compose
docker-compose up -d --build

# Or use the provided scripts
./build-and-run.sh  # Linux/Mac
build-and-run.bat   # Windows
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify your API keys are correctly set
3. Ensure all dependencies are installed
4. Open an issue on GitHub

---

Built with ❤️ using Next.js and Google Gemini AI
