import { AdvancedConfigActions } from '../actions';
import { StateType } from './types';

const { actionTypes: AdvancedConfigActionTypes } = AdvancedConfigActions;

export default (state = {}, action: any) => {
  const { type, payload } = action;
  switch (type) {
    case AdvancedConfigActionTypes.SET_DEBUGGING_ACTION_TYPE:
      return {
        ...state,
        debugging_action_type: payload.arg
      };
    case AdvancedConfigActionTypes.SET_DEBUGGING_WORKFLOW_OUTPUT:
      return {
        ...state,
        debugging_workflow_output: payload.arg
      };
    case AdvancedConfigActionTypes.SET_DEBUGGING_WORKSTACK:
      return {
        ...state,
        debugging_workstack: payload.arg
      };
    case AdvancedConfigActionTypes.SET_DEBUGGING_ARGS:
      return {
        ...state,
        debugging_args: payload.arg
      };
    case AdvancedConfigActionTypes.SET_DEBUGGING_SCRIPTFILTER:
      return {
        ...state,
        debugging_scriptfilter: payload.arg
      };
    default:
      return state;
  }
};

export function getIsOnDebuggingActionType(state: StateType) {
  return state.advancedConfig.debugging_action_type;
}

export function getIsOnDebuggingWorkflowOutput(state: StateType) {
  return state.advancedConfig.debugging_workflow_output;
}

export function getIsOnDebuggingWorkflowStack(state: StateType) {
  return state.advancedConfig.debugging_workstack;
}

export function getIsOnDebuggingArgs(state: StateType) {
  return state.advancedConfig.debugging_args;
}

export function getIsOnDebuggingScriptfilter(state: StateType) {
  return state.advancedConfig.debugging_scriptfilter;
}