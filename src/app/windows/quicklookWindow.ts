import { BrowserWindow } from 'electron';
import path from 'path';
import constants from '../constants';

const createQuicklookWindow = () => {
  const quicklookWindow = new BrowserWindow({
    title: 'QuicklookWindow',
    center: true,
    show: false,
    frame: true,
    resizable: true,
    disableAutoHideCursor: true,
    skipTaskbar: true,
    movable: true,
    fullscreenable: true,
    width: constants.quicklookWindowWidth,
    height: constants.quicklookWindowHeight,
    webPreferences: {
      contextIsolation: false,
      enableRemoteModule: true,
      nodeIntegration: true,
      webviewTag: true,
    },
  });

  const filePath =
    process.env.NODE_ENV === 'development'
      ? path.join(__dirname, '../../', 'app.html')
      : path.join(__dirname, 'app.html');

  quicklookWindow.loadFile(filePath, {
    query: { window: 'quicklookWindow' },
  });

  quicklookWindow.on('close', (e) => {
    e.preventDefault();
    if (quicklookWindow) {
      quicklookWindow.hide();
    }
  });

  quicklookWindow.on('blur', () => {
    quicklookWindow.hide();
  });

  return quicklookWindow;
};

export { createQuicklookWindow };
