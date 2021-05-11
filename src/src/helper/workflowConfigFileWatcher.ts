import chokidar from 'chokidar';
import { Core } from 'arvis-core';
import path from 'path';
import { BrowserWindow } from 'electron';
import { IPCMainEnum } from '../ipc/ipcEventEnum';

export const startFileWatcher = ({
  searchWindow,
  preferenceWindow,
}: {
  searchWindow: BrowserWindow;
  preferenceWindow: BrowserWindow;
}) => {
  /**
   * @param  {string} bundleId?
   * @summary Update singleton for each Windows
   */
  const requestRenewWorkflows = (bundleId?: string) => {
    searchWindow.webContents.send(IPCMainEnum.renewWorkflow, { bundleId });
    preferenceWindow.webContents.send(IPCMainEnum.renewWorkflow, {
      bundleId,
    });
  };

  /**
   * @param  {string} arvisWorkflowConfigFilePath
   */
  const getBundleIdFromFilePath = (arvisWorkflowConfigFilePath: string) => {
    const pathArrs = arvisWorkflowConfigFilePath.split(path.sep);
    pathArrs.pop();
    return pathArrs.pop();
  };

  /**
   * @summary Initialize watcher.
   *          It detects workflow config file change and
   *          loads new workflow config file if it detects a change.
   */
  chokidar
    .watch(
      `${Core.path.workflowInstallPath}${path.sep}**${path.sep}arvis-workflow.json`,
      {
        persistent: true,
        ignoreInitial: true,
        followSymlinks: false,
      }
    )
    .on('change', (filePath: string) => {
      console.log(`"${filePath}" changed. Reload workflows settings..`);
      requestRenewWorkflows(getBundleIdFromFilePath(filePath));
    })
    .on('unlink', (filePath: string) => {
      console.log(`"${filePath}" unlinked. Reload workflows settings..`);
      requestRenewWorkflows();
    })
    .on('add', (filePath: string) => {
      console.log(`"${filePath}" added. Reload workflows settings..`);
      requestRenewWorkflows();
    });
};
