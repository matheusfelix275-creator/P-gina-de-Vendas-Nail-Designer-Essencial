# Relatório de QA — versão 1.0

Data: 22 de julho de 2026.

## Resultado

- Build Vite concluído sem erros.
- 66 verificações automatizadas aprovadas.
- Nenhum recurso ausente no pacote de produção.
- Nenhum placeholder de template não resolvido.

## Comportamentos verificados

- Seis CTAs conectados ao mesmo checkout configurável.
- CTA bloqueado com aviso quando a URL da Kiwify ainda está vazia.
- Aceite apenas de URL HTTPS pertencente ao domínio Kiwify.
- Preservação de UTMs e parâmetros de atribuição.
- Dados públicos centralizados em `config.js`.
- Política de Privacidade e Termos de Uso incluídos no build.
- Fontes, logotipo, mockups, modelos e oito pranchas presentes.
- Breakpoint para visualização móvel presente.
- Preço de R$ 49,90 consistente.
- Ausência de depoimentos, urgência ou escassez fabricados.
- Página não utiliza rastreamento publicitário.

## Verificação final antes de publicar

Após preencher `config.js`, faça um teste manual em celular e desktop, abra o checkout, confirme os parâmetros na URL e revise os textos legais com orientação adequada à operação do produtor.

