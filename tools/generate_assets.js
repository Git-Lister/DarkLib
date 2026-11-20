import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const outputDir = path.join(projectRoot, 'public', 'assets', 'blender');
const pythonScript = path.join(__dirname, 'generate_assets.py');

let blenderCmd = 'blender';

if (process.platform === 'win32' || process.env.WSL_DISTRO_NAME) {
    // Standard installation paths for the official Blender installer
    const possiblePaths = [
        '/mnt/c/Program Files/Blender Foundation/Blender 5.3/blender.exe',
        '/mnt/c/Program Files/Blender Foundation/Blender 5.2/blender.exe',
        '/mnt/c/Program Files/Blender Foundation/Blender 5.1/blender.exe',
        '/mnt/c/Program Files/Blender Foundation/Blender 4.5/blender.exe',
        '/mnt/c/Program Files/Blender Foundation/Blender 4.2/blender.exe',
        '/mnt/c/Program Files/Blender Foundation/Blender 4.1/blender.exe',
        '/mnt/c/Program Files/Blender Foundation/Blender 4.0/blender.exe'
    ];

    let found = false;
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            blenderCmd = `"${p}"`;
            found = true;
            break;
        }
    }

    if (!found) {
        console.warn("⚠️ Could not find Blender.exe automatically. Falling back to 'blender'.");
    }
}

const command = `${blenderCmd} -b -P "${pythonScript}" -- "${outputDir}"`;

console.log(`Executing: ${command}\n`);

try {
    execSync(command, { stdio: 'inherit' });
    console.log('\n✅ Asset generation successful.');
} catch (error) {
    console.error('\n❌ Asset generation failed.');
    process.exit(1);
}