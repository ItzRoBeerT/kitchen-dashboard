import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react()],
  output: 'server',
  adapter: vercel({
    analytics: true,
    includeFiles: ['.env.example'],
    functionPerRoute: false // Important: Use a single function for all routes
  }),
  vite: {
    build: {
      minify: true,
    },
    ssr: {
      noExternal: ['react-icons']
    }
  }
});