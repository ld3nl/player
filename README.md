# Paul Lowe Talks Web Application

This is a modern, scalable web application built using **Next.js** and **React 18**, designed to fetch and display audio posts with features like category filtering, favorites, and search. The application leverages **server-side rendering (SSR)** and advanced **client-side state management** using React hooks for an enhanced user experience.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Key Features](#key-features)
4. [Best Practices](#best-practices)
5. [Tooling and Scripts](#tooling-and-scripts)
6. [Environment Variables](#environment-variables)
7. [Performance Optimizations](#performance-optimizations)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Learn More](#learn-more)

## Getting Started

First, clone the repository and install dependencies:

```bash
git clone https://github.com/your-repo/paul-lowe-talks.git
cd paul-lowe-talks
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

You can also format the codebase using Prettier:

```bash
npx prettier --write .
```

## Project Structure

The project is organized with a clear, scalable architecture:

- **/pages**: Next.js page-level components and routing. Handles SSR and static site generation.
- **/components**: Reusable UI components such as `Header`, `AudioListing`, and `MainPlayer`.
- **/lib**: Core logic including utilities, custom hooks, and server-side functions.
  - **/hooks**: Custom hooks like `useFilteredPosts` for state and logic handling.
  - **/server**: Server-side functions like `fetchPosts` for data fetching.
- **/styles**: Global and component-specific styles.
- **/services**: External API logic and data fetching services.
- **/constants**: Application-wide constants like `ROOT_CATEGORY_ID` and default modal states.
- **/types**: TypeScript type definitions for maintaining strong typing throughout the app.

## Key Features

- **Audio Listings**: Fetches and displays audio posts with support for multiple categories.
- **Filtering and Search**: Filter posts by categories, favorites, and custom search terms using debounced input.
- **Favorites Management**: Toggle and store favorite posts using client-side state.
- **Lazy Loading**: Utilizes React's `Suspense` and `lazy` for performance optimization, especially for media components.
- **Client-Side Media State**: Custom hooks manage playback states (e.g., played time, favorites) for seamless user interaction.
- **Server-Side Rendering (SSR)**: Efficient data fetching and rendering with SSR for improved SEO and faster load times.
- **Caching**: Implements an LRU cache to reduce redundant server requests and boost performance.

## Best Practices

- **Atomic Design**: Components are structured following Atomic Design principles, ensuring scalability and reusability.
- **React 18 Concurrent Features**: Uses `useTransition` and `Suspense` for smooth state transitions and lazy loading.
- **TypeScript First**: The project is fully typed with TypeScript, ensuring type safety and better developer experience.
- **ESLint & Prettier**: Enforces coding standards and consistent formatting across the codebase.
- **Error Boundaries**: Handles errors gracefully during rendering, with clear fallbacks for better user experience.

## Tooling and Scripts

- **Prettier**: Ensures consistent code formatting.

  Run Prettier:

  ```bash
  npx prettier --write .
  ```

- **ESLint**: Enforces linting rules to detect errors and maintain code quality.

  Run ESLint:

  ```bash
  npm run lint
  ```

- **TypeScript**: The project is fully typed with TypeScript for type safety.

  To check TypeScript types:

  ```bash
  npm run type-check
  ```

## Environment Variables

The app relies on certain environment variables for configuration. These are stored in a `.env.local` file.

Example `.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

## Performance Optimizations

- **Lazy Loading**: Key components such as the media player and icons are lazily loaded to improve performance.
- **Debouncing**: Search functionality is debounced to reduce excessive filtering and improve user experience.
- **LRU Caching**: Server-side API responses are cached using an LRU cache to reduce server load and improve response times.
- **Code Splitting**: Uses dynamic imports and code splitting to minimize the bundle size and load only what’s needed.

## Testing

- **Unit Testing**: The app is tested using Jest and React Testing Library to ensure that components behave as expected.

  To run tests:

  ```bash
  npm run test
  ```

- **Integration Testing**: Tests ensure that components interact properly and the app functions as a whole.

## Deployment

This application is ready to be deployed on [Vercel](https://vercel.com/), which is ideal for Next.js applications.

To deploy on Vercel:

1. Push your code to a repository (e.g., GitHub).
2. Sign up for Vercel and create a new project.
3. Link your repository and deploy.

For detailed instructions, see the [Next.js Deployment Documentation](https://nextjs.org/docs/deployment).

## Learn More

To learn more about the tools and technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [React 18 Documentation](https://reactjs.org/docs/18-upgrade-guide.html)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)
