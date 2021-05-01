import makeActionCreator from '../../utils/makeActionCreator';

export const actionTypes = {
  SET_DEBUGGING_ACTION_TYPE: '@advancedConfig/SET_DEBUGGING_ACTION_TYPE',
  SET_DEBUGGING_WORKFLOW_OUTPUT:
    '@advancedConfig/SET_DEBUGGING_WORKFLOW_OUTPUT',
  SET_DEBUGGING_WORKSTACK: '@advancedConfig/SET_DEBUGGING_WORKSTACK'
};

export const setDebuggingActionType = makeActionCreator(
  actionTypes.SET_DEBUGGING_ACTION_TYPE,
  'bool'
);

export const setDebuggingWorkflowOutput = makeActionCreator(
  actionTypes.SET_DEBUGGING_WORKFLOW_OUTPUT,
  'bool'
);

export const setDebuggingWorkstack = makeActionCreator(
  actionTypes.SET_DEBUGGING_WORKSTACK,
  'bool'
);