namespace archforum.cap;

@AsyncAPI.Title        : 'Session Events'
@AsyncAPI.SchemaVersion: '1.0.0'
@AsyncAPI.Description  : 'Events emitted by the Session Service.'
@path: '/session'
service SessionService {
  @AsyncAPI.EventSpecVersion    : '1.0'

  @AsyncAPI.EventSchemaVersion       : '1.0.0'
    event TranslatedEvent : {
        title       : String;
        description : String;
        Uuid        : UUID;
    }
}
