import { IpcMainEvent } from 'electron';
import { getDestWindow } from '../getDestWindow';
import { IPCMainEnum } from '../ipcEventEnum';

/**
 * @param  {string} destWindow?
 * @param  {string} bundleId?
 */
export const reloadPlugin = (
  e: IpcMainEvent,
  arg: { destWindow?: string; bundleId?: string } | undefined
) => {
  if (arg && arg.destWindow) {
    getDestWindow(arg.destWindow).webContents.send(IPCMainEnum.reloadPlugin, {
      bundleId: arg.bundleId,
    });
  } else {
    getDestWindow('searchWindow').webContents.send(IPCMainEnum.reloadPlugin, {
      bundleId: arg ? arg.bundleId : undefined,
    });
    getDestWindow('preferenceWindow').webContents.send(
      IPCMainEnum.reloadPlugin,
      {
        bundleId: arg ? arg.bundleId : undefined,
      }
    );
  }
};
