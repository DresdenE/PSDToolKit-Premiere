// time display types
var TIMEDISPLAY_24Timecode				= 100;
var TIMEDISPLAY_25Timecode				= 101;
var TIMEDISPLAY_2997DropTimecode		= 102;
var TIMEDISPLAY_2997NonDropTimecode		= 103;
var TIMEDISPLAY_30Timecode				= 104;
var TIMEDISPLAY_50Timecode				= 105;
var TIMEDISPLAY_5994DropTimecode		= 106;
var TIMEDISPLAY_5994NonDropTimecode		= 107;
var TIMEDISPLAY_60Timecode				= 108;
var TIMEDISPLAY_Frames					= 109;
var TIMEDISPLAY_23976Timecode			= 110;
var TIMEDISPLAY_16mmFeetFrames			= 111;
var TIMEDISPLAY_35mmFeetFrames			= 112;
var TIMEDISPLAY_48Timecode				= 113;
var TIMEDISPLAY_AudioSamplesTimecode	= 200;
var TIMEDISPLAY_AudioMsTimecode			= 201;

var KF_Interp_Mode_Linear				= 0;
var KF_Interp_Mode_Hold					= 4;
var KF_Interp_Mode_Bezier				= 5;
var KF_Interp_Mode_Time					= 6;

// field type constants
var FIELDTYPE_Progressive	= 0;
var FIELDTYPE_UpperFirst	= 1;
var FIELDTYPE_LowerFirst	= 2;

// audio channel types
var AUDIOCHANNELTYPE_Mono			= 0;
var AUDIOCHANNELTYPE_Stereo			= 1;
var AUDIOCHANNELTYPE_51				= 2;
var AUDIOCHANNELTYPE_Multichannel	= 3;
var AUDIOCHANNELTYPE_4Channel		= 4;
var AUDIOCHANNELTYPE_8Channel		= 5;

// vr projection type
var VRPROJECTIONTYPE_None				= 0;
var VRPROJECTIONTYPE_Equirectangular	= 1;

// vr stereoscopic type
var VRSTEREOSCOPICTYPE_Monoscopic		= 0;
var VRSTEREOSCOPICTYPE_OverUnder		= 1;
var VRSTEREOSCOPICTYPE_SideBySide		= 2;

// constants used when clearing cache
var MediaType_VIDEO		= "228CDA18-3625-4d2d-951E-348879E4ED93"; // Magical constants from Premiere Pro's internal automation.
var MediaType_AUDIO		= "80B8E3D5-6DCA-4195-AEFB-CB5F407AB009";
var MediaType_ANY		= "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF";

var MediaType_Audio = 0;	// Constants for working with setting value.
var MediaType_Video = 1;

var Colorspace_601 		= 0;
var Colorspace_709 		= 1;
var Colorspace_2020		= 2;
var Colorspace_2100HLG	= 3;

var BitPrecision_8bit	= 0;
var BitPrecision_10bit	= 1;
var BitPrecision_Float	= 2;
var BitPrecision_HDR	= 3;

var NOT_SET = "-400000";

