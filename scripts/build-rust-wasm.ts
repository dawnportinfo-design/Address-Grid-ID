import { spawn } from 'node:child_process';
import { copyFile,mkdir } from 'node:fs/promises';
import path from 'node:path';

function run(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with ${code}`));
    });
  });
}

async function main() {
  await run('rustup', ['target', 'add', 'wasm32-unknown-unknown']);
  await run('cargo', [
    'build',
    '--manifest-path',
    path.join('native', 'agid-core', 'Cargo.toml'),
    '--target',
    'wasm32-unknown-unknown',
    '--release',
  ]);

  const outputDir = path.join('public', 'wasm');
  await mkdir(outputDir, { recursive: true });
  await copyFile(
    path.join('native', 'agid-core', 'target', 'wasm32-unknown-unknown', 'release', 'agid_core.wasm'),
    path.join(outputDir, 'agid_core.wasm')
  );
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
