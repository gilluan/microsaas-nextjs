# MicroSaaS Platform

A modern MicroSaaS platform built with Next.js 14, AWS Amplify Gen 2, and cutting-edge web technologies.

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, React 18
- **Backend**: AWS Amplify Gen 2 with GraphQL API
- **Authentication**: Amazon Cognito
- **UI Components**: ShadcnUI with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: Zustand with persistence
- **Validation**: Zod for runtime type checking
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- AWS CLI configured (for Amplify deployment)

### Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Amplify Development

1. Start the Amplify sandbox:
   ```bash
   npm run amplify:dev
   ```

2. Deploy to AWS:
   ```bash
   npm run amplify:deploy
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run amplify:dev` - Start Amplify sandbox
- `npm run amplify:build` - Generate Amplify artifacts
- `npm run amplify:deploy` - Deploy to AWS

## Project Structure

```
├── amplify/                 # Amplify backend configuration
│   ├── auth/               # Authentication resources
│   ├── data/               # GraphQL schema and resolvers
│   └── backend.ts          # Backend configuration
├── src/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # Reusable React components
│   ├── lib/                # Utility functions and configurations
│   │   ├── stores/         # Zustand stores
│   │   ├── schemas/        # Zod validation schemas
│   │   └── utils.ts        # Utility functions
│   └── styles/             # Global styles
└── amplify_outputs.json    # Amplify configuration output
```

## Features

- ✅ Next.js 14 with App Router and TypeScript
- ✅ AWS Amplify Gen 2 backend
- ✅ Type-safe GraphQL with code generation
- ✅ Authentication with Amazon Cognito
- ✅ Modern UI with ShadcnUI components
- ✅ State management with Zustand
- ✅ Form validation with Zod
- ✅ Responsive design with Tailwind CSS
- ✅ Dark/light mode support
- ✅ Production-ready build configuration

## Development Notes

- The project uses TypeScript strict mode for enhanced type safety
- ESLint and Prettier are configured for code quality
- Tailwind CSS is configured with CSS variables for easy theming
- Amplify backend is configured with placeholder values for initial setup