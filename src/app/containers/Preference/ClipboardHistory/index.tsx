/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, FormGroup, Label } from 'reactstrap';
import { StyledInput, HotkeyRecordForm } from '@components/index';
import { actionTypes as ClipboardHistoryActionTypes } from '@redux/actions/clipboardHistory';
import { StateType } from '@redux/reducers/types';
import {
  onNumberChangeHandler,
  createGlobalConfigChangeHandler,
} from '@utils/index';
import { OuterContainer, FormDescription } from './components';
import { formGroupStyle, labelStyle } from './style';

export default function ClipboardHistory() {
  const { hotkey, max_size, max_show } = useSelector(
    (state: StateType) => state.clipboard_history
  );

  const dispatch = useDispatch();

  const configChangeHandler = (destWindow: string) =>
    createGlobalConfigChangeHandler({
      destWindow,
      dispatch,
    });

  const hotkeyChangeHandler = (e: React.FormEvent<HTMLInputElement>) => {
    configChangeHandler('searchWindow')(
      e,
      ClipboardHistoryActionTypes.SET_CLIPBOARD_MANAGER_WINDOW_HOTKEY
    );
  };

  return (
    <OuterContainer>
      <Form>
        <FormGroup style={formGroupStyle}>
          <Label style={labelStyle}>Clipboard History Hotkey</Label>
          <HotkeyRecordForm
            hotkey={hotkey}
            onHotkeyChange={hotkeyChangeHandler}
          />
          <FormDescription>
            Select the form and type the hotkey
            <br />
            you would like to use to show Clipboard History
          </FormDescription>
        </FormGroup>
        <FormGroup style={formGroupStyle}>
          <Label style={labelStyle}>Maximum log count to store</Label>
          <StyledInput
            type="number"
            min={0}
            max={99999}
            defaultValue={max_size}
            onBlur={(e: React.FormEvent<HTMLInputElement>) =>
              onNumberChangeHandler(e, {
                min: 0,
                max: 99999,
                actionType:
                  ClipboardHistoryActionTypes.SET_MAX_CLIPBOARD_STORE_SIZE,
                dispatch,
                destWindow: 'clipboardHistoryWindow',
              })
            }
          />
        </FormGroup>
        <FormGroup style={formGroupStyle}>
          <Label style={labelStyle}>Maximum log count to show</Label>
          <StyledInput
            type="number"
            min={0}
            max={500}
            defaultValue={max_show}
            onBlur={(e: React.FormEvent<HTMLInputElement>) =>
              onNumberChangeHandler(e, {
                min: 0,
                max: 500,
                actionType: ClipboardHistoryActionTypes.SET_MAX_SHOW_SIZE,
                dispatch,
                destWindow: 'clipboardHistoryWindow',
              })
            }
          />
        </FormGroup>
      </Form>
    </OuterContainer>
  );
}