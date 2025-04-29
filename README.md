# HonorPC Playground

A TypeScript-based playground project demonstrating Hono framework usage with client-server architecture.

## Tech Stack

- TypeScript
- Hono (Web Framework)
- Zod (Schema Validation)
- Node.js
- pnpm (Package Manager)

## Project Structure

```
.
├── src/
│   ├── server.ts    # Server implementation with Hono
│   ├── client.ts    # Client implementation
│   └── routes.ts    # Route definitions
├── package.json
├── tsconfig.json
└── pnpm-lock.yaml
```

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm dev:server
```

3. Run the client:
```bash
pnpm run:client
```

## Features

- Type-safe API endpoints using Hono and Zod
- Error handling middleware
- Client-server communication with type inference
- RESTful API endpoints
- Zod validation with detailed error messages

## API Endpoints

### Posts
- `GET /posts?id={id}` - Get a post by ID
  - Returns 200 with post data if found
  - Returns 404 if not found

### Validation
- `GET /validate?age={age}&email={email}` - Test Zod validation
  - Validates age (18-100) and email format
  - Returns 200 with validated data if successful
  - Returns 500 with validation error details if validation fails

## Error Handling

The project demonstrates error handling for:
- 404 Not Found errors
- Zod validation errors
- General server errors

All errors are returned with appropriate status codes and error messages.

## License

ISC License - See [LICENSE](LICENSE) for details.
