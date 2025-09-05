# Know My Rights AI

**Your pocket guide to legal empowerment**

A mobile-first web application providing instant, state-specific legal guidance and documentation tools for interactions with law enforcement.

![Know My Rights AI](https://via.placeholder.com/800x400/667eea/ffffff?text=Know+My+Rights+AI)

## 🌟 Features

### Core Features
- **State-Specific Rights Cards**: Auto-generated legal guidance based on user location
- **Legal Scripts & Translations**: Ready-to-use scripts in English and Spanish
- **Incident Documentation**: Secure audio/video recording with IPFS storage
- **Shareable Legal Summaries**: Easy-to-share digital cards for community awareness

### Premium Features (Pro Tier)
- Unlimited incident recording
- IPFS decentralized storage
- Multi-language support
- Advanced legal scripts
- Priority support

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom glass morphism design
- **State Management**: Zustand with persistence
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI Integration**: OpenAI GPT-4 for content generation
- **Storage**: Pinata IPFS for decentralized file storage
- **Payments**: Stripe for subscription management
- **Internationalization**: React i18next
- **Location Services**: Browser Geolocation + IP-based fallback

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- OpenAI API key
- Pinata IPFS account (for file storage)
- Stripe account (for payments)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/vistara-apps/this-is-a-4721.git
cd this-is-a-4721
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your actual API keys:

```env
# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_BASE_URL=https://api.openai.com/v1

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Pinata IPFS Configuration
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
VITE_PINATA_JWT=your_pinata_jwt_token

# App Configuration
VITE_APP_NAME=Know My Rights AI
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
```

### 4. Database Setup

#### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the schema file:

```bash
# Copy the contents of supabase/schema.sql and run it in Supabase SQL Editor
```

Or use the Supabase CLI:

```bash
npx supabase db reset
```

#### Enable Authentication

1. Go to Authentication > Settings in your Supabase dashboard
2. Enable email authentication
3. Configure your site URL and redirect URLs

### 5. API Keys Setup

#### OpenAI API Key
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your `.env` file

#### Pinata IPFS Setup
1. Create account at [Pinata](https://pinata.cloud)
2. Generate API keys and JWT token
3. Add them to your `.env` file

#### Stripe Setup
1. Create account at [Stripe](https://stripe.com)
2. Get your publishable key from the dashboard
3. Create a product and price for the Pro subscription
4. Add the publishable key to your `.env` file

### 6. Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── AppShell.tsx    # Main app layout
│   ├── RightsCard.tsx  # Rights information display
│   ├── RecordButton.tsx # Recording functionality
│   ├── ScriptsSection.tsx # Legal scripts
│   └── ...
├── services/           # API services
│   └── api.ts         # Main API functions
├── lib/               # Utilities and configurations
│   └── supabase.ts    # Supabase client
├── store/             # State management
│   └── index.ts       # Zustand store
├── types/             # TypeScript type definitions
│   ├── index.ts       # Main types
│   └── database.ts    # Database types
├── i18n/              # Internationalization
│   └── index.ts       # Translation configuration
├── config/            # App configuration
│   └── index.ts       # Environment config
└── App.tsx            # Main app component
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Netlify Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to [Netlify](https://netlify.com)
3. Add environment variables in Netlify dashboard

### Docker Deployment

```bash
# Build the Docker image
docker build -t know-my-rights-ai .

# Run the container
docker run -p 3000:3000 know-my-rights-ai
```

## 🔧 Configuration

### Feature Flags

You can enable/disable features in `src/config/index.ts`:

```typescript
features: {
  enableRecording: true,
  enableIPFSStorage: true,
  enableMultiLanguage: true,
  enableGeolocation: true,
  enableStripePayments: true,
  enableAnalytics: false
}
```

### Supported States

The application supports all 50 US states plus DC. You can modify the list in `src/config/index.ts`.

### Languages

Currently supported languages:
- English (en)
- Spanish (es)

Add more languages by extending the translation files in `src/i18n/`.

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📱 Mobile Support

The application is mobile-first and includes:
- Responsive design for all screen sizes
- Touch-friendly interface
- Mobile camera/microphone access
- Offline capability (service worker)
- PWA support

## 🔒 Security Features

- Row Level Security (RLS) in Supabase
- Encrypted file storage on IPFS
- Secure authentication with Supabase Auth
- Input validation and sanitization
- HTTPS enforcement
- Content Security Policy (CSP)

## 🎨 Customization

### Styling

The app uses Tailwind CSS with custom design tokens. Modify `tailwind.config.js` and `src/index.css` for styling changes.

### Branding

Update the following files for branding:
- `index.html` (title, meta tags)
- `src/config/index.ts` (app name, version)
- `public/` (icons, manifest)

## 📊 Analytics

The app includes usage analytics tracking:
- Rights card generations
- Recording events
- Subscription changes
- Feature usage

Analytics data is stored in Supabase and can be viewed in the dashboard.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and request features via GitHub Issues
- **Community**: Join our Discord server for community support

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core rights card generation
- ✅ Basic recording functionality
- ✅ Multi-language support
- ✅ Subscription system

### Phase 2 (Next)
- [ ] Advanced AI legal analysis
- [ ] Community-contributed content
- [ ] Mobile app (React Native)
- [ ] Integration with legal aid organizations

### Phase 3 (Future)
- [ ] Real-time legal updates
- [ ] AI-powered legal chatbot
- [ ] Blockchain-based evidence verification
- [ ] International law support

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Supabase for backend infrastructure
- Pinata for IPFS storage
- Tailwind CSS for styling framework
- React team for the amazing framework

---

**⚖️ Legal Disclaimer**: This application provides general legal information and should not be considered as legal advice. Always consult with a qualified attorney for specific legal matters.

**🔒 Privacy**: We take privacy seriously. All recordings are encrypted and stored securely. See our Privacy Policy for details.

**📞 Emergency**: This app is not a substitute for emergency services. In case of emergency, call 911 immediately.
