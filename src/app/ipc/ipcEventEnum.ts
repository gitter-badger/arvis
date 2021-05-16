/**
 * @summary Events sent from renderer process to main process
 */
export enum IPCRendererEnum {
  dispatchAction = '@ipcRenderer/dispatchAction',
  getSystemFont = '@ipcRenderer/getSystemFont',
  hideSearchWindow = '@ipcRenderer/hideSearchWindow',
  openWfConfFileDialog = '@ipcRenderer/openWfConfFileDialog',
  openYesnoDialog = '@ipcRenderer/openYesnoDialog',
  popupWorkflowItemMenu = '@ipcRenderer/popupWorkflowItemMenu',
  renewWorkflow = '@ipcRenderer/renewWorkflow',
  resizeSearchWindowHeight = '@ipcRenderer/resizeSearchWindowHeight',
  saveFile = '@ipcRenderer/saveFile',
  setGlobalShortcut = '@ipcRenderer/setGlobalShortcut',
  setSearchWindowWidth = '@ipcRenderer/setSearchWindowWidth',
  showErrorDialog = '@ipcRenderer/showErrorDialog',
  showNotification = '@ipcRenderer/showNotification',
}

/**
 * @summary Events sent from main process to renderer process
 */
export enum IPCMainEnum {
  fetchAction = '@ipcMain/fetchAction',
  getSystemFontRet = '@ipcMain/getSystemFontRet',
  hideSearchWindowByBlurEvent = '@ipcMain/hideSearchWindowByBlurEvent',
  openWfConfFileDialogRet = '@ipcMain/openWfConfFileDialogRet',
  openYesnoDialogRet = '@ipcMain/openYesnoDialogRet',
  renewWorkflow = '@ipcMain/renewWorkflow',
  renewPlugin = '@ipcMain/renewPlugin',
  saveFileRet = '@ipcMain/saveFileRet',
  searchWindowShowCallback = '@ipcMain/searchWindowShowCallback',
  setSearchbarInput = '@ipcMain/setSearchbarInput',
  toggleWorkflowEnabled = '@ipcMain/toggleWorkflowEnabled',
}
