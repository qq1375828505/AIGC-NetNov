const fs = require('fs');
const path = require('path');

function resolveRepoRoot() {
    return path.resolve(__dirname, '..', '..');
}

async function main() {
    let esbuild;
    try {
        esbuild = require('esbuild');
    } catch (e) {
        throw new Error('Missing devDependency "esbuild". Install it first: npm i -D esbuild');
    }

    const repoRoot = resolveRepoRoot();
    const examplesDir = path.join(repoRoot, 'examples');
    const novelideDir = path.join(examplesDir, 'novelide');

    const tsconfig = path.join(novelideDir, 'tsconfig.json');
    const entryPoint = path.join(novelideDir, 'src', 'main.ts');
    const outfile = path.join(novelideDir, 'dist', 'main.js');

    if (!fs.existsSync(entryPoint)) {
        throw new Error('Entry point not found: ' + entryPoint);
    }

    // Ensure dist directory exists
    const distDir = path.dirname(outfile);
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }

    const metadataBanner = extractMetadataBanner(entryPoint);

    await esbuild.build({
        entryPoints: [entryPoint],
        bundle: true,
        format: 'cjs',
        platform: 'neutral',
        target: ['es2017'],
        outfile,
        banner: { js: metadataBanner },
        tsconfig,
        logLevel: 'info',
        // Allow .js extensions to resolve to .ts files
        resolveExtensions: ['.ts', '.js', '.d.ts'],
    });

    console.log('Build complete: ' + outfile);
}

function extractMetadataBanner(entryFilePath) {
    if (!entryFilePath) return '';
    if (!fs.existsSync(entryFilePath)) return '';

    const src = fs.readFileSync(entryFilePath, 'utf8');
    const match = src.match(/\/\*\s*METADATA[\s\S]*?\*\//);
    return match ? `${match[0]}\n` : '';
}

main().catch((err) => {
    console.error(err && err.stack ? err.stack : String(err));
    process.exitCode = 1;
});
