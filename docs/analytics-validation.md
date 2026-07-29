# Validação de Analytics — Kit Nail Designer Essencial

## Taxonomia de Eventos

| Evento | Tipo | Gatilho | Parâmetros | Observação |
|---|---|---|---|---|
| `pagevisit` | Automático | `initPinterest()` → `pintrk("page")` + `pintrk("track", "pagevisit")` | — | Disparado 1x por carga, guardado por `pinterestInitialized` |
| `view_pricing` | Visualização | IntersectionObserver (50%) sobre `.checkout__price` | `{ section_name, page_path, device_group }` | Disparado 1x; sem listener de clique |
| `view_product_contents` | Visualização | IntersectionObserver (40%) sobre `.section--content` | `{ section_name, page_path, device_group }` | Disparado 1x |
| `view_collections` | Visualização | IntersectionObserver (40%) sobre `.section--collections` | `{ section_name, page_path, device_group }` | Disparado 1x |
| `view_spreadsheets` | Visualização | IntersectionObserver (40%) sobre `.section--spreadsheets` | `{ section_name, page_path, device_group }` | Disparado 1x |
| `view_guarantee` | Visualização | IntersectionObserver (40%) sobre `.section--guarantee` | `{ section_name, page_path, device_group }` | Disparado 1x |
| `view_final_offer` | Visualização | IntersectionObserver (40%) sobre `.section--checkout` | `{ section_name, page_path, device_group }` | Disparado 1x |
| `click_primary_cta` | Clique | CTA `header` ou `hero` via listener `data-checkout` | `{ cta_location, section_name, page_path, device_group, utm_* }` | Sem listener genérico |
| `click_mid_page_cta` | Clique | CTA `mid_page` via listener `data-checkout` | `{ cta_location, section_name, page_path, device_group, utm_* }` | |
| `begin_checkout` | Clique | CTA `final_offer` via listener `data-checkout` | `{ cta_location, section_name, page_path, device_group, value, currency, product_id, product_name, source, utm_* }` | Único com dados de produto |
| `click_sticky_cta` | Clique | CTA `sticky_mobile` via listener `data-checkout` | `{ cta_location, section_name, page_path, device_group, utm_* }` | |
| `click_support_email` | Clique | Delegação em `document` sobre `[data-analytics="click_support_email"]` | — | 1 evento por clique; e-mail não enviado |
| `click_support_whatsapp` | Clique | Delegação em `document` sobre `[data-analytics="click_support_whatsapp"]` | — | 1 evento por clique; número não enviado |
| `click_terms` | Clique | Listener dedicado em `a[href*='termos-de-uso']` | — | |
| `click_privacy` | Clique | Listener dedicado em `a[href*='politica-de-privacidade']` | — | |
| `open_faq` | Clique | Listener do accordion `.faq__question` | `{ faq_id: "faq_01".."faq_08", faq_position: 1..8, page_path, device_group }` | Apenas ao abrir; fechar não dispara |

## Mapeamento de CTA — exatamente 5 externos

| `data-cta-location` | Evento | Elemento | Localização |
|---|---|---|---|
| `header` | `click_primary_cta` | `<header>` | Topo fixo |
| `hero` | `click_primary_cta` | `.hero` | Primeira dobra |
| `mid_page` | `click_mid_page_cta` | `.mid-cta__card` | Entre seções |
| `final_offer` | `begin_checkout` | `#checkout` | Card final |
| `sticky_mobile` | `click_sticky_cta` | `#mobile-sticky-cta` | Barra fixa mobile |

**Link do rodapé:** "Acessar o kit" é navegação interna (`href="#checkout"`), não possui `data-checkout`. Não é contado como CTA externo. Não dispara evento de analytics.

## Eventos não disparados na landing

- `Checkout` — pertence ao checkout da Kiwify
- `Purchase` — pertence ao checkout da Kiwify
- `AddToCart` / `addToCart` — pertence ao checkout da Kiwify
- `InitiateCheckout` — removido; consolidado em `begin_checkout`

**`begin_checkout`** é evento customizado de intenção. Não deve ser mapeado como Checkout concluído no painel do Pinterest.

