# Kit Nail Designer Essencial — regras do projeto

## Objetivo

Esta é uma landing page estática em português do Brasil para vender um produto digital de R$ 49,90 com checkout da Kiwify.

## Comandos

- Instalar: `npm install`
- Desenvolvimento: `npm run dev`
- Build de produção: `npm run build`
- Prévia do build: `npm run preview`

Sempre execute `npm run build` depois de alterações em HTML, JavaScript, configuração ou ativos.

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

## Identidade visual

- Marfim: `#F6F1EA`
- Vinho: `#68283E`
- Rosa queimado: `#C98F91`
- Azul editorial: `#B8CDE0`
- Grafite: `#242124`
- Títulos: Fraunces
- Texto: Manrope

