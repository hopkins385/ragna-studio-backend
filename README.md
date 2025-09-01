# RAGNA Studio Backend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)

RAGNA Studio Backend is an open-source AI-powered API backend built with NestJS, featuring Retrieval-Augmented Generation (RAG), Named Entity Recognition (NER), and multi-provider AI integrations. This project provides a robust foundation for building AI applications with document processing, chat interfaces, and intelligent assistants.

## ⚠️ Important Notes

- **Not a Turnkey Solution**: This API Server is part of a larger ecosystem and requires additional microservices to function fully
- **Not Production Ready**: This software is provided for educational and development purposes
- **API Keys Required**: You'll need API keys from AI providers to use AI features
- **Resource Intensive**: AI operations require significant computational resources

## 🏗️ RAGNA Studio Ecosystem

This backend is part of the complete RAGNA Studio platform:

- **[RAGNA Studio Backend](https://github.com/hopkins385/ragna-studio-backend)** (this repository) - NestJs API backend
- **[RAGNA Studio Frontend](https://github.com/hopkins385/ragna-studio-frontend)** - Modern Vue3-based user interface
- **[RAGNA SDK](https://github.com/hopkins385/ragna-sdk)** - TypeScript SDK for easy integration into your own software

### Microservices

- **RAG Server**: Handles document parsing and embedding generation
- **NER Server**: Performs Named Entity Recognition on text data
- **WebSocket Gateway**: Manages real-time communication for chat features
- **WebScraper Server**: Fetches and processes web content

For the full experience, you'll want to set up both the backend, the frontend and all the microservices. The SDK provides a convenient way to integrate RAGNA Studio's AI capabilities into your own applications with type-safe API calls and built-in error handling.

## 🌟 Features

### **Core Architecture**

- **NestJS Framework**: Efficient, scalable, and high-performance async API endpoints
- **Modular Design**: Maintainable architecture that scales with your needs
- **TypeScript**: Full type safety throughout the codebase
- **Prisma ORM**: Type-safe database interactions with PostgreSQL
- **Redis Integration**: Caching and session management
- **BullMQ**: Background job processing for heavy operations
- **WebSocket Support**: Real-time communication capabilities
- **OpenAPI Documentation**: Auto-generated API documentation

### **AI & ML Capabilities**

- **RAG (Retrieval-Augmented Generation)**: Advanced document retrieval and generation
- **Multi-Provider AI Support**: OpenAI, Anthropic, Google, Mistral, and more
- **Named Entity Recognition (NER)**: Extract and process entities from text
- **Document Processing**: Support for various file formats (PDF, DOCX, etc.)
- **Embedding Generation**: Vector embeddings for semantic search
- **Chat Interfaces**: Real-time chat with AI assistants

### **Security & Performance**

- **Role-Based Access Control (RBAC)**: Granular permission management
- **JWT Authentication**: Secure token-based authentication with rotation
- **Session Management**: Secure user session handling
- **Input Sanitization**: Protection against malicious inputs
- **CORS Configuration**: Cross-origin resource sharing controls
- **Rate Limiting**: API abuse protection
- **Comprehensive Logging**: Structured logging with debug traces

### **Developer Experience**

- **Clean Architecture**: Object-oriented design with dependency injection
- **Separation of Concerns**: Modular code organization
- **TypeScript SDK**: Pre-built, type-safe API client
- **Code Quality Tools**: Prettier, ESLint, and comprehensive testing
- **Environment Configuration**: Easy setup for different environments
- **Docker Support**: Containerized development and deployment

## 🚀 Quick Start

### Prerequisites

- **Node.js** 22+ and npm/yarn
- **Docker & Docker Compose** (recommended for development)
- **PostgreSQL** 17+ (if not using Docker)
- **Redis** 7+ (if not using Docker)
- **Minimum 8GB RAM** (for AI model operations)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/hopkins385/ragna-studio-backend.git
   cd ragna-studio-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit the .env file with your configuration
   nano .env
   ```

4. **Database Setup**

   ```bash
   # Start PostgreSQL and Redis with Docker
   docker-compose up -d postgres redis

   # Run database migrations
   npm run migrate

   # Seed the database (optional)
   npm run seed:init
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```

### Docker Development

For a complete development environment with all services:

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Or run in detached mode
docker-compose -f docker-compose.dev.yml up -d
```

## 📖 Documentation

- **API Documentation**: Available at `/swagger` when running the server (dev-only)
- **Database Schema**: Check `prisma/schema.prisma` for the complete data model
- **Environment Variables**: See `.env.example` for all configuration options

## 🛠️ Development

### Project Structure

```
src/
├── modules/           # Feature modules (auth, chat, documents, etc.)
├── common/           # Shared utilities, guards, decorators
├── config/           # Configuration files
└── filter/           # Exception filters

prisma/
├── schema.prisma     # Database schema
├── migrations/       # Database migrations
└── seed/            # Database seeders
```

### Key Modules

- **Auth**: User authentication and authorization
- **Chat**: Real-time chat functionality with AI assistants
- **AI Models**: Integration with various AI providers
- **Assistants**: Configurable AI assistants with tools
- **Collections**: Document collections and knowledge bases

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Database ORM by [Prisma](https://www.prisma.io/)
- AI integrations powered by [Vercel AI SDK](https://sdk.vercel.ai/)
- And many other amazing open-source projects

---

<div align="center">
  <p>Built with ❤️ and Appreciation by Sven Stadhouders</p>
  <p>
    <a href="https://ragna-engineering.de">Website</a> •
    <a href="https://github.com/hopkins385/ragna-studio-frontend">GitHub</a>
  </p>
</div>
