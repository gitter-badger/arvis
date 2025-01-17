import { IpcMainEvent } from 'electron';
import { ClipboardHistoryWindowContextMenu } from '../../../components/contextMenus';

/**
 * @param  {string} path
 * @summary Used to popup context menu
 */
export const popupClipboardHistoryContextMenu = (
  e: IpcMainEvent,
  { isPinned }: { isPinned: boolean }
) => {
  new ClipboardHistoryWindowContextMenu({ isPinned }).popup();
};
