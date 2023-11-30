<?php
/**
 * Action Plugin: Inserts a button into the toolbar to parse and replace
 *                text that includes weighed-in chemicals by a completed
 *                list of mass/volume/amount/molar mass/density
 *
 * @author Klaus Boldt <klaus.boldt@uni-rostock.de>
 */

use dokuwiki\Extension\ActionPlugin;
use dokuwiki\Extension\EventHandler;
use dokuwiki\Extension\Event;
 
class action_plugin_chemcompletion extends ActionPlugin {

    /**
     * Register the event handlers
     *
     * @param Doku_Event_Handler $controller DokuWiki's event controller object
     */
    function register(EventHandler $controller) {
        $controller->register_hook('TOOLBAR_DEFINE', 'AFTER', $this, 'insert_button', array ());
    }
 
    /**
     * Inserts the toolbar button
     *
     * @param Event $event event object
     * @param mixed $param [the parameters passed as fifth argument to
     *                      register_hook() when this handler was registered,
     *                      here just an empty array..]
     */
    function insert_button(& $event, $param) {
        $event->data[] = array (
            'type' => 'parse',
            'title' => $this->getLang('completechemlist'),
            'icon' => '../../plugins/chemcompletion/image/chemlist.png',
            'script' => '/lib/plugins/chemcompletion/run_awk_script.php',
        );
        $event->data[] = array (
            'type' => 'editdatabase',
            'title' => $this->getLang('editchemlistdatabase'),
            'icon' => '../../plugins/chemcompletion/image/chemlist_database.png',
            'file' => '/lib/plugins/chemcompletion/chemlist_completion.database',
        );
    }
}
