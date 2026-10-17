REVOKE EXECUTE ON FUNCTION
  public.submit_chat_followup(text, text, text, text)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
  public.submit_chat_followup(text, text, text, text)
  TO service_role;
