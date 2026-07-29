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
