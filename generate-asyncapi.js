const cds = require('@sap/cds');
const fs = require('fs');

async function generateAsyncAPI() {
    try {
        // Load the CDS model
        const csn = await cds.load('./srv');
        console.log('Loaded CSN:', JSON.stringify(csn, null, 2));

        // Prepare the AsyncAPI structure
        const asyncAPI = {
            asyncapi: '2.0.0',
            info: {
                title: 'CAP Events API',
                version: '1.0.0',
                description: 'API for CAP events'
            },
            channels: {},
            components: {
                messages: {},
                schemas: {
                    CloudEventHeaders: {
                        type: 'object',
                        properties: {
                            'ce-id': {
                                type: 'string',
                                description: 'Unique identifier for the event'
                            },
                            'ce-source': {
                                type: 'string',
                                description: 'URI identifying the context in which an event happened'
                            },
                            'ce-specversion': {
                                type: 'string',
                                description: 'The version of the CloudEvents specification'
                            },
                            'ce-type': {
                                type: 'string',
                                description: 'The type of the event'
                            },
                            'ce-time': {
                                type: 'string',
                                format: 'date-time',
                                description: 'Timestamp of when the event happened'
                            }
                        },
                        required: ['ce-id', 'ce-source', 'ce-specversion', 'ce-type']
                    }
                }
            }
        };

        // Iterate through all definitions in the CSN
        for (const [defName, def] of Object.entries(csn.definitions)) {
            if (def.kind === 'event') {
                const channelName = `ce/${def.namespace || 'default'}/${defName}/v1`;
                const messageName = `${defName}Message`;

                // Define the message in components
                asyncAPI.components.messages[messageName] = {
                    name: defName,
                    title: `${defName} Event`,
                    summary: `A ${defName} event`,
                    contentType: 'application/json',
                    headers: {
                        $ref: '#/components/schemas/CloudEventHeaders'
                    },
                    payload: {
                        type: 'object',
                        properties: {},
                        required: []
                    }
                };

                // Add properties for each element in the event
                for (const [elementName, element] of Object.entries(def.elements)) {
                    asyncAPI.components.messages[messageName].payload.properties[elementName] = {
                        type: mapCdsTypeToJsonType(element.type),
                        description: element.doc || `The ${elementName} of the event`
                    };
                    if (!element.is_nullable) {
                        asyncAPI.components.messages[messageName].payload.required.push(elementName);
                    }
                }

                // Reference the message in the channel
                asyncAPI.channels[channelName] = {
                    subscribe: {
                        message: {
                            $ref: `#/components/messages/${messageName}`
                        }
                    }
                };
            }
        }

        // Write the spec to a file
        fs.writeFileSync('asyncapi.json', JSON.stringify(asyncAPI, null, 2));
        console.log('AsyncAPI specification generated: asyncapi.json');
    } catch (error) {
        console.error('Error generating AsyncAPI specification:', error);
    }
}

function mapCdsTypeToJsonType(cdsType) {
    switch (cdsType) {
        case 'cds.String':
            return 'string';
        case 'cds.Integer':
            return 'integer';
        case 'cds.Double':
            return 'number';
        case 'cds.Boolean':
            return 'boolean';
        case 'cds.DateTime':
            return 'string'; // With format: date-time
        default:
            return 'string';
    }
}

generateAsyncAPI().catch(console.error);
