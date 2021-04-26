/* eslint-disable no-lonely-if */
import React, { useEffect, useState } from 'react';
import { Core } from 'wf-creator-core';
import { ipcRenderer } from 'electron';
import useKey from '../../use-key-capture/_dist/index';

type IndexInfo = {
  selectedItemIdx: number;
  itemStartIdx: number;
};

const useControl = ({
  items,
  maxItemCount,
  clearItems,
  commandManager
}: {
  items: any[];
  maxItemCount: number;
  clearItems: Function;
  commandManager: Core.CommandManager;
}) => {
  const { keyData, resetKeyData } = useKey();

  const [shouldBeHided, setShouldBeHided] = useState<boolean>(false);

  const [inputStr, setInputStr] = useState<string>('');
  const [indexInfo, setIndexInfo] = useState<IndexInfo>({
    itemStartIdx: 0,
    selectedItemIdx: 0
  });

  const clearInput = () => {
    setInputStr('');
    resetKeyData();
    commandManager.clearCommandStack();
    clearItems();
  };

  const clearIndexInfo = () => {
    setIndexInfo({
      itemStartIdx: 0,
      selectedItemIdx: 0
    });
  };

  const handleReturn = async (modifiers: any) => {
    try {
      const selectedItem = items[indexInfo.selectedItemIdx];
      if (selectedItem.type === 'scriptfilter') {
        setInputStr(selectedItem.command);

        try {
          commandManager.scriptFilterExcute(
            selectedItem.command,
            items[indexInfo.selectedItemIdx]
          );
        } catch (err) {
          console.error(err);
        }
      } else {
        await commandManager.commandExcute(selectedItem, inputStr, modifiers);
        setInputStr('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpArrow = () => {
    const selectedItemIdx =
      (indexInfo.selectedItemIdx - 1 + items.length) % items.length;

    if (selectedItemIdx === items.length - 1) {
      setIndexInfo({
        itemStartIdx: items.length - maxItemCount,
        selectedItemIdx: items.length - 1
      });
    } else if (indexInfo.itemStartIdx > selectedItemIdx) {
      setIndexInfo({
        itemStartIdx: indexInfo.itemStartIdx - 1,
        selectedItemIdx
      });
    } else {
      setIndexInfo({
        itemStartIdx: indexInfo.itemStartIdx,
        selectedItemIdx
      });
    }
  };

  const handleDownArrow = () => {
    const selectedItemIdx = (indexInfo.selectedItemIdx + 1) % items.length;
    if (selectedItemIdx === 0) {
      setIndexInfo({
        itemStartIdx: 0,
        selectedItemIdx: 0
      });
    } else if (indexInfo.itemStartIdx + maxItemCount <= selectedItemIdx) {
      setIndexInfo({
        itemStartIdx: indexInfo.itemStartIdx + 1,
        selectedItemIdx
      });
    } else {
      setIndexInfo({
        itemStartIdx: indexInfo.itemStartIdx,
        selectedItemIdx
      });
    }
  };

  const handleNormalInput = (
    input: string,
    updatedInput: string,
    modifiers: any
  ) => {
    setInputStr(updatedInput);

    // Assume withspace's default value is true
    if (items.length !== 0) {
      // When script filter is running
      const onScriptFilter = !commandManager.hasEmptyCommandStk();

      // When script filter should be running
      const goScriptFilterWithSpace =
        items[0].withspace === true &&
        updatedInput.includes(items[0].command) &&
        input !== ' ';

      const goScriptFilterWithoutSpace =
        items[0].withspace === false && updatedInput.includes(items[0].command);

      let commandOnStackIsEmpty;
      if (goScriptFilterWithSpace || goScriptFilterWithoutSpace) {
        commandOnStackIsEmpty = items[indexInfo.selectedItemIdx];
      }

      if (
        onScriptFilter ||
        goScriptFilterWithSpace ||
        goScriptFilterWithoutSpace
      ) {
        try {
          commandManager.scriptFilterExcute(
            updatedInput,
            commandOnStackIsEmpty
          );
        } catch (err) {
          throw new Error(`scriptFilterExcute throws Error. \n${err}`);
        }
      }
    }
  };

  const onScrollHandler = (e: any) => {
    if (e.deltaY > 0) {
      if (indexInfo.itemStartIdx + maxItemCount < items.length) {
        setIndexInfo({
          itemStartIdx: indexInfo.itemStartIdx + 1,
          selectedItemIdx: indexInfo.selectedItemIdx
        });
      }
    } else {
      if (indexInfo.itemStartIdx > 0) {
        setIndexInfo({
          itemStartIdx: indexInfo.itemStartIdx - 1,
          selectedItemIdx: indexInfo.selectedItemIdx
        });
      }
    }
  };

  const onMouseoverHandler = (index: number) => {
    setIndexInfo({
      itemStartIdx: indexInfo.itemStartIdx,
      selectedItemIdx: index
    });
  };

  const onDoubleClickHandler = (index: number) => {
    handleReturn({
      ctrl: false,
      shift: false,
      cmd: false
    });
  };

  const cleanUp = () => {
    clearInput();
    clearIndexInfo();
    setShouldBeHided(true);
  };

  const onKeydown = async () => {
    const input = keyData.key;
    let updatedInput = inputStr + input;

    const modifiers = {
      ctrl: keyData.isWithCtrl,
      shift: keyData.isWithShift,
      // On mac, cmd key is handled by meta;
      cmd: keyData.isWithMeta
    };

    if (keyData.isBackspace) {
      updatedInput = inputStr.substr(0, inputStr.length - 1);
      setInputStr(updatedInput);
    } else if (keyData.isEnter) {
      await handleReturn(modifiers);
    } else if (keyData.isArrowDown) {
      handleDownArrow();
    } else if (keyData.isArrowUp) {
      handleUpArrow();
    } else if (keyData.isEscape) {
      cleanUp();
    } else if (!keyData.isSpecialCharacter) {
      handleNormalInput(input, updatedInput, modifiers);
    }
  };

  useEffect(() => {
    ipcRenderer.on('hide-search-window-by-blur-event', () => {
      cleanUp();
    });
  }, []);

  useEffect(() => {
    // Ignore Initial Mount
    if (keyData.key === null) return;
    onKeydown();
  }, [keyData]);

  useEffect(() => {
    // After cleanUp
    if (shouldBeHided === true && items.length === 0) {
      // Give some time to remove Afterimage
      setTimeout(() => {
        ipcRenderer.send('hide-search-window');
      }, 10);
      setShouldBeHided(false);
    }
  }, [shouldBeHided, items]);

  return {
    inputStr,
    setInputStr,
    indexInfo,
    clearInput,
    clearIndexInfo,
    onScrollHandler,
    onMouseoverHandler,
    onDoubleClickHandler
  };
};

export default useControl;
