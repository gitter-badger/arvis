import { IpcMainEvent } from 'electron';
import { IPCMainEnum } from '../../ipcEventEnum';
import { externalEnvs } from '../../../config/externalEnvs';
import { getDestWindow } from '../../getDestWindow';

/**
 * @summary
 */
export const getElectronEnvs = (
  e: IpcMainEvent,
  { sourceWindow }: { sourceWindow: string }
) => {
  getDestWindow(sourceWindow).webContents.send(IPCMainEnum.getElectronEnvsRet, {
    externalEnvs: JSON.stringify(externalEnvs),
  });
};
