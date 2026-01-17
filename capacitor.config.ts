import type { CapacitorConfig } from '@capacitor/cli';
import os from 'os';

// Get local IP address for live reload on physical devices
function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();

// Android emulator: 10.0.2.2
// iOS simulator: localhost (shares host network)
// Physical devices: local IP
const serverHost = process.env.EMULATOR 
  ? (process.env.IOS ? 'localhost' : '10.0.2.2') 
  : localIP;

const serverPort = process.env.PORT || '3000';

const config: CapacitorConfig = {
  appId: 'com.powersync.nextjs.capacitor',
  appName: 'PowerSync Next.js Capacitor Demo',
  webDir: 'out',
  server: {
    cleartext: true,
    // Use dev server URL when LIVE_RELOAD is set
    ...(process.env.LIVE_RELOAD && {
      url: `http://${serverHost}:${serverPort}`
    })
  }
};

if (process.env.LIVE_RELOAD) {
  console.log(`[Capacitor Config] Live reload URL: http://${serverHost}:${serverPort}`);
}

export default config;