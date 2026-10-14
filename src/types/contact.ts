export type ContactFieldName = 'name' | 'email' | 'message' | 'company' | 'phone';

export type ContactValues = Record<ContactFieldName, string>;

export type ContactErrors = Partial<Record<ContactFieldName, string>>;

/** idle: editing · submitting: sending · error: server did not accept it · success: sent */
export type ContactStatus = 'idle' | 'submitting' | 'error' | 'success';

export type ContactFieldConfig = {
  name: ContactFieldName;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea';
  autoComplete: string;
  required: boolean;
};