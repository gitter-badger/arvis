/* eslint-disable promise/always-return */
import React, { useEffect, useMemo, useState } from 'react';
import { Core } from 'wf-creator-core';
import { useDispatch, useSelector } from 'react-redux';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { SearchBar, SearchResultView } from '../../components';
import useSearchWindowControl from '../../hooks/useSearchWindowControl';
import { StateType } from '../../redux/reducers/types';
import { OuterContainer } from './components';
import { makeActionCreator } from '../../utils';

export default function SearchWindow() {
  const {
    icon_right_margin,
    item_background_color,
    item_font_color,
    item_height,
    item_left_padding,
    item_title_subtitle_margin,
    searchbar_font_color,
    searchbar_font_size,
    searchbar_height,
    search_window_footer_height,
    selected_item_background_color,
    selected_item_font_color,
    subtitle_font_size,
    title_font_size
  } = useSelector((state: StateType) => state.uiConfig);

  const { max_item_count_to_show, global_font } = useSelector(
    (state: StateType) => state.globalConfig
  );

  const {
    debugging_action_type,
    debugging_workflow_output,
    debugging_workstack
  } = useSelector((state: StateType) => state.advancedConfig);

  const [items, setItems] = useState<any>([]);

  const workManager = useMemo(
    () =>
      new Core.WorkManager({
        printActionType: debugging_action_type,
        printWorkStack: debugging_workstack,
        printWorkflowOutput: debugging_workflow_output
      }),
    [debugging_action_type, debugging_workflow_output, debugging_workstack]
  );

  const dispatch = useDispatch();

  const {
    setInputStr,
    indexInfo,
    getInputProps,
    onWheelHandler,
    onMouseoverHandler,
    onDoubleClickHandler,
    onItemPressHandler,
    onItemShouldBeUpdate,
    onWorkEndHandler,
    onInputShouldBeUpdate
  } = useSearchWindowControl({
    items,
    setItems,
    workManager,
    maxItemCount: max_item_count_to_show
  });

  const initializeCustomActions = () => {
    Core.registerCustomAction('notification', (action: any) => {
      ipcRenderer.send('show-notification', {
        title: action.title,
        body: action.text
      });
    });
  };

  const initilizeSearchWindowIPCHandler = () => {
    // Used to receive dispatched action from different window
    ipcRenderer.on(
      'fetch-action',
      (
        evt: IpcRendererEvent,
        { actionType, args }: { actionType: string; args: any }
      ) => {
        dispatch(makeActionCreator(actionType, 'arg')(args));
      }
    );
  };

  useEffect(() => {
    workManager.onItemPressHandler = onItemPressHandler;
    workManager.onItemShouldBeUpdate = onItemShouldBeUpdate;
    workManager.onWorkEndHandler = onWorkEndHandler;
    workManager.onInputShouldBeUpdate = onInputShouldBeUpdate;

    initializeCustomActions();
    initilizeSearchWindowIPCHandler();
  }, []);

  return (
    <OuterContainer
      style={{
        backgroundColor: item_background_color,
        fontFamily: global_font
      }}
      onWheel={onWheelHandler}
    >
      <SearchBar
        alwaysFocus
        setInputStr={setInputStr}
        getInputProps={getInputProps}
        itemBackgroundColor={item_background_color}
        itemLeftPadding={item_left_padding}
        searchbarFontSize={searchbar_font_size}
        searchbarHeight={searchbar_height}
        searchbarFontColor={searchbar_font_color}
      />
      <SearchResultView
        demo={false}
        searchResult={items}
        startIdx={indexInfo.itemStartIdx}
        selectedItemIdx={indexInfo.selectedItemIdx}
        onDoubleClickHandler={onDoubleClickHandler}
        onMouseoverHandler={onMouseoverHandler}
        itemHeight={item_height}
        footerHeight={search_window_footer_height}
        searchbarHeight={searchbar_height}
        maxItemCount={max_item_count_to_show}
        iconRightMargin={icon_right_margin}
        itemBackgroundColor={item_background_color}
        itemFontColor={item_font_color}
        itemLeftPadding={item_left_padding}
        itemTitleSubtitleMargin={item_title_subtitle_margin}
        selectedItemBackgroundColor={selected_item_background_color}
        selectedItemFontColor={selected_item_font_color}
        subtitleFontSize={subtitle_font_size}
        titleFontSize={title_font_size}
      />
    </OuterContainer>
  );
}
