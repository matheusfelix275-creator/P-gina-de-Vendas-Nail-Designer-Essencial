import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const patterns = [
  /\[nome/i,
  /\[foto/i,
  /\[experiência/i,
  /lorem ipsum/i,
  /substitua/i,
  /substituir/i,
  /todo:/i,
  /fixme:/i,
  /especialista renomada/i,
  /centenas de clientes/i,
  /milhares de clientes/i,
  /agenda lotada/i,
  /renda garantida/i,
  /resultado garantido/i,
  /risco zero/i,
  /template nativo do Canva/i,
  /quatro planilhas/i,
  /POR TRÁS DO KIT/i,
  /Quem criou o kit/i,
  /creatorName/i,
  /creatorRole/i,
  /creatorBio/i,
  /creatorPhoto/i,
  /section--author/i,
  /author-section/i,
  /author__card/i,
  /author__photo/i,
  /author__name/i,
  /author__role/i,
  /author__bio/i,
  /\[NOME DA CRIADORA\]/i,
  /\[FOTO AUTORIZADA\]/i,
  /\[EXPERIÊNCIA REAL\]/i,
  // Depoimentos
  /section--testimonials/i,
  /testimonials-grid/i,
  /O\s*que\s*dizem\s*quem\s*já\s*usou/i,
  // Copy antiga
  /Use\s*no\s*PowerPoint,\s*Canva\s*ou\s*Google\s*Slides/i,
  /PPTX\s*editável\s*no\s*PowerPoint,\s*Canva\s*e\s*Google\s*Slides/i,
  // Fallbacks proibidos
  /Identificação\s*do\s*produtor\s*pendente/i,
  /suporte\s*a\s*definir/i,
  // Headings vazios (single-line)
  /<h[1-6][^>]*>\s*<\/h[1-6]>/i,
  // Analytics: eventos Pinterest proibidos na landing
  /pintrk\s*\(\s*["']track["']\s*,\s*["']Checkout["']/i,
  /pintrk\s*\(\s*["']track["']\s*,\s*["']Purchase["']/i,
  /pintrk\s*\(\s*["']track["']\s*,\s*["']AddToCart["']/i,
  /pintrk\s*\(\s*["']track["']\s*,\s*["']addToCart["']/i,
  /pintrk\s*\(\s*["']track["']\s*,\s*["']initiatecheckout["']/i,
  // Tracking keys legados (src, sck) no array trackingKeys
  /trackingKeys\s*=\s*\[[^\]]*?["']src["'][^\]]*?\]/i,
  /trackingKeys\s*=\s*\[[^\]]*?["']sck["'][^\]]*?\]/i,
  // E-mail capturado na landing (proibido)
  /campo\s*[dD]e\s*[eE]-?mail/i,
  /input[^>]*type=["']?email["']?/i,
  /newsletter/i,
  // Href="#" em CTAs
  /data-checkout[^>]*href\s*=\s*["']#["'][^>]*>/i,
  // Analytics: data-checkout sem data-cta-location
  /<[^>]*\sdata-checkout\b(?![^>]*data-cta-location\b)[^>]*>/i,
  // Analytics: data-analytics="open_faq" remanescente
  /data-analytics\s*=\s*["']open_faq["']/i,
  // Analytics: data-analytics="view_pricing" remanescente
  /data-analytics\s*=\s*["']view_pricing["']/i,
  // Analytics: listener genérico [data-analytics]
  /querySelectorAll\s*\(\s*["']\[data-analytics\]/i,
  // Storage: acesso direto localStorage (não aplicado a app.js que tem wrappers seguros)
  // Storage: acesso direto sessionStorage (não aplicado a app.js que tem wrappers seguros)
  // Analytics: UTMs aninhadas em data.utms
  /["']utms["']\s*:/i,
  // Analytics: debug por substring (deve usar URLSearchParams)
  /analytics_debug[^=]+===\s*-1/,
  // Analytics: parsed[key] direto para pageUtms (sem sanitizeUtmValue)
  /pageUtms\[key\]\s*=\s*parsed\[key\]/,
];

function scanFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  let found = false;
  for (let i = 0; i < lines.length; i++) {
    for (const pattern of patterns) {
      if (pattern.test(lines[i])) {
        console.error(`ERRO: Placeholder encontrado em ${filePath}:${i + 1}`);
        console.error(`  Padrão: ${pattern.source}`);
        console.error(`  Linha: ${lines[i].trim().substring(0, 120)}`);
        found = true;
      }
    }
  }
  // Check for empty headings spanning multiple lines
  const joined = content.replace(/\n\s*/g, " ");
  const emptyHeading = /<h([1-6])[^>]*>\s*<\/h\1>/i;
  if (emptyHeading.test(joined)) {
    const match = joined.match(emptyHeading);
    const snippet = match ? match[0].substring(0, 120) : "";
    console.error(`ERRO: Heading vazio encontrado em ${filePath}`);
    console.error(`  Trecho: ${snippet}`);
    found = true;
  }
  // Multi-line structural checks
  const checkoutCount = (content.match(/data-checkout/g) || []).length;
  if (filePath.endsWith("index.html") && checkoutCount !== 5) {
    console.error(`ERRO: index.html contém ${checkoutCount} data-checkout (devem ser exatamente 5)`);
    found = true;
  }
  const pintrkPage = (content.match(/pintrk\s*\(\s*["']page["']\s*\)/g) || []).length;
  if (filePath.endsWith("app.js") && pintrkPage > 1) {
    console.error(`ERRO: app.js contém ${pintrkPage} pintrk("page") (máximo 1 permitido)`);
    found = true;
  }
  const pintrkLoad = (content.match(/pintrk\s*\(\s*["']load["']\s*,/g) || []).length;
  if (filePath.endsWith("app.js") && pintrkLoad > 1) {
    console.error(`ERRO: app.js contém ${pintrkLoad} pintrk("load") (máximo 1 permitido)`);
    found = true;
  }
  // HTML files should not have direct localStorage/sessionStorage access
  if (filePath.endsWith(".html") && !filePath.includes("node_modules")) {
    var storageMethods = content.match(/(localStorage|sessionStorage)\.\s*(getItem|setItem)\s*\(/g);
    if (storageMethods && storageMethods.length) {
      console.error(`ERRO: Acesso direto a storage encontrado em ${filePath}: ${storageMethods.length} ocorrência(s)`);
      found = true;
    }
  }
  // buildCheckoutUrl: searchParams.set deve ser precedido por has(key) check
  if (filePath.endsWith("app.js")) {
    var setCount = (content.match(/\.searchParams\.set\s*\(/g) || []).length;
    var hasCount = (content.match(/\.searchParams\.has\s*\(/g) || []).length;
    if (setCount > 0 && hasCount === 0) {
      console.error(`ERRO: app.js contém searchParams.set (${setCount}x) sem searchParams.has`);
      found = true;
    }
  }
  return found;
}

const filesToCheck = [
  resolve(root, "index.html"),
  resolve(root, "politica-de-privacidade.html"),
  resolve(root, "termos-de-uso.html"),
  resolve(root, "app.js"),
  resolve(root, "legal.js"),
  resolve(root, "config.js"),
];

// Also check dist HTML files if they exist
["index.html", "politica-de-privacidade.html", "termos-de-uso.html"].forEach(function (name) {
  var p = resolve(root, "dist", name);
  try {
    readFileSync(p);
    filesToCheck.push(p);
  } catch (_) {}
});

let hasError = false;
for (const file of filesToCheck) {
  try {
    readFileSync(file);
    if (scanFile(file)) {
      hasError = true;
    }
  } catch {
    // file not found, skip
  }
}

if (hasError) {
  console.error("\n VALIDAÇÃO FALHOU — remova os placeholders antes de publicar.");
  process.exit(1);
} else {
  console.log(" Validação de conteúdo público: nenhum placeholder encontrado.");
}
