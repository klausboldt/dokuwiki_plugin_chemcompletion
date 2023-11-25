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
        
        // Split into individual lines
        var lines = text.split("\n");
        var numberOfLines = lines.length;
        if (numberOfLines > 1) {
            text = "";
            for (var i = 0; i < numberOfLines; i++) {
                text = text.concat(parseTextWithScript(lines[i], props.script));
                if (i != numberOfLines - 1)
                    text = text.concat("\n");
            }
        } else {
            text = parseTextWithScript(text, props.script);
        }
        
        // do it
        pasteText(selection, text, opts);
    }
    
    pickerClose();
    return false;
}


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
	var output = '[Failed to run the script!]';
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
