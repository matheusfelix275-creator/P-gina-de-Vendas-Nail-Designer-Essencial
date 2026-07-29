import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const prohibited = [
  // Placeholders
  /\[nome/i,
  /\[foto/i,
  /\[experiência/i,
  /lorem ipsum/i,
  /substitua/i,
  /substituir/i,
  /todo:/i,
  /fixme:/i,
  // Depoimentos
  /O\s*que\s*dizem\s*quem\s*já\s*usou/i,
  /section--testimonials/i,
  /testimonials-container/i,
  /testimonials-grid/i,
  /\btestimonials\b/i,
  // Copy antiga
  /Use\s*no\s*PowerPoint,\s*Canva\s*ou\s*Google\s*Slides/i,
  /PPTX\s*editável\s*no\s*PowerPoint,\s*Canva\s*e\s*Google\s*Slides/i,
  // Headings vazios
  /<h[1-6][^>]*>\s*<\/h[1-6]>/i,
];

function scanFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  let found = false;
  for (let i = 0; i < lines.length; i++) {
    for (const pattern of prohibited) {
      if (pattern.test(lines[i])) {
        console.error(`ERRO: Conteúdo proibido encontrado em ${filePath}:${i + 1}`);
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
];

// Also check dist if it exists
const distIndex = resolve(root, "dist", "index.html");
try {
  readFileSync(distIndex);
  filesToCheck.push(distIndex);
} catch {
  // dist might not exist yet
}

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
  console.error("\n VALIDAÇÃO FALHOU — corrija os problemas antes de publicar.");
  process.exit(1);
} else {
  console.log(" Validação de conteúdo público: nenhum problema encontrado.");
}
