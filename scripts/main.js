'use strict';

/*
 * draw.io is built on top of the mxGraph library -> https://jgraph.github.io/mxgraph/
 * ( docs : http://jgraph.github.io/mxgraph/docs/js-api/files/index-txt.html )
 * 
 * part of this was done thanks to the code found here:
 * https://github.com/mast4461/draw.io-fsm-plugin
 * https://draw.io/plugins/sql.js
*/

const draw = require('./drawers');
const parse = require('./parser');

// function called when loading plugin
Draw.loadPlugin((ui) => 
{
    //Adds resource for action
    mxResources.parse('ER_diagram=ERD from text');

    //Create Base div for textarea and buttons
    let div = document.createElement('div');
    div.style.userSelect = 'none';
    div.style.overflow = 'hidden';
    div.style.padding = '10px';
    div.style.height = '100%';

    //Create vindow that will contain the div
    let wnd = new mxWindow(mxResources.get('ER_diagram'), div, document.body.offsetWidth - 480, 140, 420, 350, true, true);
    wnd.destroyOnClose = false;
    wnd.setMaximizable(false);
    wnd.setResizable(false);
    wnd.setClosable(true);    
    mxUtils.br(div);

    //Create textarea and put it in the div
    let textarea = document.createElement('textarea');
    textarea.style.height = '240px';
    textarea.style.width = '100%';
    textarea.style.fontSize = '12pt';
    textarea.value = 'entity Employee(id pk, firstName, lastName, email, hireDate, salary)w';
    mxUtils.br(div);
    div.appendChild(textarea);


    //Create reset button
    let resetBtn = mxUtils.button('Reset', () =>
    { 
        textarea.value = ''; 
    });
    resetBtn.style.fontSize = '12pt';
    resetBtn.style.marginTop = '8px';
    resetBtn.style.marginRight = '4px';
    resetBtn.style.padding = '4px';
    div.appendChild(resetBtn);

    //Create insert button
    let btn = mxUtils.button('Insert', () => 
    {
        try
        {
            const erObj = parse(textarea.value);
            draw(ui, erObj);

            //textarea.value = '';
            wnd.setVisible(false);
        }
        catch(e)
        {
            // The only errors that should be thrown are errors when parsing the text if it isn't in the correct format
            ui.alert(e);
        }
        
    });
    btn.style.fontSize = '12pt';
    btn.style.marginTop = '8px';
    btn.style.padding = '4px';
    div.appendChild(btn);

    // Adds action
    ui.actions.addAction('ER_diagram', () =>
    {
        wnd.setVisible(!wnd.isVisible());

        if (wnd.isVisible()) 
        {
            textarea.focus();
        }
    }/*, null, null, "Ctrl+Shift+Q"*/);

    // Adds toolbar button
    ui.toolbar.addSeparator();
    let elt = ui.toolbar.addItem('', 'ER_diagram');

    // Reorders menubar
    ui.menubar.container.insertBefore(ui.menubar.container.lastChild,
        ui.menubar.container.lastChild.previousSibling.previousSibling);

    // Set icon for menubar item
    elt.firstChild.style.backgroundImage = 'url(' + require('../resources/icon.js') + ')';

    // Displays status message
    ui.editor.setStatus('ERD plugin loaded.');
});