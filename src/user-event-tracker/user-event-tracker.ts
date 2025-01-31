export type LogEventAction =
  | {
      type: 'focusElement';
      element: string;
    }
  | {
      type: 'blurElement';
      element: string;
      text: string;
    }
  | {
      type: 'clickElement';
      element: string;
      text: string;
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
    };

export type UserEvent = {
  // time when the user event happens
  time: string;
  // current page that the user is on
  page: string;
} & LogEventAction;
