/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-lonely-if */
import React, { useEffect, useRef, useState } from 'react';
import { clipboard, ipcRenderer } from 'electron';
import { isWithCtrlOrCmd } from '@utils/index';
import { IPCRendererEnum } from '@ipc/ipcEventEnum';
import useKey from '../../use-key-capture/src';

type IndexInfo = {
  selectedItemIdx: number;
  itemStartIdx: number;
};

/**
 * @param {any[]} items
 * @param {(items: any[]) => void} setItems
 * @param {number} maxShowOnScreen
 */
const useClipboardHistoryWindowControl = ({
  items,
  setItems,
  originalItems,
  maxShowOnScreen,
  maxShowOnWindow,
  isPinned,
}: {
  items: any[];
  setItems: (items: any[]) => void;
  originalItems: any[];
  maxShowOnScreen: number;
  maxShowOnWindow: number;
  isPinned: boolean;
}) => {
  const { keyData, getTargetProps } = useKey();
  const { originalRef: inputRef } = getTargetProps();

  const [indexInfo, setIndexInfo] = useState<IndexInfo>({
    itemStartIdx: 0,
    selectedItemIdx: 0,
  });

  const originalItemsRef = useRef<any[]>(originalItems);
  const maxShowOnWindowRef = useRef<number>(maxShowOnWindow);

  /**
   * @summary
   */
  const clearIndexInfo = () => {
    setIndexInfo({
      itemStartIdx: 0,
      selectedItemIdx: 0,
    });
  };

  /**
   * @return {number} changed selectedItemIdx
   * @summary
   */
  const handleUpArrow = () => {
    let selectedItemIdx =
      (indexInfo.selectedItemIdx - 1 + items.length) % items.length;

    // Select most bottom item
    if (selectedItemIdx === items.length - 1 && items.length !== 1) {
      selectedItemIdx = items.length - 1;

      const itemStartIdx =
        items.length - maxShowOnScreen >= 0
          ? items.length - maxShowOnScreen
          : 0;

      setIndexInfo({
        itemStartIdx,
        selectedItemIdx,
      });
    }
    // Select up
    else if (indexInfo.itemStartIdx > selectedItemIdx) {
      setIndexInfo({
        itemStartIdx: indexInfo.itemStartIdx - 1,
        selectedItemIdx,
      });
    } else {
      setIndexInfo({
        itemStartIdx: indexInfo.itemStartIdx,
        selectedItemIdx,
      });
    }

    return selectedItemIdx;
  };

  /**
   * @return {number} changed selectedItemIdx
   * @summary
   */
  const handleDownArrow = () => {
    const selectedItemIdx = (indexInfo.selectedItemIdx + 1) % items.length;

    // Select most upper item
    if (selectedItemIdx === 0) {
      clearIndexInfo();
    }
    // Select down
    else if (indexInfo.itemStartIdx + maxShowOnScreen <= selectedItemIdx) {
      setIndexInfo({
        itemStartIdx: indexInfo.itemStartIdx + 1,
        selectedItemIdx,
      });
    } else {
      setIndexInfo({
        itemStartIdx: indexInfo.itemStartIdx,
        selectedItemIdx,
      });
    }

    return selectedItemIdx;
  };

  /**
   * @param {string} pressedKey
   * @param {string} updatedInput
   */
  const handleNormalInput = async (
    _originalItems: any[],
    pressedKey: string,
    updatedInput: string,
    _maxShowOnWindow: number
  ) => {
    // No need to run when clipboard history window shows up
    if (pressedKey === 'c' && updatedInput === '') return;

    const newItems = [];
    for (const item of _originalItems) {
      if (item.title.toLowerCase().includes(updatedInput.toLowerCase())) {
        newItems.push(item);
      }
    }

    clearIndexInfo();
    setItems(newItems.slice(0, _maxShowOnWindow));
  };

  /**
   * @param  {string} str
   * @param  {needItemsUpdate} boolean
   */
  const setInputStr = (str: string) => {
    if (inputRef && inputRef.current) {
      (inputRef.current! as HTMLInputElement).value = str;
    }
  };

  /**
   * @param {number} selectedItemIdx
   * @param {any} modifiers Selected modifier keys
   */
  const handleReturn = ({
    selectedItemIdx,
    modifiers,
  }: {
    selectedItemIdx: number;
    modifiers: any;
  }) => {
    if (items[selectedItemIdx]) {
      clipboard.writeText(items[selectedItemIdx].title);

      ipcRenderer.send(IPCRendererEnum.hideClipboardHistoryWindow);
      // Find new method to dispatching key to os

      setTimeout(() => {
        ipcRenderer.send(IPCRendererEnum.triggerKeyDownEvent, {
          key: 'v',
          modifiers:
            process.platform === 'darwin'
              ? JSON.stringify(['command'])
              : JSON.stringify(['control']),
        });
      }, 25);
    }
  };

  /**
   * @summary mouse wheel event handler
   */
  const onWheelHandler = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY > 0) {
      if (indexInfo.itemStartIdx + maxShowOnScreen < items.length) {
        setIndexInfo({
          itemStartIdx: indexInfo.itemStartIdx + 1,
          selectedItemIdx: indexInfo.selectedItemIdx,
        });
      }
    } else {
      if (indexInfo.itemStartIdx > 0) {
        setIndexInfo({
          itemStartIdx: indexInfo.itemStartIdx - 1,
          selectedItemIdx: indexInfo.selectedItemIdx,
        });
      }
    }
  };

  /**
   * @param {number} index
   */
  const onMouseoverHandler = (index: number) => {
    setIndexInfo({
      itemStartIdx: indexInfo.itemStartIdx,
      selectedItemIdx: index,
    });
  };

  /**
   * @param {number} index
   */
  const onDoubleClickHandler = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.preventDefault();

    handleReturn({
      selectedItemIdx: indexInfo.selectedItemIdx,
      modifiers: {
        cmd: e.metaKey,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
      },
    });
  };

  /**
   * @param {number} selectedItemIdx
   */
  const onHandleReturnByNumberKey = (selectedItemIdx: number) => {
    if (selectedItemIdx === 0 || selectedItemIdx >= items.length) {
      return;
    }

    handleReturn({
      selectedItemIdx: selectedItemIdx - 1,
      modifiers: {
        cmd: false,
        ctrl: false,
        shift: false,
        alt: false,
      },
    });
  };

  /**
   * @param {KeyboardEvent} e
   */
  const onKeyupHandler = (e: KeyboardEvent) => {
    const exceptionKeys = [
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Control',
      'Meta',
      'Alt',
      'Shift',
      'CapsLock',
      'Tab',
      'Escape',
    ];

    // For quicklook feature, prevent adding space when quicklook shortcut is pressed
    if (e.shiftKey && e.key === ' ') {
      return;
    }

    if (!exceptionKeys.includes(e.key)) {
      const txt = (inputRef.current! as HTMLInputElement).value!
        ? (inputRef.current! as HTMLInputElement).value
        : '';

      handleNormalInput(
        originalItemsRef.current,
        e.key,
        txt,
        maxShowOnWindowRef.current
      );
    }
  };

  /**
   * @param {any} item
   */
  const itemCopyHandler = (item: any) => {
    if (!item) return;
    clipboard.writeText(item.title);
  };

  /**
   * @summary
   */
  const onKeydownHandler = async () => {
    const input: string | undefined | null = keyData.key;

    const modifiers = {
      // On mac, cmd key is handled by meta;
      cmd: keyData.isWithMeta,
      ctrl: keyData.isWithCtrl,
      shift: keyData.isWithShift,
      alt: keyData.isWithAlt,
    };

    let { selectedItemIdx } = indexInfo;

    const ctrlOrCmdKeyPressed = isWithCtrlOrCmd({
      isWithCmd: keyData.isWithMeta,
      isWithCtrl: keyData.isWithCtrl,
    });

    const searchByNextInput = () =>
      setTimeout(
        () =>
          handleNormalInput(
            originalItemsRef.current,
            '',
            (document.getElementById('searchBar') as HTMLInputElement).value,
            maxShowOnWindowRef.current
          ),
        25
      );

    if (keyData.isNumber && (modifiers.cmd || modifiers.ctrl)) {
      onHandleReturnByNumberKey(Number(input));
    } else if (keyData.isEnter) {
      handleReturn({
        selectedItemIdx,
        modifiers,
      });
    } else if (keyData.isArrowDown) {
      selectedItemIdx = handleDownArrow();
    } else if (keyData.isArrowUp) {
      selectedItemIdx = handleUpArrow();
    } else if (keyData.isEscape) {
      if (!isPinned) {
        ipcRenderer.send(IPCRendererEnum.hideClipboardHistoryWindow);
      }
    } else if (ctrlOrCmdKeyPressed && input && input.toUpperCase() === 'C') {
      itemCopyHandler(items[selectedItemIdx]);
    } else if (ctrlOrCmdKeyPressed && input && input.toUpperCase() === 'V') {
      searchByNextInput();
    } else if (ctrlOrCmdKeyPressed && input && input.toUpperCase() === 'Z') {
      searchByNextInput();
    }
  };

  useEffect(() => {
    maxShowOnWindowRef.current = maxShowOnWindow;
    originalItemsRef.current = originalItems;
  });

  useEffect(() => {
    if (inputRef.current) {
      (inputRef.current! as HTMLInputElement).onkeyup = onKeyupHandler;
    }
  }, []);

  useEffect(() => {
    // Ignore Initial Mount
    if (keyData.key === null) return;

    onKeydownHandler();
  }, [keyData]);

  return {
    setInputStr,
    clearIndexInfo,
    indexInfo,
    onWheelHandler,
    onMouseoverHandler,
    onDoubleClickHandler,
    getInputProps: getTargetProps,
  };
};

export default useClipboardHistoryWindowControl;