## UTMs permitidas

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`

### Sanitização

- Leitura case-insensitive (ex.: `UTM_SOURCE` → `utm_source`)
- Caracteres de controle U+0000-U+001F e U+007F removidos
- `trim()` aplicado
- Máximo 200 caracteres
- Valor vazio ignorado
- Apenas primeira ocorrência é usada

### Parâmetros rejeitados

`email`, `telefone`, `phone`, `name`, `nome`, `cpf`, `src`, `sck`, `s1`, `s2`, `s3`, `analytics_debug` e qualquer parâmetro fora da whitelist.

### Cache de sessão

- Chave: `kn_campaign_utms_v1` em `sessionStorage`
- Salvo somente quando a URL atual contém pelo menos uma UTM com valor não vazio após sanitização
- UTMs vazias (`?utm_campaign=`) não salvam nem apagam o cache
- URL sem UTMs: recupera o cache da sessão
- Valores recuperados do cache passam novamente por `sanitizeUtmValue()` (controle de caracteres, trim, limite de 200 caracteres)
- `sessionStorage` indisponível: UTMs preservadas em memória apenas

### Repasse ao checkout

`buildCheckoutUrl()` usa exclusivamente `captureUtms()` como fonte. Parâmetros já existentes na `checkoutUrl` têm prioridade: uma UTM nunca substitui um parâmetro com o mesmo nome já presente na URL configurada. `analytics_debug` nunca é repassado.

## Payload dos eventos

### Chaves permitidas (`sanitizeEventPayload`)

`product_id`, `product_name`, `value`, `currency`, `page_path`, `page_title`, `cta_location`, `section_name`, `faq_id`, `faq_position`, `device_group`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `source`

### Regras

- `undefined`, `null` e strings vazias são removidos
- Strings limitadas a 200 caracteres, caracteres de controle removidos
- Valores numéricos preservados
- Objetos aninhados e arrays não são enviados
- UTMs são chaves planas no payload (não `data.utms = {...}`)
- `page_path` contém apenas `pathname`, sem query string
- URLs completas não são enviadas
- `device_group`: `"mobile"` (< 768px) ou `"desktop"` (≥ 768px) no momento do evento

## Consentimento

### Armazenamento seguro

Todos os acessos a `localStorage` e `sessionStorage` usam wrappers `try/catch`:

- `safeLocalStorageGet(key)` — retorna `null` em falha
- `safeLocalStorageSet(key, value)` — retorna `false` em falha
- `safeSessionStorageGet(key)` — retorna `null` em falha
- `safeSessionStorageSet(key, value)` — retorna `false` em falha

### Estado em memória

`memoryConsent` mantém o valor da sessão. `getConsent()` tenta o armazenamento primeiro, depois usa `memoryConsent`. `setConsent()` atualiza a memória e tenta persistir.

### Comportamento

- **Sem storage**: banner funcional durante a página, decisão não persiste, nenhum analytics sem consentimento, FAQ/CTAs/lightbox intactos
- **granted**: Pinterest carregado 1x, eventos enviados imediatamente, pendentes liberados
- **denied**: banner oculto, eventos bloqueados, página recarregada se Pinterest já estava ativo (para limpar `pintrk`)
- **null (indefinido)**: banner exibido, aguarda decisão

### Eventos vistos antes do consentimento

Seções observadas por IntersectionObserver antes do aceite são registradas em `pendingViewEvents`. Ao aceitar, `flushPendingViews()` dispara uma vez cada evento pendente.

Ao recusar:
- `pendingViewEvents` é limpo imediatamente
- Nenhum evento pendente é enviado
- Aceitar depois da recusa, na mesma página, **não** recupera visualizações anteriores à recusa
- Apenas novas visualizações posteriores ao aceite são contabilizadas

## Guarda de inicialização do Pinterest

`pinterestInitialized` impede execução duplicada:

- Máximo 1 `loadPinterestTag()` → 1 `<script>` inserido
- Máximo 1 `pintrk("load", tagId)`
- Máximo 1 `pintrk("page")`
- Máximo 1 `pintrk("track", "pagevisit")`
- Abrir preferências e aceitar novamente não duplica comandos

## Eventos desconhecidos

`trackEvent()` rejeita eventos fora da whitelist com status `"invalid_event"`. No modo debug, aparecem como `[ANALYTICS] IGNORADO (evento inválido): ...`. Não lançam erro.

## Debug Mode

Ativado exclusivamente por `?analytics_debug=1` (via `URLSearchParams`, não `indexOf`).

- `?not_analytics_debug=1` → **não** ativa
- `?analytics_debug=10` → **não** ativa
- `?x=analytics_debug=1` → **não** ativa

Log de exemplo:

```
[ANALYTICS] ENVIADO: click_primary_cta {"cta_location":"hero","section_name":"hero","page_path":"/","device_group":"desktop"} 2026-07-29T...
[ANALYTICS] BLOQUEADO (consentimento): view_pricing {"section_name":"final_offer",...}
[ANALYTICS] IGNORADO (evento inválido): Checkout {}
```

## Riscos e validação humana

- **Duplicidade com Kiwify**: confirmar quais eventos (`Checkout`, `Purchase`, `InitiateCheckout`) a Kiwify já dispara. `begin_checkout` da landing não deve ser mapeado como Checkout concluído.
- **Pinterest Tag Helper**: validar disparos no navegador.
- **Event History**: verificar no Pinterest Ads se `begin_checkout` aparece corretamente e nenhum `Checkout` ou `Purchase` é registrado pela landing.
- **Eventos customizados**: `click_primary_cta`, `click_mid_page_cta`, etc. podem precisar de mapeamento manual no painel do Pinterest se forem usados para otimização.

## Procedimentos de Teste

1. Abrir página com `?analytics_debug=1` → `pagevisit` no console
2. Rolar até cada seção → `view_*` correspondentes (1x cada)
3. Clicar em cada CTA → evento correto + `cta_location`, `section_name`, `page_path`, `device_group`, UTMs planas
4. Footer "Acessar o kit" → **nenhum** evento de CTA
5. FAQ: abrir → `open_faq` com `faq_id` e `faq_position`; fechar → zero eventos; trocar → exatamente 1 evento
6. Preço: visualizar → `view_pricing`; clicar → nenhum evento adicional
7. Suporte: e-mail no footer e no bloco de segurança → `click_support_email` (1 por clique); WhatsApp → `click_support_whatsapp`; e-mail não enviado no payload
8. Consentimento negado → nenhum evento; aceitar → eventos pendentes liberados; aceitar novamente → sem duplicação
9. `localStorage` bloqueado → banner funcional, decisão não persiste, página não quebra
10. `sessionStorage` bloqueado → CTA móvel funcional, fechamento não persiste, página não quebra
11. UTMs: `?utm_source=pinterest&utm_medium=paid` → `utm_source: "pinterest"`, `utm_medium: "paid"` no payload e no checkout
12. UTMs case-insensitive: `?UTM_SOURCE=Instagram` → `utm_source: "Instagram"`
13. `?email=teste@example.com` → **não** chega ao checkout
14. `?not_analytics_debug=1` → debug inativo
