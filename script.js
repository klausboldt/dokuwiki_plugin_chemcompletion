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
        
        // Preserve newline indicators (double backslash)
        text = text.replace(/\\/g, "\\\\");
        
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
 * @param  string input  the plain text to be parsed
 * @param  string script the script to parse the text
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


/**
 * Add button action for the edit database button
 *
 * @param  DOMElement btn   Button element to add the action to
 * @param  array      props Associative array of button properties
 * @param  string     edid  ID of the editor textarea
 * @return boolean    If button should be appended
 * @author Klaus Boldt <klaus.boldt@uni-rostock.de>
 */
function addBtnActionEditdatabase($btn, props, edid) {
    dw_editdatabase.init(jQuery('#'+edid));
    jQuery($btn).click(function(e){
        dw_editdatabase.val = props;
        dw_editdatabase.toggle();
        e.preventDefault();
        return '';
    });
    return 'edit__database';
}


/**
 * Load database file
 *
 * Pass the selected text through a script and replace original text
 *
 * @param  string database location of the database file
 * @author Klaus Boldt <klaus.boldt@uni-rostock.de>
 */
function loadDatabase(database) {
    var output = '[Failed to load the database!]';
    jQuery.ajax({
       type: "GET",
       async: false,
       url: database,
       dataType: 'text',
       success: function(data) {
            output = data;
       }
    });
    return output;
}


/**
 * The Database Editor
 *
 * @author Klaus Boldt <klaus.boldt@uni-rostock.de>
 */
var dw_editdatabase = {
    $wiz: null,
    textArea: null,
    saveBtn: null,
    cancelBtn: null,

    /**
     * Initialize dw_editdatabase by creating the needed HTML
     * and attaching the eventhandlers
     */
    init: function($editor){
        // position relative to the text area
        var pos = $editor.position();
        var database_text = loadDatabase('/lib/plugins/chemcompletion/chemlist_completion.database');

        // create HTML Structure
        if(dw_editdatabase.$wiz)
            return;
        dw_editdatabase.$wiz = jQuery(document.createElement('div'))
               .dialog({
                   autoOpen: false,
                   draggable: true,
                   title: LANG.plugins.chemcompletion.editdatabase,
                   resizable: false
               })
               .html(
                    '<div><b>Compound_name</b> | <b>Molar mass</b> (g/mol) | <b>Density</b> (g/ml)</div><div class="editBox" role="application"><form id="db__editform" method="post" accept-charset="utf-8" class="doku_form"><textarea name="wikitext" type="textarea" dir="auto" tabindex="1" cols="80" rows="25" id="database__text" class="edit">'+database_text+
                     '</textarea><div><button value="1" type="submit" tabindex="2" id="dbbtn__save" onclick="save();">Save</button><button value="1" type="submit" tabindex="3" id="dbbtn__cancel" onclick="hide();">Cancel</button></div>'
                    )
               .parent()
               .attr('id','edit__database')
               .css({
                    'position':    'absolute',
                    'top':         (pos.top+20)+'px',
                    'left':        (pos.left+80)+'px'
                   })
               .hide()
               .appendTo('.dokuwiki:first');

        dw_editdatabase.textArea = jQuery('#database__text');
        jQuery('#dbbtn__cancel').click(function(e) {
        	e.preventDefault();
        	dw_editdatabase.hide();
        });
        jQuery('#dbbtn__save').click(function(e) {
        	e.preventDefault();
        	dw_editdatabase.save();
        });
        jQuery('#edit__database .ui-dialog-titlebar-close').on('click', dw_editdatabase.hide);
    },
    
    /**
     * Save the edited database file to te server
     */
    save: function() {
    	var output = dw_editdatabase.textArea.val();
        jQuery.ajax({
            type: "POST",
            async: false,
            url: '/lib/plugins/chemcompletion/save_database_file.php',
            dataType: 'text',
            data: {
                data: output,
            },
            success: function(result) {
                dw_editdatabase.hide();
            },
            error: function(result) {
                alert('Failed to save the database!');
                dw_editdatabase.hide();
            }
       });
    },

    /**
     * Show the database editor
     */
    show: function() {
        dw_editdatabase.selection = DWgetSelection(dw_editdatabase.textArea);
        dw_editdatabase.$wiz.show();
        dw_editdatabase.$entry.focus();
        dw_editdatabase.autocomplete();

        // Move the cursor to the end of the input
        var temp = dw_editdatabase.$entry.val();
        dw_editdatabase.$entry.val('');
        dw_editdatabase.$entry.val(temp);
    },

    /**
     * Hide the database editor
     */
    hide: function() {
        dw_editdatabase.$wiz.hide();
        dw_editdatabase.textArea.focus();
    },

    /**
     * Toggle the database editor
     */
    toggle: function() {
        if (dw_editdatabase.$wiz.css('display') == 'none') {
            dw_editdatabase.show();
        } else {
            dw_editdatabase.hide();
        }
    }
};
