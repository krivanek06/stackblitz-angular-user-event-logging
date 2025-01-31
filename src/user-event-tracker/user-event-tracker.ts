export type LogEventAction =
  | {
      type: 'buttonClick';
      text: string;
    }
  | {
      type: 'anchorClick';
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
      type: 'formControlClick';
      name: string;
    }
  | {
      type: 'activeCheckOrRadio';
      name: string;
      isChecked: boolean;
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
