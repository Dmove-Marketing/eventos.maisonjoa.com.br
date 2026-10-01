# Maison Joá · Landing page de eventos corporativos

Projeto **Astro** (site estático) com uma única página: a landing page corporativa da Maison Joá.
Pronto para instalar, configurar e publicar no domínio do cliente.

## Rodar e publicar

Requer **Node 22.12+**.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # gera o site estático em dist/
npm run preview    # serve o dist/ localmente para conferir
```

Para publicar, envie o conteúdo de `dist/` para a raiz do domínio (qualquer hospedagem estática: Vercel, Netlify, Cloudflare Pages, servidor com Nginx/Apache etc.).

Defina o domínio no build, para a URL canônica e a imagem de compartilhamento saírem com o endereço completo:

```bash
SITE_URL=https://www.dominiodocliente.com.br npm run build
```

(ou preencha `site` em `astro.config.mjs`).

## ⚠️ Configurar antes de publicar

Tudo fica em **`config.json`**:

| Campo | O que é | Situação |
|---|---|---|
| `forms["lead-form"].webhooks[0]` | URL que recebe os leads do formulário (POST JSON) | **Vazio: o formulário não envia nada até ser preenchido** |
| `forms["lead-form"].redirect_on_success` | Página de obrigado (opcional). Vazio = mostra mensagem de sucesso no próprio formulário | Vazio |
| `tracking.gtm_id` | ID do Google Tag Manager do cliente (ex.: `GTM-XXXXXXX`) | **Vazio: sem GTM até ser preenchido** |
| `project_slug` | Identificador enviado junto com cada lead | `maison-joa` |

Campos enviados pelo formulário: `Nome`, `Empresa`, `Telefone`, `E-mail`, `Data do evento`, `Número de pessoas`, além dos dados de rastreamento (UTMs, gclid, fbclid, página de origem etc.), capturados automaticamente.

## Estrutura

```
config.json                      → webhook, GTM, slug (ver tabela acima)
astro.config.mjs                 → domínio (site / SITE_URL)
public/                          → favicons e og-image.jpg (imagem de compartilhamento)
src/pages/index.astro            → a página (textos, listas de fotos, logos, SEO/JSON-LD)
src/styles/maison-joa-corporativo.css  → todo o visual da página (paleta nos tokens do :root)
src/scripts/maison-joa-corporativo.js  → carrosséis, setas, galeria em tela cheia
src/layouts/Base.astro           → <head>, SEO, GTM, captura de UTMs
src/components/                  → formulário (LeadForm), mapa (StaticMap), imagem otimizada (Img), rastreamento
src/assets/images/maison-joa-corporativo/  → todas as imagens (otimizadas no build para WebP)
```

### Onde mexer no dia a dia

- **Textos:** direto no `src/pages/index.astro`.
- **Fotos das galerias** (Ambientes, Eventos, Soluções): listas `ambientesBase`, `eventosBase` e `gastronomia` no topo do `index.astro`. Nos mosaicos, `size` define o formato (`big` 2×2, `wide` 2×1, `tall` 1×2, `''` 1×1); a ordem foi escolhida para fechar a grade de 4 colunas sem buracos.
- **Logos de clientes:** lista `clientes` no `index.astro`. Os arquivos estão em `clientes/`, já em bronze monocromático. O campo `h` é a altura de cada logo, ajustada pela proporção para equilibrar o peso visual.
- **Cores:** tokens no início do CSS (`--creme`, `--bronze`, `--cafe`…).
- **Fontes:** Cormorant Garamond (títulos) e Jost (texto), via Google Fonts.

## Pendências de conteúdo (com o cliente)

1. **Webhook e GTM** do cliente (ver tabela acima).
2. **Imagens geradas por IA** (para ilustrar; o ideal é trocar por fotos reais quando houver):
   - `hero-varanda-sunset.png` (hero e fundo do bloco de orçamento)
   - `conceito-escadaria-entrada.png` (seção 2)
   - `parallax-varanda-entardecer.png` (faixa parallax)
   - `ambientes/ambiente-01.jpg`, `ambiente-14.jpg` e `ambiente-17.jpg`
   - `solucoes/`: todas, exceto `solucoes-04-painel-led.jpg`, que é foto real
3. **Logos de clientes:** confirmar a autorização para exibir as marcas. Dois nomes da lista ainda não entraram: *Luciano Huck* (pessoa, não tem logo) e *Medihealth* (empresa a confirmar).
4. **Créditos de fotografia:** algumas fotos têm marca d'água de fotógrafo: *@wrfotografia* (galeria de eventos) e *Ana Perre Fotografia* (galeria de ambientes). Confirmar o direito de uso.
5. **Política de privacidade:** o formulário diz "Ao enviar, você concorda com nossa política de privacidade". Se o cliente tiver a página, vale linkar.

## Observações técnicas

- **SEO:** a página sai indexável (sem `noindex`), com título, descrição, URL canônica, og:image e dados estruturados `EventVenue` (endereço e capacidade) em JSON-LD.
- **Mapa:** embed do Google Maps (sem chave de API), com cliques bloqueados para o visitante não sair da página antes de preencher o formulário.
- **Carrosséis de Soluções e Clientes:** giro contínuo controlado por JS, com setas, deslize no celular e pausa ao passar o mouse. Respeitam `prefers-reduced-motion`: ficam parados, mas as setas continuam funcionando.
- **Imagens:** os originais ficam em `src/assets`, e o Astro gera WebP otimizado no build.
