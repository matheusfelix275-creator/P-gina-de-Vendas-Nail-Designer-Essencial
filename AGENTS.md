# Kit Nail Designer Essencial — regras do projeto

## Objetivo

Esta é uma landing page estática em português do Brasil para vender um produto digital de R$ 49,90 com checkout da Kiwify.

## Comandos

- Instalar: `npm install`
- Desenvolvimento: `npm run dev`
- Build de produção: `npm run build`
- Prévia do build: `npm run preview`

Sempre execute `npm run build` depois de alterações em HTML, JavaScript, configuração ou ativos.

O build inclui validação automática de placeholders via `scripts/validate-public-content.mjs`.

## Estrutura da página

Ordem das seções:

1. **Hero** — primeira dobra fixa (eyebrow, headline, 3 benefícios, preço, CTA)
2. **Trust bar** — 4 itens de confiança (Kiwify, digital, e-mail, cancelamento)
3. **Problem** — 3 cards contexto/problema (título + texto + "Como o kit ajuda")
4. **Transformation** — 4 etapas numeradas (praticar, montar catálogo, apresentar, organizar)
5. **Content blocks** — 4 blocos alternados (prática, referências, apresentação, organização)
6. **Collections** — grid 4x2 das 8 coleções com lightbox
7. **Spreadsheets** — 2 planilhas reais (calculadora de preços + controle de serviços)
8. **Applications** — 5 aplicações dos modelos
9. **Mid-CTA** — card centralizado entre seções
10. **Offline** — central offline (página HTML local)
11. **Audience** — é/não é para quem
12. **Formats** — chips de formato + licença
13. **Purchase security** — 4 etapas pós-pagamento
15. **Guarantee** — prazo de 7 dias para avaliar
16. **FAQ** — perguntas frequentes com accordion
17. **Checkout** — card final com preço e CTA
18. **Footer** — 4 grupos (Produto, Compra, Atendimento, Identificação)

## Fonte oficial

- A página principal está em `index.html`.
- Configurações públicas ficam somente em `config.js`.
- Comportamento e UTMs ficam em `app.js`.
- Páginas jurídicas usam `legal.css` e `legal.js`.
- Imagens e fontes reais ficam em `assets/`.

## Regras de negócio

- Manter o preço em R$ 49,90 em toda a página.
- Não incluir promessas de renda, clientes ou resultado garantido.
- Não criar depoimentos, escassez, cronômetros ou urgência falsa.
- Não substituir os materiais reais por mockups genéricos.
- Todos os CTAs devem usar `data-checkout` e preservar os parâmetros definidos em `app.js`.
- Não inserir chaves secretas, senhas ou tokens no projeto.
- A página não utiliza rastreamento publicitário ou banner de cookies.
- Manter navegação por teclado, foco visível, contraste e textos alternativos.
- Não publicar com campos obrigatórios vazios em `config.js`.
- Jamais usar o domínio `suportt.com` ou o e-mail `naildesigner@suportt.com` — é um endereço fictício não verificado. Até que um e-mail real seja configurado, `supportEmail` deve permanecer vazio (`""`).

## Identidade visual

- Marfim: `#F6F1EA`
- Vinho: `#68283E`
- Rosa queimado: `#C98F91`
- Azul editorial: `#B8CDE0`
- Grafite: `#242124`
- Títulos: Fraunces
- Texto: Manrope

