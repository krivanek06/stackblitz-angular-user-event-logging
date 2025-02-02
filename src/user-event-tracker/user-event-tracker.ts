export type LogEventAction =
  | {
      type: 'inputChange';
      elementType: string;
      elementLabel: string;
      value: string | boolean | number;
    }
  | {
      type: 'clickElement';
      elementType: string;
      value: string;
    }
  | {
      type: 'openDialog';
      componentName: string;
    }
  | {
      type: 'closeDialog';
    }
  | {
      type: 'routerChange';
      text: string;
    }
  | {
      type: 'apiCall';
      url: string;
    }
  | {
      type: 'apiResponse';
      url: string;
      status: number;
    }
  | {
      type: 'formSubmitValid';
      values: Record<string, string>;
    }
  | {
      type: 'formSubmitInvalid';
      values: Record<string, string>;
      fieldValidity: unknown;
    }
  | {
      type: 'custom';
      value: unknown;
      information?: string;
    };

export type UserEvent = {
  // time when the user event happens
  time: string;
  // current page that the user is on
  page: string;
} & LogEventAction;
