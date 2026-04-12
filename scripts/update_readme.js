const fs = require('fs');
const path = require('path');

const README_PATH = path.join(__dirname, '../README.md');
const ADR_DIR = path.join(__dirname, '../docs/adr');

// Configuration
const START_MARKER = '<!-- ADRs:START -->\n';
const END_MARKER = '<!-- ADRs:END -->';

function run() {
  if (!fs.existsSync(ADR_DIR)) return;

  const files = fs.readdirSync(ADR_DIR).filter((f) => f.endsWith('.md'));

  let markdownList = '';
  files.forEach((file) => {
    const content = fs.readFileSync(path.join(ADR_DIR, file), 'utf8');
    // Extract first H1 match as title
    const match = content.match(/^#\s+(.*)$/m);
    const title = match ? match[1] : file;
    markdownList += `- [${title}](./docs/adr/${file})\n`;
  });

  const readmeContent = fs.readFileSync(README_PATH, 'utf8');

  // Regex to swap out content between markers
  const regex = new RegExp(`(${START_MARKER})[\\s\\S]*?(${END_MARKER})`, 'g');
  const newReadme = readmeContent.replace(regex, `$1\n${markdownList}\n$2`);

  fs.writeFileSync(README_PATH, newReadme, 'utf8');
  console.log('✅ Successfully synced ADRs to README.md');
}

run();
