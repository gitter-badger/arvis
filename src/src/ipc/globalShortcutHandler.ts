/* eslint-disable no-param-reassign */
/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
/* eslint-disable no-restricted-syntax */
import { BrowserWindow, globalShortcut, Notification } from 'electron';
import ioHook from 'iohook';
import { Core } from 'arvis-core';
import shortcutCallbackTbl from './shortcutCallbackTable';
import { IPCMainEnum } from './ipcEventEnum';

const doubleKeyPressHandler = {
  shift: () => {},
  alt: () => {},
  ctrl: () => {},
  cmd: () => {}
};

const doubleKeyPressedTimers = {
  shift: 0,
  alf: 0,
  ctrl: 0,
  meta: 0
};

const handleGUICustomActions = (hotKeyAction: any, actionTypes: string[]) => {
  // handle custom actions
  if (actionTypes.includes('notification')) {
    // Assume action count is 1
    const targetAction = hotKeyAction.action.filter(
      (item: any) => item.type === 'notification'
    )[0];

    new Notification({
      title: targetAction.title,
      body: targetAction.text
    }).show();
  }
};

const handleHotKeyAction = (
  searchWindow: BrowserWindow,
  hotKeyAction: any,
  actionTypes: string[]
) => {
  if (actionTypes.includes('keyword') || actionTypes.includes('scriptfilter')) {
    const targetAction = hotKeyAction.action.filter(
      (item: any) => item.type === 'keyword' || item.type === 'scriptfilter'
    )[0];

    searchWindow.show();

    const newInput = targetAction.command;

    searchWindow.webContents.send(IPCMainEnum.setSearchbarInput, {
      str: newInput
    });
  }

  // handle custom actions
  handleGUICustomActions(hotKeyAction, actionTypes);
};

const getWorkflowHotkeyPressHandler = ({
  searchWindow,
  hotKeyAction
}: {
  searchWindow: BrowserWindow;
  hotKeyAction: any;
}) => {
  // The workManager instance obtained in the main process is a different object
  // from the Singleton object in the renderer process.
  // So, methods like onInputShouldBeUpdate cannot be used here
  // and GUI custom actions (notifications) should be handled here
  const mainProcWorkManager = Core.WorkManager.getInstance();

  mainProcWorkManager.handleAction({
    actions: [hotKeyAction],
    queryArgs: {},
    modifiersInput: {}
  });

  const actionTypes: string[] = hotKeyAction.action.map(
    (item: any) => item.type
  );

  handleHotKeyAction(searchWindow, hotKeyAction, actionTypes);
};

const registerShortcut = (shortcut: string, callback: Function) => {
  console.log(`Shortcut registered.. '${shortcut}'`);

  // Case of double key type
  if (shortcut.includes('Double')) {
    // eslint-disable-next-line prefer-destructuring
    shortcut = shortcut.split('Double ')[1];

    doubleKeyPressHandler[shortcut] = () => {
      if (Date.now() - doubleKeyPressedTimers[shortcut] < 200) {
        callback();
      } else {
        doubleKeyPressedTimers[shortcut] = new Date();
      }
    };
  }
  // Single key (normal shortcut)
  else {
    globalShortcut.register(shortcut, callback as () => void);
  }
};

const registerWorkflowHotkeys = ({
  searchWindow,
  workflowHotkeyTbl
}: {
  searchWindow: BrowserWindow;
  workflowHotkeyTbl: any;
}) => {
  const hotkeys = Object.keys(workflowHotkeyTbl);
  for (const hotkey of hotkeys) {
    const cb = () => {
      getWorkflowHotkeyPressHandler({
        searchWindow,
        hotKeyAction: workflowHotkeyTbl[hotkey]
      });
    };

    registerShortcut(hotkey, cb);
  }
};

export default ({
  preferenceWindow,
  searchWindow,
  callbackTable,
  workflowHotkeyTbl
}: {
  preferenceWindow: BrowserWindow;
  searchWindow: BrowserWindow;
  callbackTable: any;
  workflowHotkeyTbl: any;
}) => {
  const shortcuts = Object.keys(callbackTable);
  registerWorkflowHotkeys({ searchWindow, workflowHotkeyTbl });

  for (const shortcut of shortcuts) {
    // Case of double key type
    const action = callbackTable[shortcut];

    registerShortcut(
      shortcut,
      shortcutCallbackTbl[action]({ preferenceWindow, searchWindow })
    );
  }

  // Currently, there is a bug that does not recognize normal keys, but only modifiers are recognized
  ioHook.on('keydown', e => {
    if (e.shiftKey) {
      doubleKeyPressHandler.shift();
    } else if (e.altKey) {
      doubleKeyPressHandler.alt();
    } else if (e.ctrlKey) {
      doubleKeyPressHandler.ctrl();
    } else if (e.metaKey) {
      doubleKeyPressHandler.cmd();
    }
  });
  ioHook.start();
};