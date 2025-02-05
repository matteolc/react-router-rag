# React Router RAG

A Retrieval Augmented Generation (RAG) application built with React Router and modern AI capabilities.

## Features

- 📦 Upload documents to Vercel Blob Storage, with the option to keep the files or delete them after processing
- 📦 Document processing pipeline (PDF/text)
- 🔍 Semantic search with vector embeddings
- 📝 AI-powered summarization & metadata extraction
- 📊 Token usage tracking & analytics
- 🔒 Secure authentication with Supabase
- 🎨 TailwindCSS with shadcn/ui components
- 📈 Built-in usage statistics dashboard

## Getting Started

### Prerequisites
- Node.js v20+
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository

```bash
git clone https://github.com/your-username/react-router-rag.git
```

2. Install dependencies

```bash
npm run bootstrap
```

3. Set up environment variables, create a `.env` file in the root directory:

```bash
cp .env.example .env
```

4. Start the development server

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000` to see the application in action.

## Project Structure

The project is organized into the following directories:

```
app/
├── components/ # Reusable React components.
├── hooks/ # Custom React hooks.
├── prompts/ # Custom prompts for the AI.
├── services/ # AI processing services.
├── lib/ # Utility functions and helpers.
├── types/ # TypeScript type definitions.
├── utils/ # Utility functions.
supabase/ # Supabase configuration and migrations.
├── migrations/ # Supabase migrations.
├── seed.sql # Supabase seed data.
├── config.toml # Supabase config.
```

## Environment Variables

The project uses the following environment variables:

| Variable           | Description                     |
|--------------------|---------------------------------|
| `SUPABASE_URL`     | Supabase project URL            |
| `SUPABASE_KEY`     | Supabase service role key       |
| `OPENAI_API_KEY`   | OpenAI API key                  |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token |

## AI Services

The application provides three core AI capabilities:

1. **Document Summarization**
   - Processes PDF/text files
   - Generates embedding-friendly summaries
   - Preserves key technical terms

2. **Metadata Extraction**
   - Automatic document type detection
   - Entity recognition
   - Domain classification

3. **Semantic Search**
   - Vector embeddings with OpenAI
   - Context-aware retrieval
   - Conversation history integration

## Deployment

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Freact-router-rag&env=SUPABASE_URL,SUPABASE_KEY,OPENAI_API_KEY,BLOB_READ_WRITE_TOKEN&envDescription=AI%20service%20credentials)

## Contributing

1. Fork the repository
2. Create feature branch:

```bash
git checkout -b feature/my-feature
```

3. Make your changes and commit them:

```bash
git commit -m "Add my feature"
```

4. Push your changes to the branch:

```bash
git push origin feature/my-feature
```

5. Create a pull request:

```bash
git pull-request
```

Please follow the [Biome](https://biomejs.dev/) coding standards and include tests where applicable.

## Building for Production

Create a production build:

```bash
npm run build
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using React Router, Supabase, and OpenAI