$._PPP_ = {
    updateEventPanel : function (message) {
        app.setSDKEventMessage(message, 'info');
    },

    getVersionInfo : function () {
        return 'PPro ' + app.version + 'x' + app.build;
    },

    getActiveSequenceName : function () {
        if (app.project.activeSequence) {
            return app.project.activeSequence;
        } else {
            return "No active sequence.";
        }
    },

    keepPanelLoaded : function () {
        // 0, while testing (to enable rapid reload); 1 for "Never unload me, even when not visible."
        app.setExtensionPersistent("com.adobe.PProPanel", 0);
    },

    disableImportWorkspaceWithProjects : function () {
        var prefToModify = 'FE.Prefs.ImportWorkspace';
        var propertyValue = app.properties.getProperty(prefToModify);

        app.properties.setProperty(prefToModify, "0", 1, false);
        var safetyCheck = app.properties.getProperty(prefToModify);
        if (safetyCheck != propertyValue) {
            $._PPP_.updateEventPanel("Changed \'Import Workspaces with Projects\' from " + propertyValue + " to " + safetyCheck + ".");
        }
    },

    registerProjectPanelSelectionChangedFxn : function () {
        app.bind("onSourceClipSelectedInProjectPanel", $._PPP_.projectPanelSelectionChanged);
    },

    projectPanelSelectionChanged : function (eventObj) { // Note: This message is also triggered when the user opens or creates a new project.
        var message = "";
        var projectItems = eventObj;
        if (projectItems) {
            if (projectItems.length) {
                var remainingArgs = projectItems.length;
                var view = eventObj.viewID;
                message = remainingArgs + " items selected: ";

                for (var i = 0; i < projectItems.length; i++) {		// Concatenate selected project item names, into message.
                    message += projectItems[i].name;
                    remainingArgs--;
                    if (remainingArgs > 1) {
                        message += ', ';
                    }
                    if (remainingArgs === 1) {
                        message += ", and ";
                    }
                    if (remainingArgs === 0) {
                        message += ".";
                    }
                }
            } else {
                message = 'No items selected.';
            }
        }
        $._PPP_.updateEventPanel(message);
    },

    registerItemAddedFxn : function () {
        app.onItemAddedToProjectSuccess = $._PPP_.onItemAddedToProject;
    },

    onItemAddedToProject : function (whichProject, addedProjectItem) {
        var msg = addedProjectItem.name + " was added to " + whichProject + ".";
        $._PPP_.updateEventPanel(msg);
    },

    registerProjectChangedFxn : function () {
        app.bind('onProjectChanged', $._PPP_.myOnProjectChanged);
    },

    myOnProjectChanged : function (documentID) {
        var msg = 'Project with ID ' + documentID + ' changed, in some way.';
        $._PPP_.updateEventPanel(msg);
    },

    registerSequenceSelectionChangedFxn : function () {
        var success = app.bind('onActiveSequenceSelectionChanged', $._PPP_.myActiveSequenceSelectionChangedFxn);
    },

    myActiveSequenceSelectionChangedFxn : function () {
        var seq = app.project.activeSequence;
        if (seq) {
            var sel = seq.getSelection();
            if (sel) {
                $._PPP_.updateEventPanel(sel.length + ' track items selected in ' + app.project.activeSequence.name + '.');
                for (var i = 0; i < sel.length; i++) {
                    if (sel[i].name !== 'anonymous') {
                        $._PPP_.updateEventPanel('Selected item ' + (i + 1) + ' == ' + sel[i].name + '.');
                    }
                }
            } else {
                $._PPP_.updateEventPanel('No clips selected.');
            }
        } else {
            $._PPP_.updateEventPanel('No active sequence.');
        }
    },

    registerSequenceActivatedFxn : function () {
        var success = app.bind('onSequenceActivated', $._PPP_.mySequenceActivatedFxn);
    },

    myActiveSequenceSelectionChangedFxn : function () {
        var seq = app.project.activeSequence;
        if (seq) {
            var sel = seq.getSelection();
            if (sel) {
                $._PPP_.updateEventPanel(sel.length + ' track items selected in ' + app.project.activeSequence.name + '.');
                for (var i = 0; i < sel.length; i++) {
                    if (sel[i].name !== 'anonymous') {
                        $._PPP_.updateEventPanel('Selected item ' + (i + 1) + ' == ' + sel[i].name + '.');
                    }
                }
            } else {
                $._PPP_.updateEventPanel('No clips selected.');
            }
        } else {
            $._PPP_.updateEventPanel('No active sequence.');
        }
    },

    registerActiveSequenceStructureChangedFxn : function () {
        var success = app.bind("onActiveSequenceStructureChanged", $._PPP_.myActiveSequenceStructureChangedFxn);
    },

    myActiveSequenceStructureChangedFxn : function () {
        $._PPP_.updateEventPanel('Something in  ' + app.project.activeSequence.name + 'changed.');
    },

    registerItemsAddedToProjectFxn : function () {
        app.bind("onItemsAddedToProjectSuccess", $._PPP_.onItemsAddedToProject);
    },

    registerItemsAddedToProjectFxn : function () {
        app.bind("onItemsAddedToProjectSuccess", $._PPP_.onItemsAddedToProject);
    },

    registerSequenceMessaging : function () {
        app.bind('onActiveSequenceTrackItemRemoved', $._PPP_.myTrackItemRemoved);
        app.bind('onActiveSequenceTrackItemAdded', $._PPP_.myTrackItemAdded);
        app.bind('onActiveSequenceStructureChanged', $._PPP_.mySequenceStructureChanged);
    },

    myTrackItemRemoved : function (track, trackItem) {
        $._PPP_.updateEventPanel('onActiveSequenceTrackItemRemoved: ' + track.name + ' : ' + trackItem.name + ' : ' + trackItem.nodeId + ".");
    },

    myTrackItemAdded : function (track, trackItem) {
        $._PPP_.updateEventPanel('onActiveSequenceTrackItemAdded: ' + track.name + ' : ' + trackItem.name + ' : ' + trackItem.nodeId + ".");
    },

    mySequenceStructureChanged : function () {
        $._PPP_.updateEventPanel('onActiveSequenceStructureChanged.');
    },

    registerActiveSequenceChangedFxn : function () {
        var success = app.bind("onActiveSequenceChanged", $._PPP_.myActiveSequenceChangedFxn);
    },

    myActiveSequenceChangedFxn : function () {
        $._PPP_.updateEventPanel(app.project.activeSequence.name + " changed, in some way.");
    },

    confirmPProHostVersion : function () {
        var version = parseFloat(app.version);
        if (version < 14.0) {
            $._PPP_.updateEventPanel("Note: PProPanel relies on features added in 14.0, but is currently running in " + version + ".");
        }
    },

    forceLogfilesOn : function () {
        app.enableQE();
        var previousLogFilesValue = qe.getDebugDatabaseEntry("CreateLogFilesThatDoNotExist");

        if (previousLogFilesValue === 'true') {
            $._PPP_.updateEventPanel("Force create Log files was already ON.");
        } else {
            qe.setDebugDatabaseEntry("CreateLogFilesThatDoNotExist", "true");
            $._PPP_.updateEventPanel("Set Force create Log files to ON.");
        }
    },
}