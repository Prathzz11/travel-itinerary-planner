const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const indexHtml = path.join(__dirname, 'index.html');

const bsPrefixes = [
  'container', 'row', 'col', 'btn', 'card', 'text-', 'bg-', 'd-', 'p-', 'pb-', 'pt-', 'px-', 'py-', 'm-', 'mb-', 'mt-', 'mx-', 'my-',
  'navbar', 'nav-', 'dropdown', 'modal', 'alert', 'badge', 'list-group', 'form-',
  'input-group', 'table', 'shadow', 'w-', 'h-', 'align-', 'justify-', 'fs-',
  'fw-', 'rounded', 'border', 'position-', 'top-', 'start-', 'end-', 'bottom-',
  'opacity-', 'z-', 'gap-', 'flex-', 'visually-hidden', 'spinner-', 'toast', 'accordion', 'carousel', 'lead', 'display-', 'small', 'mark', 'blockquote', 'figure', 'img-fluid', 'ratio', 'fixed-', 'sticky-', 'pe-', 'ps-', 'me-', 'ms-'
];

let mdReport = '# Comprehensive Bootstrap Usage Report\n\nThis report elaborates on each and every file in the project where Bootstrap elements/classes are utilized.\n\n';

function extractClasses(text) {
    // A more catch-all regex for class and className, matching the value inside matching quotes/backticks
    let classes = new Set();

    const regex = /(?:className|class)\s*=\s*(?:["']([^"']*)["']|\{`([^`]*)`\}|\{"([^"]*)"\}|\{'([^']*)'\})/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        let classStr = match[1] || match[2] || match[3] || match[4];
        if (classStr) {
            // Remove any dynamic ${} parts so they don't get logged as classes
            classStr = classStr.replace(/\$\{[^}]+\}/g, ' ');
            classStr.split(/\s+/).forEach(c => {
                if(c.trim()) classes.add(c.trim());
            });
        }
    }
    
    // Also include any stray matches just in case (e.g. data-bs-*)
    const dataBsRegex = /data-bs-[a-zA-Z0-9-]+/g;
    while ((match = dataBsRegex.exec(text)) !== null) {
        classes.add(match[0]);
    }

    let arr = Array.from(classes);
    return arr.filter(cls => {
        if (cls === 'nav' || cls === 'p') return true;
        return bsPrefixes.some(prefix => cls === prefix || cls.startsWith(prefix) || cls.startsWith('data-bs-'));
    }).sort();
}

function processFile(filePath) {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
         fs.readdirSync(filePath).forEach(file => {
             processFile(path.join(filePath, file));
         });
    } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.html')) {
         const content = fs.readFileSync(filePath, 'utf8');
         const bsClasses = extractClasses(content);
         if (bsClasses.length > 0) {
             let relPath = path.relative(__dirname, filePath).replace(/\\/g, '/');
             mdReport += `### File: [${relPath}](file:///${filePath.replace(/\\/g, '/')})\n`;
             mdReport += `**Bootstrap Classes & Attributes Found:**\n\n`;
             mdReport += bsClasses.map(c => `- \`${c}\``).join('\n') + '\n\n';
             mdReport += `---\n\n`;
         }
    }
}

try {
    if (fs.existsSync(indexHtml)) processFile(indexHtml);
    if (fs.existsSync(srcDir)) processFile(srcDir);
    fs.writeFileSync('bs_report_temp.txt', mdReport);
    console.log("SUCCESS");
} catch(e) {
    console.error(e);
}
