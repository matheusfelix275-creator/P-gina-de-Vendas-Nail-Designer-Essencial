# Validação de Analytics — Kit Nail Designer Essencial

## Taxonomia de Eventos

| Evento | Tipo | Gatilho | Parâmetros | Observação |
|---|---|---|---|---|
| `pagevisit` | Automático | `pintrk("page")` + `pintrk("track", "pagevisit")` | — | Dispara 1x ao carregar após consentimento |
| `view_pricing` | Visualização | IntersectionObserver (50%) sobre `.checkout__price-value` | `{ section_name: "final_offer" }` | Dispara 1x |
| `view_product_contents` | Visualização | IntersectionObserver (30%) sobre `.section--content` | `{ section_name: "content" }` | Dispara 1x |
| `view_collections` | Visualização | IntersectionObserver (30%) sobre `.section--collections` | `{ section_name: "collections" }` | Dispara 1x |
| `view_spreadsheets` | Visualização | IntersectionObserver (30%) sobre `.section--spreadsheets` | `{ section_name: "spreadsheets" }` | Dispara 1x |
| `view_guarantee` | Visualização | IntersectionObserver (30%) sobre `.section--guarantee` | `{ section_name: "guarantee" }` | Dispara 1x |
| `view_final_offer` | Visualização | IntersectionObserver (30%) sobre `#checkout` | `{ section_name: "final_offer" }` | Dispara 1x |
| `click_primary_cta` | Clique | CTA com `data-cta-location="header"` ou `"hero"` | `{ cta_location, section_name, utms? }` | |
| `click_mid_page_cta` | Clique | CTA com `data-cta-location="mid_page"` | `{ cta_location, section_name, utms? }` | |
| `begin_checkout` | Clique | CTA com `data-cta-location="final_offer"` | `{ cta_location, section_name, value, currency, product_id, product_name, utms? }` | Único CTA com dados de produto |
| `click_sticky_cta` | Clique | CTA com `data-cta-location="sticky_mobile"` | `{ cta_location, section_name, utms? }` | |
| `click_support_email` | Clique | Link de e-mail no footer/support | — | |
| `click_support_whatsapp` | Clique | Link de WhatsApp no footer | — | |
| `click_terms` | Clique | Qualquer link com `href` contendo `termos-de-uso` | — | |
| `click_privacy` | Clique | Qualquer link com `href` contendo `politica-de-privacidade` | — | |
| `open_faq` | Clique | Botão `.faq__question` | `{ faq_id: "faq-N" }` | Disparado apenas ao abrir (não ao fechar) |

## Mapeamento de CTA

| `data-cta-location` | Evento | Elemento | Localização na página |
|---|---|---|---|
| `header` | `click_primary_cta` | `<header>` | Topo fixo |
| `hero` | `click_primary_cta` | `.hero` | Primeira dobra |
| `mid_page` | `click_mid_page_cta` | `.mid-cta__card` | Entre seções |
| `final_offer` | `begin_checkout` | `#checkout` | Card final pré-footer |
| `sticky_mobile` | `click_sticky_cta` | `#mobile-sticky-cta` | Barra fixa inferior (mobile) |

**Nota:** O link "Acessar o kit" no footer (`<footer>`) possui `data-checkout` mas não `data-cta-location`. Ele não dispara evento de analytics propositalmente, pois é um link de navegação secundário.

## Parametrização UTM

Parâmetros capturados da URL e repassados ao checkout:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`

A captura é feita via `URLSearchParams` e armazenada em cache (`pageUtms`). UTMs também são incluídas nos eventos de CTA como `data.utms` quando presentes.

## Consentimento

A página usa consentimento explícito via banner (`kn_measurement_consent_v1` no `localStorage`).

- **granted**: Pinterest Tag carregado, eventos disparados.
- **denied**: Banner oculto, nenhum evento disparado.
- **null (não definido)**: Banner exibido, nenhum script carregado até interação.

Nenhum dado é coletado antes do consentimento. O `trackEvent()` bloqueia se o consentimento não for `"granted"`.

## Debug Mode

Adicione `?analytics_debug=1` à URL para ativar logs no console:

```
[ANALYTICS] ENVIADO: click_primary_cta {"cta_location":"hero","section_name":"hero"} 2026-07-29T...
[ANALYTICS] BLOQUEADO (consentimento): view_pricing {}
```

## Regras de Negócio

1. A landing page **não** dispara `Checkout`, `Purchase`, `AddToCart` ou `addToCart` — esses eventos pertencem exclusivamente ao checkout da Kiwify.
2. Nenhum evento é disparado antes do consentimento do usuário.
3. `begin_checkout` é o único evento com dados de produto (`value`, `currency`, `product_id`, `product_name`) e é enviado apenas no CTA `final_offer`.
4. `initiatecheckout` não é mais disparado pela landing page (consolidado em `begin_checkout`).
5. Todos os CTAs de compra usam `data-checkout` com `href` dinâmico apontando para a Kiwify.
6. O parâmetro `section_name` é adicionado a todos os eventos de visualização para análise de profundidade de rolagem.
7. O evento `open_faq` inclui `faq_id` para identificar qual pergunta foi aberta.

## Procedimentos de Teste

1. Abra a página com `?analytics_debug=1` e verifique no console se `pagevisit` é disparado.
2. Role até cada seção e confirme os eventos `view_*` correspondentes.
3. Clique em cada CTA e verifique o evento correto + parâmetros.
4. Verifique que CTAs sem `data-cta-location` (ex: footer) **não** disparam eventos.
5. Abra e feche perguntas do FAQ; confirme que `open_faq` dispara apenas ao abrir.
6. Teste com consentimento negado: nenhum evento deve aparecer.
7. Teste com UTMs na URL (`?utm_source=google&utm_medium=cpc`) e confirme que são repassadas ao checkout e incluídas nos eventos de CTA.
