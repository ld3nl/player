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
9. [Component Library and Storybook](#component-library-and-storybook)
10. [Future Enhancements](#future-enhancements)
11. [Deployment](#deployment)
12. [Learn More](#learn-more)

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

Currently, the project has no tests, but future enhancements will include **Cypress** for both **end-to-end (e2e)** and **component testing**, as well as **Storybook** for interactive component development and testing.

### Adding Cypress

To install and set up **Cypress** for both e2e and component testing:

1. Install Cypress:

   ```bash
   npm install cypress --save-dev
   ```

2. Add Cypress scripts to `package.json`:

   ```json
   "scripts": {
     "cypress:open": "cypress open",
     "cypress:run": "cypress run"
   }
   ```

3. Configure Cypress for both e2e and component tests in `cypress.config.ts`:

   ```ts
   import { defineConfig } from 'cypress';

   export default defineConfig({
     e2e: {
       baseUrl: 'http://localhost:3000',
     },
     component: {
       devServer: {
         framework: 'next',
         bundler: 'webpack',
       },
     },
   });
   ```

4. You can then run the tests with:

   ```bash
   npm run cypress:open
   ```

### Adding Storybook

**Storybook** is a great tool for developing and testing UI components in isolation.

1. Install Storybook:

   ```bash
   npx sb init
   ```

2. Start Storybook:

   ```bash
   npm run storybook
   ```

3. Configure Storybook for Next.js and React by installing the necessary addons.

4. You can write stories for each component in `*.stories.tsx` files.

## Component Library and Storybook

The app can be extended with **Storybook** for component-driven development. With **Storybook**, you can isolate each component for individual testing, allowing easy migration to **React 19** in the future.

You can set up stories for all UI components like `Button`, `Icon`, and `AudioListing`, ensuring they are independently testable and compatible with future versions of React.

To learn more about Storybook and how to write stories, visit the [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction).

## Future Enhancements

### Cypress for End-to-End (e2e) and Component Testing

- **e2e Testing**: Simulate real user interactions by running end-to-end tests that navigate through the app, ensuring functionality works across different pages.
- **Component Testing**: Test each component in isolation, ensuring each UI element works as expected before integrating into the full app.

### Storybook for Component Development

- **Isolated Component Testing**: Develop and test individual components in isolation using **Storybook**, ensuring they behave as expected before integrating them into the main app.
- **UI Documentation**: Use Storybook as an interactive library for your UI components, enabling a smooth transition to **React 19**.

### React 19 Migration

When migrating to **React 19**, having Cypress and Storybook in place will help ensure all components and pages are still working correctly. Components and hooks using React 18’s concurrent features like `useTransition` will benefit from any performance and feature improvements in React 19.

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
- [Cypress Documentation](https://docs.cypress.io/)
- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction)
- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)
