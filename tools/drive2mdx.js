
const fs = require('fs');
const path = require('path');

 function parseArgs(argv) {
   const args = { type: 'iframe', size: 'w1600' };
   for (let i = 2; i < argv.length; i++) {
     const a = argv[i];
     if (a === '--input' || a === '-i') args.input = argv[++i];
     else if (a === '--output' || a === '-o') args.output = argv[++i];
     else if (a === '--type' || a === '-t') args.type = argv[++i];
     else if (a === '--size' || a === '-s') args.size = argv[++i];
     else {
       (args._ ??= []).push(a);
     }
   }

   if (!args.output && args._ && args._.length >= 2) {
     const first = args._[0];
     args.output = args._[1];
     try {
       const full = path.resolve(first);
       if (fs.existsSync(full) && /\.txt$/i.test(first)) {
         args.input = first;
       } else {
         args.single = first;
       }
     } catch (_) {
       args.single = first;
     }
     if (args._[2] && /^(iframe|img)$/i.test(args._[2])) args.type = args._[2].toLowerCase();
     if (args._[3]) args.size = args._[3];
   }

   return args;
 }

function extractDriveId(linkOrId) {
  if (!linkOrId) return null;
  const src = String(linkOrId).trim();
  if (!src) return null;
  const dMatch = src.match(/\/(?:file\/)?d\/([^/?#]+)/i);
  if (dMatch && dMatch[1]) return sanitizeId(dMatch[1]);
  const idParam = src.match(/[?&]id=([^&#]+)/i);
  if (idParam && idParam[1]) return sanitizeId(idParam[1]);
  if (/^[A-Za-z0-9_-]{10,}$/.test(src)) return sanitizeId(src);

  return null;
}

function sanitizeId(id) {
  return id.replace(/[\/_]+$/g, '');
}

function makeIframeSnippet(id) {
  return [
    '<div style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>',
    '  <iframe',
    `    src="https://drive.google.com/file/d/${id}/preview"`,
    '    allow="autoplay"',
    '    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}',
    '    title="Google Drive Preview"',
    '  />',
    '</div>'
  ].join('\n');
}

function makeImageSnippet(id, size) {
  return [
    `<img src="https://drive.google.com/thumbnail?id=${id}&sz=${size}" alt="Google Drive Image" style={{maxWidth: "100%", height: "auto"}} />`
  ].join('\n');
}

 async function readInputLines(args) {
   if (args.single) {
     return [String(args.single)];
   }
   if (args.input) {
    const content = fs.readFileSync(path.resolve(args.input), 'utf8');
    return content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  }

  if (args._ && args._.length) {
    return args._.map(s => String(s).trim()).filter(Boolean);
  }

  const stat = fs.fstatSync(0);
  if (stat.size > 0) {
    const content = fs.readFileSync(0, 'utf8');
    return content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  }

  return [];
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.output) {
    console.error('Error: --output is required');
    process.exit(1);
  }

  const lines = await readInputLines(args);
  if (!lines.length) {
    console.error('No input links/IDs provided. Use --input file, pass args, or pipe via stdin.');
    process.exit(1);
  }

  const snippets = [];
  for (const line of lines) {
    const id = extractDriveId(line);
    if (!id) {
      snippets.push(`// Skipped (cannot parse): ${line}`);
      continue;
    }
    if (args.type === 'img') snippets.push(makeImageSnippet(id, args.size));
    else snippets.push(makeIframeSnippet(id));
  }

  let outPath = path.resolve(args.output);
  try {
    if (fs.existsSync(outPath) && fs.lstatSync(outPath).isDirectory()) {
      outPath = path.join(outPath, 'drive_snippets.txt');
    }
  } catch (_) {
   
  }
  const hasExt = path.extname(outPath);
  if (!hasExt) outPath = outPath + '.txt';
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, snippets.join('\n\n') + '\n', 'utf8');
  console.log(`Wrote ${snippets.length} snippet(s) → ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});


