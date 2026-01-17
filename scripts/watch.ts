#!/usr/bin/env tsx

/**
 * Cross-platform watch script for Capacitor live reload development
 */

import { ChildProcess, spawn } from 'child_process';
import { program } from 'commander';

// CLI setup
program
  .name('watch')
  .description('Watch mode for Capacitor live reload development')
  .argument('<platform>', 'Target platform (android or ios)')
  .argument('[target]', 'Target type (emulator or device)', 'emulator')
  .option('-p, --port <number>', 'Dev server port', '3000')
  .parse();

const [platform, target] = program.args;
const options = program.opts<{ port: string }>();
const port = parseInt(options.port, 10);

// Validate platform
if (platform !== 'android' && platform !== 'ios') {
  console.error(`Invalid platform: ${platform}`);
  program.help();
}

// Track child processes for cleanup
const childProcesses: ChildProcess[] = [];

// Cleanup function - only needed for programmatic shutdown
// Ctrl+C naturally propagates to child processes via terminal
function cleanup() {
  console.log('\n🛑 Shutting down...');
  childProcesses.forEach(proc => {
    if (proc && !proc.killed) {
      proc.kill('SIGTERM');
    }
  });
}

// Handle SIGTERM (programmatic shutdown)
process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

// Wait for server to be ready, checking if process is still alive
async function waitForServer(url: string, proc: ChildProcess, timeout = 30000): Promise<void> {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    // Check if process died
    if (proc.exitCode !== null) {
      throw new Error(`Dev server exited with code ${proc.exitCode}`);
    }
    
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  throw new Error('Dev server did not become ready in time');
}

// Run a command and wait for it to complete
function runCommand(command: string, args: string[], env?: Record<string, string>): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`$ ${command} ${args.join(' ')}`);
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, ...env },
    });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });
    proc.on('error', reject);
  });
}

// Start a background process
function startBackground(command: string, args: string[], env?: Record<string, string>): ChildProcess {
  console.log(`$ ${command} ${args.join(' ')} &`);
  const proc = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, ...env },
  });
  childProcesses.push(proc);
  return proc;
}

// Run an interactive command (for device selection)
function runInteractive(command: string, args: string[], env?: Record<string, string>): Promise<void> {
  return new Promise((resolve) => {
    console.log(`$ ${command} ${args.join(' ')}`);
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, ...env },
    });
    proc.on('close', () => resolve());
    proc.on('error', () => resolve());
  });
}

// Main function
async function main() {
  // Set environment variables
  const env: Record<string, string> = {
    LIVE_RELOAD: 'true',
    EMULATOR: target === 'emulator' ? 'true' : 'false',
    PORT: String(port),
  };
  
  if (platform === 'ios') {
    env.IOS = 'true';
  }

  console.log(`🚀 Starting watch mode for ${platform} (${target})`);
  console.log(`   LIVE_RELOAD=${env.LIVE_RELOAD}`);
  console.log(`   EMULATOR=${env.EMULATOR}`);
  console.log(`   PORT=${port}`);
  if (platform === 'ios') console.log(`   IOS=${env.IOS}`);

  // Sync capacitor config
  console.log('\n📦 Syncing Capacitor...');
  await runCommand('npx', ['cap', 'sync', platform], env);

  // Start dev server in background
  console.log('\n🌐 Starting Next.js dev server...');
  const devServer = startBackground('pnpm', ['dev', '--port', String(port)], env);

  // Wait for dev server to be ready (also checks if process died)
  console.log(`⏳ Waiting for dev server at http://localhost:${port}...`);
  await waitForServer(`http://localhost:${port}`, devServer);

  console.log('✅ Dev server ready!\n');

  // Run capacitor (interactive - allows device selection)
  console.log(`📱 Launching app on ${platform}...`);
  await runInteractive('npx', ['cap', 'run', platform], env);

  // Keep the script alive so dev server keeps running
  console.log('\n✨ App deployed! Dev server still running for live reload.');
  console.log('   Press Ctrl+C to stop.\n');

  // Wait indefinitely (until user presses Ctrl+C)
  await new Promise(() => {});
}

main().catch((err) => {
  console.error('Error:', err.message);
  cleanup();
});
