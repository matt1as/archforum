sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'se/bryderi/demo/sessions/test/integration/FirstJourney',
		'se/bryderi/demo/sessions/test/integration/pages/SessionsList',
		'se/bryderi/demo/sessions/test/integration/pages/SessionsObjectPage'
    ],
    function(JourneyRunner, opaJourney, SessionsList, SessionsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('se/bryderi/demo/sessions') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheSessionsList: SessionsList,
					onTheSessionsObjectPage: SessionsObjectPage
                }
            },
            opaJourney.run
        );
    }
);