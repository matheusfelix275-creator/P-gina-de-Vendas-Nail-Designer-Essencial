# Guia de direção — página de vendas no OpenCode

## O que já está pronto

- Landing page completa e responsiva do Kit Nail Designer Essencial.
- Preço fixado em R$ 49,90.
- Identidade Editorial Confiante aplicada.
- Materiais reais do produto na página.
- Integração preparada para checkout Kiwify.
- Preservação de UTMs, `src`, `sck`, `s1`, `s2` e `s3` no clique.
- Política de Privacidade e Termos de Uso.
- Build de produção na pasta `dist/`.

## Como abrir

No terminal, entre nesta pasta e rode:

```bash
npm install
npm run dev
```

Em outro terminal, dentro da mesma pasta:

```bash
opencode
```

O OpenCode lerá automaticamente as regras de `AGENTS.md` e as instruções de `opencode.json`.

## Primeiro pedido recomendado

```text
Leia AGENTS.md, README.md e GUIA_OPENCODE.md. Não altere arquivos ainda. Explique a arquitetura da página, confirme os dados públicos ainda pendentes em config.js e apresente um plano curto para a mudança que eu solicitar.
```

## Fluxo de aprovação

1. Você descreve a mudança desejada.
2. O OpenCode informa quais arquivos pretende alterar.
3. Você aprova o escopo.
4. O OpenCode implementa e executa `npm run build`.
5. Você confere desktop, celular, textos e checkout.
6. Somente então a versão é publicada.

## Dados que devem ser preenchidos

Edite somente `config.js` para informar:

- URL pública do checkout da Kiwify;
- nome público do produtor;
- e-mail de suporte.

Os demais dados (preço, ID do produto, moeda) são fixos no código.

Nunca envie ao OpenCode senha, token bancário, acesso da Kiwify ou outra credencial. A integração usa apenas URLs e identificadores públicos.

## Pedidos seguros para evolução

### Revisar uma seção

```text
Revise a seção [nome]. Preserve a oferta, o preço de R$ 49,90 e os materiais reais. Primeiro proponha até três melhorias e aguarde minha escolha antes de editar.
```

### Ajustar celular

```text
Revise a página entre 360 px e 430 px. Corrija apenas problemas de legibilidade, espaçamento, quebra de texto, imagens e barra fixa. Não altere a copy nem a integração.
```

### Configurar dados públicos

```text
Preencha config.js com os dados públicos que fornecerei. Não copie senhas, tokens ou credenciais. Depois execute npm run build e verifique se os CTAs preservam UTMs.
```

### Preparar publicação

```text
Execute o checklist do README.md. Não publique. Liste separadamente itens aprovados, pendências e qualquer dado que ainda impeça a publicação.
```

## Regra de ouro

O OpenCode edita e testa o projeto; ele não substitui o checkout nem a hospedagem. A compra continua na Kiwify, e a pasta `dist/` é a versão pronta para hospedagem.

