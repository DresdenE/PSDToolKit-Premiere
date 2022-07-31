function onLoaded () {
    var csInterface = new CSInterface();

    loadJSX();

    updateThemeWithAppSkinInfo(csInterface.hostEnvironment.appSkinInfo);
    alert("theme updated");
    
    // Update the color of the panel when the theme color of the product changed.
    csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, onAppThemeColorChanged);
    csInterface.addEventListener("ApplicationBeforeQuit", function(event) {
        csInterface.evalScript("$._PPP_.closeLog()");
    });

    csInterface.evalScript("$._PPP_.getVersionInfo()", myVersionInfoFunction);    
    csInterface.evalScript("$._PPP_.getActiveSequenceName()", myCallBackFunction);        
    csInterface.evalScript("$._PPP_.keepPanelLoaded()");
    csInterface.evalScript("$._PPP_.disableImportWorkspaceWithProjects()");  
    csInterface.evalScript("$._PPP_.confirmPProHostVersion()");
    csInterface.evalScript("$._PPP_.forceLogfilesOn()");  // turn on log files when launching

    // Good idea from our friends at Evolphin; make the ExtendScript locale match the JavaScript locale!
    var prefix        = "$._PPP_.setLocale('";
    var locale         = csInterface.hostEnvironment.appUILocale;
    var postfix        = "');";

    var entireCallWithParams = prefix + locale + postfix;
    csInterface.evalScript(entireCallWithParams);
}

/**
* Load JSX file into the scripting context of the product. All the jsx files in 
* folder [ExtensionRoot]/jsx & [ExtensionRoot]/jsx/[AppName] will be loaded.
*/
function loadJSX() {
    var csInterface = new CSInterface();

    // get the appName of the currently used app. For Premiere Pro it's "PPRO"
    var appName = csInterface.hostEnvironment.appName;
    var extensionPath = csInterface.getSystemPath(SystemPath.EXTENSION);

    // load general JSX script independent of appName
    var extensionRootGeneral = extensionPath + "/jsx/";
    csInterface.evalScript("$._ext.evalFiles(\"" + extensionRootGeneral + "\")");

    // load JSX scripts based on appName
    var extensionRootApp = extensionPath + "/jsx/" + appName + "/";
    csInterface.evalScript("$._ext.evalFiles(\"" + extensionRootApp + "\")");
}

/**
 * Update the theme with the AppSkinInfo retrieved from the host product.
 */
function updateThemeWithAppSkinInfo(appSkinInfo) {
    // Update the background color of the panel
    var panelBackgroundColor = appSkinInfo.panelBackgroundColor.color;
    document.body.bgColor = toHex(panelBackgroundColor);

    var styleId             = "panelstyle"
    var gradientBg			= "background-image: -webkit-linear-gradient(top, " + toHex(panelBackgroundColor, 40) + " , " + toHex(panelBackgroundColor, 10) + ");";
    var gradientDisabledBg	= "background-image: -webkit-linear-gradient(top, " + toHex(panelBackgroundColor, 15) + " , " + toHex(panelBackgroundColor, 5) + ");";
    var boxShadow			= "-webkit-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 1px 1px rgba(0, 0, 0, 0.2);";
    var boxActiveShadow		= "-webkit-box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.6);";

    var isPanelThemeLight	= panelBackgroundColor.red > 50; // choose your own sweet spot
    var fontColor, disabledFontColor, borderColor, inputBackgroundColor, gradientHighlightBg;

    if(isPanelThemeLight) {
        fontColor				= "#000000;";
        disabledFontColor		= "color:" + toHex(panelBackgroundColor, -70) + ";";
        borderColor				= "border-color: " + toHex(panelBackgroundColor, -90) + ";";
        inputBackgroundColor	= toHex(panelBackgroundColor, 54) + ";";
        gradientHighlightBg		= "background-image: -webkit-linear-gradient(top, " + toHex(panelBackgroundColor, -40) + " , " + toHex(panelBackgroundColor,-50) + ");";
    } else {
        fontColor				= "#ffffff;";
        disabledFontColor		= "color:" + toHex(panelBackgroundColor, 100) + ";";
        borderColor				= "border-color: " + toHex(panelBackgroundColor, -45) + ";";
        inputBackgroundColor	= toHex(panelBackgroundColor, -20) + ";";
        gradientHighlightBg		= "background-image: -webkit-linear-gradient(top, " + toHex(panelBackgroundColor, -20) + " , " + toHex(panelBackgroundColor, -30) + ");";
    }
    alert("starting addRule")

    // Update the default text style with pp values
    addRule(styleId, ".default", "font-size:" + appSkinInfo.baseFontSize + "px" + "; color:" + fontColor + "; background-color:" + toHex(panelBackgroundColor) + ";");
    addRule(styleId, "button, select, input[type=text], input[type=button], input[type=submit]", borderColor);  
    addRule(styleId, "p", "color:" + fontColor + ";");
    addRule(styleId, "h1", "color:" + fontColor + ";");
    addRule(styleId, "h2", "color:" + fontColor + ";");
    addRule(styleId, "button", "font-family: " + appSkinInfo.baseFontFamily + ", Arial, sans-serif;");
    addRule(styleId, "button", "color:" + fontColor + ";");
    addRule(styleId, "button", "font-size:" + (1.2 * appSkinInfo.baseFontSize) + "px;");
    addRule(styleId, "button, select, input[type=button], input[type=submit]", gradientBg);
    addRule(styleId, "button, select, input[type=button], input[type=submit]", boxShadow);
    addRule(styleId, "button:enabled:active, input[type=button]:enabled:active, input[type=submit]:enabled:active", gradientHighlightBg);
    addRule(styleId, "button:enabled:active, input[type=button]:enabled:active, input[type=submit]:enabled:active", boxActiveShadow);
    addRule(styleId, "[disabled]", gradientDisabledBg);
    addRule(styleId, "[disabled]", disabledFontColor);
    addRule(styleId, "input[type=text]", "padding:1px 3px;");
    addRule(styleId, "input[type=text]", "background-color: " + inputBackgroundColor + ";");
    addRule(styleId, "input[type=text]:focus", "background-color: #ffffff;");
    addRule(styleId, "input[type=text]:focus", "color: #000000;");
}

function myVersionInfoFunction (data) {
    var v_string = document.getElementById("version_string");
    v_string.innerHTML = data;
}

function onAppThemeColorChanged(event) {
    // Should get a latest HostEnvironment object from application.
    var skinInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
    // Gets the style information such as color info from the skinInfo, 
    // and redraw all UI controls of your extension according to the style info.
    updateThemeWithAppSkinInfo(skinInfo);
} 

function myCallBackFunction(data) {
    // Updates seq_display with whatever ExtendScript function returns.
    var boilerPlate = "Active Sequence: ";
    var seq_display = document.getElementById("active_seq");
    seq_display.innerHTML = boilerPlate + data;
}

function onClickButton(ppid) {
    var extScript = "$._ext_" + ppid + ".run()";
    evalScript(extScript);
}

function evalScript(script, callback) {
    new CSInterface().evalScript(script, callback);
}