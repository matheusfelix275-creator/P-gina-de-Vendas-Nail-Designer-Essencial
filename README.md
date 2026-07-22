# Página de vendas — Kit Nail Designer Essencial

Projeto estático preparado para ser editado com OpenCode e publicado em qualquer hospedagem compatível com arquivos HTML.

## 1. Preencha os dados públicos

Abra `config.js` e informe:

- `checkoutUrl`: link público `https://pay.kiwify.com.br/...`
- `producerName`: nome público exibido no rodapé
- `supportEmail`: e-mail de suporte
- `legalName`: nome completo ou razão social
- `legalDocument`: CPF ou CNPJ que será publicado
- `businessAddress`: endereço comercial publicado
- `cityState`: cidade e UF

Não coloque senhas, tokens, chaves bancárias ou credenciais neste arquivo.

## 2. Abra no computador

```bash
npm install
npm run dev
```

Abra o endereço informado pelo terminal.

## 3. Trabalhe com o OpenCode

Dentro desta pasta, execute:

```bash
opencode
```

O OpenCode encontrará `AGENTS.md` e `opencode.json`. Um bom primeiro pedido é:

```text
Revise a landing page em desktop e celular, preserve a identidade e não altere preço, oferta ou variáveis de config.js sem me explicar.
```

## 4. Gere a versão de produção

```bash
npm run build
```

A pasta `dist/` é a versão que deve ser publicada.

## 5. Checklist de publicação

- Todos os campos de `config.js` estão preenchidos.
- O checkout abre e recebe UTMs.
- Os oito conjuntos de designs carregam.
- Privacidade e termos de uso abrem.
- A página foi testada no celular.
- O build termina sem erros.
- O domínio publicado foi inserido no cadastro do produto na Kiwify.

## Arquitetura

- OpenCode: agente para editar o código.
- Vite: servidor local e build.
- Hospedagem: recebe a pasta `dist/`.
- Kiwify: checkout, pagamento e entrega.

