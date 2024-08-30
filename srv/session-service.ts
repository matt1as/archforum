const cds = require('@sap/cds');
const { message } = require('@sap/cds/lib/log/cds-error');

const { Translate } = require('@google-cloud/translate').v2;

// Function to translate text
async function translateText(title : string, description : string, targetLanguage = 'en') {
  try {
    const translate = new Translate();
    console.log("Translating text: ", JSON.stringify({title, description}))
    const [translation] = await translate.translate([title, description], targetLanguage);
    console.log("Text translated: ", JSON.stringify(translation))
    return translation;
  } catch (error) {
    console.error('Error translating text:', error);
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
  await messaging.on(`ce/archforum/ZFORUMxSESSION/DELETED/v1`, (msg: any) =>
    console.log('Session deleted: ', msg.data)
  );

  await messaging.on(`ce/archforum/ZFORUMxSESSION/CREATED/v1`, async (msg: any) => {
    const translatedText = await translateText( msg.data.title , msg.data.description, 'en');
    const topic = 'cap/000/description/translated'
    const payload = { Uuid: msg.data.Uuid , 'title' : translatedText[0], 'description' : translatedText[1]  }
    messaging.emit(topic, payload )
  }
  );

  await messaging.on(`ce/archforum/ZFORUMxSESSION/UPDATED/v1`, async (msg: any ) => {
    const translatedText = await translateText( msg.data.title , msg.data.description, 'en');

    const event = {
      type: 'archforum.cap',
      data: {
        Uuid: msg.data.Uuid,
        title : translatedText[0],
        description: translatedText[1]
      }
    }
    const topic = 'cap/000/description/translated'
    messaging.emit(topic, event)  
  });
  
});

