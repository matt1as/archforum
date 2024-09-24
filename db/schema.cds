using {  managed, User  } from '@sap/cds/common';
namespace archforum.cap;

@readonly entity Sessions : managed { 
  key ID : UUID;
  title  : localized String(111);
  descr  : localized String(1111);
  date   : Date;
  externalId : UUID;
  createdAt  : Timestamp @cds.on.insert: $now;
  createdBy  : User      @cds.on.insert: $user;
  modifiedAt : Timestamp @cds.on.insert: $now  @cds.on.update: $now;
  modifiedBy : User      @cds.on.insert: $user @cds.on.update: $user;

}

annotate Sessions with @(
    requires: 'Sessions.read',
    UI.LineItem : [
        {Value: title, Label: 'Title'},
        {Value: descr, Label: 'Description'},
        {Value: date, Label: 'Date'}, 
    ]
);