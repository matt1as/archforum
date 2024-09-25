sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'se.bryderi.demo.sessions',
            componentId: 'SessionsObjectPage',
            contextPath: '/Sessions'
        },
        CustomPageDefinitions
    );
});