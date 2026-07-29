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
];

function scanFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    for (const pattern of patterns) {
      if (pattern.test(lines[i])) {
        console.error(`ERRO: Placeholder encontrado em ${filePath}:${i + 1}`);
        console.error(`  Padrão: ${pattern.source}`);
        console.error(`  Linha: ${lines[i].trim().substring(0, 120)}`);
        return true;
      }
    }
  }
  return false;
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
  console.error("\n VALIDAÇÃO FALHOU — remova os placeholders antes de publicar.");
  process.exit(1);
} else {
  console.log(" Validação de conteúdo público: nenhum placeholder encontrado.");
}
