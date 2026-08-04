import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, fork } from 'child_process';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let serverProcess = null;

function checkServerReady(url, callback) {
  const req = http.get(url, () => {
    callback(true);
  });
  req.on('error', () => {
    callback(false);
  });
  req.end();
}

function waitForServer(url, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      checkServerReady(url, (ready) => {
        if (ready) {
          clearInterval(interval);
          resolve(true);
        } else if (Date.now() - startTime > timeoutMs) {
          clearInterval(interval);
          reject(new Error("Délai d'attente du serveur dépassé"));
        }
      });
    }, 500);
  });
}

function startBackendServer() {
  const serverPath = path.join(__dirname, 'server/src/app.js');

  try {
    // Utiliser fork pour exécuter le serveur avec l'environnement Node d'Electron
    serverProcess = fork(serverPath, [], {
      cwd: path.join(__dirname, 'server'),
      env: { ...process.env, PORT: '5000', ELECTRON_RUN_AS_NODE: '1' },
      silent: true
    });
  } catch (err) {
    console.warn('Fork échoué, tentative via spawn avec shell:', err);
    serverProcess = spawn('node', [serverPath], {
      cwd: path.join(__dirname, 'server'),
      env: { ...process.env, PORT: '5000' },
      shell: true
    });
  }

  if (serverProcess) {
    serverProcess.on('error', (err) => {
      console.error('[Backend Process Error]:', err);
    });

    serverProcess.stdout?.on('data', (data) => console.log(`[Backend]: ${data}`));
    serverProcess.stderr?.on('data', (data) => console.error(`[Backend Error]: ${data}`));
  }
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 720,
    title: "Gestion des Chantiers BTP",
    icon: path.join(__dirname, 'build/icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  Menu.setApplicationMenu(null);

  try {
    await waitForServer('http://localhost:5000/api/chantiers');
  } catch (err) {
    console.warn('Le serveur met du temps à répondre, chargement direct...');
  }

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadURL('http://localhost:5000');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackendServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
