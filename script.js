/**
 * Button action for parse/replace buttons
 *
 * @param  DOMElement btn   Button element to add the action to
 * @param  array      props Associative array of button properties
 * @param  string     edid  ID of the editor textarea
 * @author Klaus Boldt <klaus.boldt@uni-rostock.de>
 */
function tb_parse(btn, props, edid) {
    var selection = DWgetSelection(jQuery('#'+edid)[0]);
    var text, $opts;
    
    // is something selected?
    if (selection.getLength()) {
        text = selection.getText();
        opts = {nosel: true};
        
        // do it
        text = parseTextWithScript(text, props.script);
        pasteText(selection, text, opts);
    }
    
    pickerClose();
    return false;
}

/**
 * Button action for script/replace buttons
 *
 * This works exactly as tb_replace() except that, if multiple lines
 * are selected, each line will be formatted seperately
 *
 * @param  DOMElement btn   Button element to add the action to
 * @param  array      props Associative array of button properties
 * @param  string     edid  ID of the editor textarea
 * @author Klaus Boldt <klaus.boldt@uni-rostock.de>
 */
/*function tb_parseln(btn, props, edid) {
    var selection = DWgetSelection(jQuery('#'+edid)[0]);
    var text, opts;

    // is something selected?
    if (selection.getLength()) {
        text = selection.getText();
        opts = {nosel: true};
        
        // do it
        text = parseTextWithScript(text, props.script);
        pasteText(selection, text, opts);
    }

    /*text = text.split("\n").join(props.close+"\n"+props.open);
    sample = props.open+sample+props.close;*/
/*
    pickerClose();
    return false;
}*/


/**
 * Script completion
 *
 * Pass the selected text through a script and replace original text
 *
 * @param  string     the plain text to be parsed
 * @param  string     the script to parse the text
 * @author Klaus Boldt <klaus.boldt@uni-rostock.de>
 */
function parseTextWithScript(input, script) {
	var output = ':-(';
    jQuery.ajax({
       type: "GET",
       async: false,
       url: script,
       data: {text: input},
       dataType: 'text',
       success: function(data) {
            output = data;
       }
    });
    return output;
}