// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react()],
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true },
    includeFiles: [
      './src/assets/astro.svg',
      './src/assets/background.svg'
    ],
    isr: {
      // Habilitar ISR (Incremental Static Regeneration) para mejor rendimiento
      expiration: 60 // 60 segundos
    }
  }),
});
