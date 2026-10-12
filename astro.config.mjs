import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];

export default defineConfig({
  integrations: [react()],
  base: process.env.GITHUB_ACTIONS && repository ? `/${repository}` : '/',
});
