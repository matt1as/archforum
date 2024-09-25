sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'se.bryderi.demo.sessions',
            componentId: 'SessionsList',
            contextPath: '/Sessions'
        },
        CustomPageDefinitions
    );
});