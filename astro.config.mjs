import { defineConfig } from 'astro/config';

export default defineConfig({
  // Domínio final do site (ex.: https://www.maisonjoa.com.br).
  // Usado para a URL canônica e a imagem de compartilhamento (og:image).
  // Pode ser definido aqui ou pela variável de ambiente SITE_URL no build.
  site: process.env.SITE_URL || 'https://eventos.maisonjoa.com.br',

  output: 'static',
  prefetch: true,
  build: {
    inlineStylesheets: 'auto',
  },
  server: {
    port: 4321,
  },
});
