import { Sessions, Session } from "#cds-models/archforum/cap";

import cds from '@sap/cds';
const { Translate } = require('@google-cloud/translate').v2;

// Function to translate text
async function translateText(title : string, description : string, targetLanguage = '6N') {
  try {
    const translate = new Translate();
    const [translation] = await translate.translate([title, description], targetLanguage);
    return translation;
  } catch (error) {
    return [title, description]; // Return original text if translation fails
  }
}

module.exports = cds.service.impl(async function () {
  // "messagingQueue" is described in the package.json
  const messaging = await cds.connect.to('messaging');
  console.log("connected")

  // Queue Subscriptions
  /***********************/

  // listens for events in "$namespace/processOnReceiver1" topic stored in the queue specified in the package.json
  await messaging.on(`ce/archforum/ZFORUMxSESSION/DELETED/v1`, async (msg: any) => {
    console.log('Session deleted: ', msg.data);
    await DELETE(Sessions).where({ externalId: msg.data.Uuid })
});

  await messaging.on(`ce/archforum/ZFORUMxSESSION/CREATED/v1`, async (msg: any) => {
    const translatedText = await translateText( msg.data.title , msg.data.description, 'en');

    const tx = cds.transaction();

    try {
      // Insert the main session entity
      const session : Session = {
        externalId: msg.data.Uuid,
        title: msg.data.title,
        descr: msg.data.description,
        date: msg.data.Date
      };
  
      const result = await tx.run(INSERT.into(Sessions).entries(session));
      const entries = [...result]
      // Insert translations
      const translations = [
        { locale: 'en', title: translatedText[0], descr: translatedText[1] },
        { locale: '6N', title: translatedText[0], descr: translatedText[1] },

      ];
  
      for (const translation of translations) {
        // @ts-ignore
        await tx.run(INSERT.into(Sessions.texts).entries({
          ID: entries[0].ID,  // Assuming 'ID' is the key of your Sessions entity
          locale: translation.locale,
          title: translation.title,
          descr: translation.descr
        }));
      }
  
      await tx.commit();
      console.log('Session created with translations');
      return result;
  
    } catch (error) {
      await tx.rollback();
      console.error('Error creating session with translations:', error);
      throw error;
    }
  });  

  await messaging.on(`ce/archforum/ZFORUMxSESSION/UPDATED/v1`, async (msg: any ) => {
    const translatedText = await translateText( msg.data.title , msg.data.description, '6N');

    const session : Session = {
      externalId: msg.data.Uuid,
      title: msg.data.title,
      descr : msg.data.description,
      date: msg.data.Date,  
   }

   // find if session exists using externalId
   const existingSession = await SELECT.one.from(Sessions).where({ externalId: msg.data.Uuid });

   if (existingSession) {
    // update session
    await UPDATE(Sessions, existingSession.ID).with(session);
  } else {
     // create session
     await INSERT (session).into(Sessions);
    }
  });
  
});

