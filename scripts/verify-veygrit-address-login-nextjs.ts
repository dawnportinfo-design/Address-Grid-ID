import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
const node = process.execPath;

const commands: Array<{ label: string; args: string[] }> = [
  {
    label: 'nextjs-sdk-tests',
    args: [join(root, 'node_modules/tsx/dist/cli.mjs'), '--test', 'sdk/veygrit-address-login-nextjs/test/sdk.test.ts'],
  },
  {
    label: 'nextjs-sdk-typecheck',
    args: [join(root, 'node_modules/typescript/bin/tsc'), '--noEmit', '-p', 'sdk/veygrit-address-login-nextjs/tsconfig.json'],
  },
];

for (const command of commands) {
  const result = spawnSync(node, command.args, {
    cwd: root,
    stdio: 'inherit',
    shell: false,
  });

  if (result.status !== 0) {
    console.error(`verify-veygrit-address-login-nextjs failed at ${command.label}`);
    process.exit(result.status ?? 1);
  }
}

console.log('verify-veygrit-address-login-nextjs passed');
