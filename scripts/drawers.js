'use strict';
// https://jgraph.github.io/mxgraph/javascript/src/js/mxClient.js
const util = require('./util');
const vec2d = util.vec2d;
const getPixelWidth = util.getPixelWidth;

const SCALE = 50;
const ATTRIBUTES_LEN = 0.5 * SCALE;
const MULTI_KEY_EXTRA_LEN = 0.25 * SCALE;
const RHOMBUS_DIAGONAL_x = 2 * SCALE;
const RHOMBUS_DIAGONAL_y = 1 * SCALE;
const RECTANGLE_WIDTH = 2 * SCALE;
const RECTANGLE_HEIGHT = 1 * SCALE;
const RELATION_LINE_LEN = 1.5 * SCALE;
const FONTSIZE = 12;
const PI = Math.PI;


/**
 * Makes a mxCell with the shape of a rectangle with text inside
 * 
 * @param {string} name
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @returns {mxCell}
 */
const mk_rectangle = function(name, x, y, w, h)
{
    let rect = new mxCell(`<font style="font-size: ${FONTSIZE}px">${name}</font>`,
        new mxGeometry(x, y, w, h), 'rounded=0;whiteSpace=wrap;html=1');
    rect.setVertex(true);
    return rect;
}

/**
 * Makes a mxCell with the shape of a rombus with text inside
 * 
 * @param {string} name
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @returns {mxCell}
 */
const mk_rhombus = function(name, x, y, w, h)
{
    let rhomb = new mxCell(`<font style="font-size: ${FONTSIZE}px">${name}</font>`,
        new mxGeometry(x, y, w, h), 'rhombus;whiteSpace=wrap;html=1;');
    rhomb.setVertex(true);
    return rhomb;
}

/**
 * Creates a mxCell rapresenting a line
 * if midPoints is not empty the line will pass through this points
 * if startFill is not null the line will have a full circle at the end if startFill is true, else will be empty
 * 
 * @param {vec2d} start
 * @param {vec2d} end
 * @param {boolean|null} startFill
 * @param {vec2d[]=} midPoints
 * @returns {mxCell}
 */
const mk_line = function(start, end, startFill, midPoints)
{
    let geometry = new mxGeometry(Math.min(start.x, end.x), Math.min(start.y, end.y), Math.abs(start.x - end.x), Math.abs(start.y - end.y));
    geometry.setTerminalPoint(new mxPoint(start.x, start.y), false);
    geometry.points = (midPoints || []).map(p => new mxPoint(p.x, p.y));
    geometry.setTerminalPoint(new mxPoint(end.x, end.y), true);
    let line = new mxCell('', geometry, `endArrow=none;html=1` + (startFill === null ? '' : `;startArrow=oval;startFill=${startFill ? 1 : 0}`))
    line.setEdge(true);
    return line;
}

/**
 * Creates a mxCell that displays text and returns it
 * 
 * @param {string} txt
 * @param {number} x
 * @param {number} y
 * @returns {mxCell}
 */
const mk_text = function(txt, x, y)
{
    let text = new mxCell(`<font style="font-size: ${FONTSIZE}px">${txt}</font>`, 
        new mxGeometry(x, y, getPixelWidth(txt, {size : FONTSIZE}), 20),
        'text;html=1;resizable=0;points=[];autosize=1;align=left;verticalAlign=top;spacingTop=-4');
    text.setVertex(true);
    return text;
}

/**
 * Thakes an array of mxCells and sets their parent to one new mxCell ( that has same geometry as the first elemetn in the array)
 * and return the modified array with the parent mxCell in the first place
 * it's handy because in the editor by dragging any component of the group the whole group moves with it
 * 
 * @param {mxCell[]} cells
 * @param {number=} xoff
 * @param {number=} yoff
 * @returns {mxCell[]}
 */
const mk_group = function(cells, xoff, yoff)
{
    xoff = xoff || 0;
    yoff = yoff || 0;

    let group = new mxCell('', new mxGeometry(0, 0, cells[0].geometry.width, cells[0].geometry.height), 'group'); // same geometry as cells[0]
    group.setVertex(true);

    // since the position of a cell is calculated relative to the (0,0) of the parent ( the group cell becames the new parent)
    // translate every cell so that what should be it's (0,0) matches with the (0,0) of the parent
    cells.forEach(cell => 
    {
        cell.geometry.translate(xoff, yoff);
        group.insert(cell);
    });

    return [group, ...cells];
}

/**
 * Does the calculations to draw a relation with his attributes to the mxGraph and returns
 * an array of mxCells that can be displayed
 * 
 * @param {Object} relation
 * @returns {mxCell[]}
 */
const mk_drawable_from_relation = function(relation)
{
    const name = relation.name || 'Relation';
    let attributes = relation.attributes || [];
    const style = relation.style && relation.style.length ? relation.style : [['N', '1N'], ['S', '1N']];

    const rhomb_dx = RHOMBUS_DIAGONAL_x;
    const rhomb_dy = RHOMBUS_DIAGONAL_y;
    const theta = PI/6;
    const angles_lookup = [PI+theta, PI-theta, theta, 2*PI-theta];

    let drawable = [];

    /**
     * Makes an attribute (line with circle at the end and text) and returns it
     * @param {string} name
     * @param {number} angle
     * @returns {mxCell[]}
     */
    const mk_attribute = function(name, angle)
    {
        angle = angle.mod(2*PI);
        let start, end;
        let txt_x, txt_y;

        let _W = rhomb_dx / 2, _H = rhomb_dy / 2;

        if(angle >= 0 && angle < PI/2) // NE
        {
            // https://www.desmos.com/calculator/dvz3woz7s3
            start = new vec2d( _W*_H / (_H + _W*Math.tan(angle)),  -_W*_H*Math.tan(angle) / (_H + _W*Math.tan(angle)));
            end = start.unit().scalar( ATTRIBUTES_LEN ).sum( start );
            txt_x = end.x + 3;
            txt_y = end.y - 13;
        }
        else if(angle >= PI/2 && angle < PI) // NW
        {
            start = new vec2d( -_W*_H / (_H + _W*Math.tan(PI - angle)),  -_W*_H*Math.tan(PI - angle) / (_H + _W*Math.tan(PI - angle)));
            end = start.unit().scalar( ATTRIBUTES_LEN ).sum( start );
            txt_x = end.x - getPixelWidth(name, {size : FONTSIZE }) - 7;
            txt_y = end.y - 13;
        }
        else if(angle >= PI && angle < 3*PI/2) // SW
        {
            start = new vec2d( -_W*_H / (_H + _W*Math.tan(angle - PI)),  _W*_H*Math.tan(angle - PI) / (_H + _W*Math.tan(angle - PI)));
            end = start.unit().scalar( ATTRIBUTES_LEN ).sum( start );
            txt_x = end.x - getPixelWidth(name, {size : FONTSIZE }) - 7;
            txt_y = end.y - 8;
        }
        else // SE
        {
            start = new vec2d( _W*_H / (_H + _W*Math.tan(2*PI-angle)),  _W*_H*Math.tan(2*PI - angle) / (_H + _W*Math.tan(2*PI - angle)));
            end = start.unit().scalar( ATTRIBUTES_LEN ).sum( start );
            txt_x = end.x + 3;
            txt_y = end.y - 8;
        }

        let txt = mk_text(name, txt_x, txt_y);
        let line = mk_line(start, end, false);

        return [txt, line];
    }

    style.forEach(s => 
    {
        const dir = s[0];
        const txt = `(${s[1][0]},${s[1][1]})`; // cardinality

        let start, end, txt_x, txt_y;

        switch(dir)
        {
        case 'E':
            start = new vec2d(rhomb_dx / 2, 0);
            end = start.unit().scalar( RELATION_LINE_LEN ).sum( start );

            txt_x = start.x + 5; 
            txt_y = start.y-5-5 - 10;

            break;
        case 'N':
            start = new vec2d(0, -rhomb_dy / 2);
            end = start.unit().scalar( RELATION_LINE_LEN ).sum( start );

            txt_x = start.x + 1; 
            txt_y = start.y-5-5 - 10 + 2 - 2;

            break;
        case 'W':
            start = new vec2d( -rhomb_dx / 2, 0);
            end = start.unit().scalar( RELATION_LINE_LEN ).sum( start );

            txt_x = start.x - 5 - 2 - getPixelWidth(txt, {size : FONTSIZE }); 
            txt_y = start.y-5-5 - 10;

            break;
        case 'S':
            start = new vec2d(0, rhomb_dy / 2);
            end = start.unit().scalar( RELATION_LINE_LEN ).sum( start );

            txt_x = start.x + 1; 
            txt_y = start.y-5 + 2 + 2;

            break;
        }

        let text_drawable = mk_text(txt, txt_x, txt_y);
        let line = mk_line(start, end, null, null);

        drawable.push(text_drawable, line);        
    });

    
    for(let i=0; i<4; ++i)
    {
        let atts = attributes.splice(0, Math.ceil( attributes.length / (4-i)));
        const spacing = PI/(2.5 * (atts.length + 1));
        const angle = angles_lookup[i];

        if(atts.length % 2 === 0)
        {
            const mid = atts.length / 2;
            for(let i = 0; i < mid; ++i)
            {
                let attr1 = mk_attribute(atts[mid+i].name, angle - (1/2 + i) *spacing);
                let attr2 = mk_attribute(atts[mid-i-1].name, angle + (1/2 + i) *spacing);

                drawable = [...attr2, ...drawable, ...attr1];
            }
        }
        else
        {
            const mid = Math.floor(atts.length / 2);
            let midattr = mk_attribute(atts[mid].name, angle);
            drawable.push(...midattr);
            for(let i = 0; i < mid; ++i)
            {
                let attr1 = mk_attribute(atts[mid+i+1].name, angle - (i+1)*spacing);
                let attr2 = mk_attribute(atts[mid-i-1].name, angle + (i+1)*spacing);
                
                drawable = [...attr2, ...drawable, ...attr1];
            }
        }
    }
    

    let rhomb = mk_rhombus(name, -rhomb_dx/2, -rhomb_dy/2, rhomb_dx, rhomb_dy);
    drawable.unshift(rhomb);

    return mk_group(drawable, rhomb_dx/2, rhomb_dy/2);
}

/**
 * Does the calculations to draw an entity with his attributes to the mxGraph and returns
 * an array of mxCells that can be displayed
 * 
 * @param {Object} entity
 * @returns {mxCell[]}
 */
const mk_drawable_from_entity = function(entity)
{
    const name = entity.name || 'Entity';
    let attributes = entity.attributes || [];
    const style = entity.style || 'E';

    const nkeys = attributes.reduce((acc, cur) => acc + cur.isKey , 0); // count number of key attributes
    if(nkeys > 1) // if more than one attribute is key i rearrange the array so that key attributes are first
        attributes = [...attributes].filter(e=>e.isKey).concat([...attributes].filter(e=>!e.isKey));

    const rect_w = Math.max(RECTANGLE_WIDTH, getPixelWidth(name + 'pp', {size : FONTSIZE}));
    const rect_h = RECTANGLE_HEIGHT;
    const theta = Math.atan( rect_h / rect_w);

    let drawable = []; // is going to hold all the mxCells to return

    /**
     * Makes an attribute ( line with circle at the end either full or empty and text) and returns it
     * @param {string} text
     * @param {number} angle
     * @param {boolean} isKey
     * @returns {mxCell[]}
     */
    const mk_attribute = function(text, angle, isKey)
    {
        angle = angle.mod(2*PI);
        let start, end; // start and end of line, start is going to be resting on rectangle perimeter
        let txt_x, txt_y; // starting point of text, near the end of line but with some tweaks
        
        // the + or - 0.001 are needed because of errors during calculation
        if(angle <= theta + 0.001 || angle >= 2*PI - theta - 0.001) /* East */
        {
            start = new vec2d(rect_w / 2 , - (rect_w / 2) * Math.tan(angle));
            end = start.unit().scalar( ATTRIBUTES_LEN ).sum(start);
            
            txt_x = end.x + 5; 
            txt_y = end.y-5-5;
        }
        else if(angle > theta + 0.001 && angle < PI-theta - 0.001) /* North */
        {
            start = new vec2d( rect_h / (2 * Math.tan(angle)), - rect_h / 2);
            end = start.unit().scalar( ATTRIBUTES_LEN ).sum(start);
            
            txt_x = end.x - getPixelWidth(text, {size : FONTSIZE }) / 2 - 2; 
            txt_y = end.y-20-3; 
        }
        else if(angle >= PI-theta - 0.001 && angle <= PI+theta + 0.001) /* West */
        { 
            start = new vec2d( - rect_w / 2 , (rect_w / 2) * Math.tan(angle) );
            end = start.unit().scalar( ATTRIBUTES_LEN ).sum(start);
            
            txt_x = end.x - 5 - 2 - getPixelWidth(text, {size : FONTSIZE }); 
            txt_y = end.y-5-5;
        }
        else /* South */
        {
            start = new vec2d( - rect_h / (2 * Math.tan(angle)), rect_h / 2);
            end = start.unit().scalar( ATTRIBUTES_LEN ).sum(start);
            
            txt_x = end.x - getPixelWidth(text, {size : FONTSIZE }) / 2 - 2; 
            txt_y = end.y+3;
        }

        let line =  mk_line(start, end, isKey);
        let text_drawable = mk_text(text, txt_x, txt_y);
        
        //line.setTerminal(text_drawable, true);  <-- needs some adjustments to work like i'd like to

        return [line, text_drawable];
    };

    // this function will take an angle and maps it like this (linearly)
    // [0, PI/4] --> [0, theta]
    // [PI/4, PI/2] --> [theta, PI/2]
    // [PI/2, 3*PI/4] --> [PI/2, PI-theta]
    // [3*PI/4, PI] --> [PI-theta, PI]
    // ...
    // this is helpful because, sice text is written horizzontaly, many attributes on the north side would start overlapping
    // pretty soon, while on the east side they won't overlap ( with a resonable ammount of attributes at least )
    // this function makes bigger the spacing ( in terms of angle ) on attributes on north or south and makes smaller the spacing on attributes
    // on the east and west side so the result is less messy
    const transform = (() => 
    {
        const m1 = 4*theta / PI;
        const c1 = 0;
        const m2 = 2 - 4*theta / PI;
        const c2 = 2*theta - PI/2;
        const rv = (x) =>
        {
            x = x.mod(2*PI);
            if(x >= 0 && x <= PI/4)   return m1*x + c1;         // E <= x <= NE
            if(x > PI/4 && x <= PI/2) return m2*x + c2;         // NE < x <= N
            if(x > PI/2 && x <= PI)   return PI - rv(PI-x);     // N < x <= W
            if(x > PI && x <= 3*PI/2) return PI + rv(x-PI);     // w < x <= S
            if(x>3*PI/2 && x < 2*PI)  return 2*PI - rv(2*PI-x); // S < x < E
        }
        return rv;
    })();


    // all the angles at witch i will start drawing the attributes
    // it will be two only if the stryle is north-south or east-west
    const arr_alpha = (() => 
    {   
        // style is always in ENSW order
        switch(style)
        {
        case 'E': return [0];
        case 'N': return [PI/2];
        case 'S': return [-PI/2];
        case 'W': return [PI];
        case 'EN': return [PI/4];
        case 'ES': return [-PI/4];
        case 'EW': return [0, PI];
        case 'NS': return [PI/2, 3*PI/2];
        case 'NW': return [3*PI/4];
        case 'SW': return [5*PI/4];
        }
    })();

    // if the style is nort-south or east-west i split the attributes i two, half will go on one side and half on the other
    const arr_attributes = (()=>
    {
        let attributes_cp = [...attributes]
        if(arr_alpha.length === 2) return [attributes_cp.splice(0, Math.ceil(attributes_cp.length / 2)), attributes_cp ];
        else return [attributes_cp]
    })();
    
    // loop through groups of attributes and create the mxCells for them
    arr_attributes.forEach( (attributes, i) =>
    {
        const nfields = attributes.length;
        const alpha = arr_alpha[i];
        
        let local_drawable = [] // needed only because a thing that i do later is sensitive to the order of attributes inside dravable
        
        const spacing = (()=> // calculate spacing between attributes based on how many there are
        {
            if(nfields < 3)  return PI / (3 * (nfields));
            if(nfields < 16) return PI / 8;
            else             return 2*PI / nfields;         
        })();

        
        if(nfields % 2 === 0) // if the number of attributes is even if draw them symmetric to the angle alpha ofsetted by spacing/2 + ...
        {
            const mid = nfields / 2;
            for(let i = 0; i < mid; ++i)
            {
                let attr1 = mk_attribute(attributes[mid+i].name, transform(alpha - (1/2 + i) *spacing), attributes[mid+i].isKey && nkeys === 1);
                let attr2 = mk_attribute(attributes[mid-i-1].name, transform(alpha + (1/2 + i) *spacing), attributes[mid-i-1].isKey && nkeys === 1);

                local_drawable = [...attr2, ...local_drawable, ...attr1];
            }
        }
        else // if the number of attributes is off i draw one at the angle alpha and the other symmetric to alpha ofsetted by spacing + ...
        {
            const mid = Math.floor(nfields / 2);
            let midattr = mk_attribute(attributes[mid].name, transform(alpha), attributes[mid].isKey && nkeys === 1);
            local_drawable.push(...midattr);
            for(let i = 0; i < mid; ++i)
            {
                let attr1 = mk_attribute(attributes[mid+i+1].name, transform(alpha - (i+1)*spacing), attributes[mid+i+1].isKey && nkeys === 1);
                let attr2 = mk_attribute(attributes[mid-i-1].name, transform(alpha + (i+1)*spacing), attributes[mid-i-1].isKey && nkeys === 1);
                
                local_drawable = [...attr2, ...local_drawable, ...attr1];
            }
        }
        drawable.push(...local_drawable);
    });

    if(nkeys > 1) // if there is more than one key attribute i draw the extra line that passes through them
    {
        let pts = [];
        // i get the point that is in the middle of the line of attributes that are part of the key (ONLY THEM that's why the filter)
        [...drawable].filter((_, i) => i%2 === 0 && i < nkeys*2).forEach(e => 
        {
            pts.unshift( new vec2d( (e.geometry.sourcePoint.x + e.geometry.targetPoint.x) / 2, (e.geometry.sourcePoint.y + e.geometry.targetPoint.y) / 2) );
        });
        let startOff = pts[0].sub(pts[1]).unit().scalar(MULTI_KEY_EXTRA_LEN / 2); // some things to make it look pretty
        let endOff = pts[pts.length - 1].sub(pts[pts.length - 2]).unit().scalar(MULTI_KEY_EXTRA_LEN);
        
        let start = pts.shift().sum(startOff);
        let end = pts.pop().sum(endOff);

        let multiKey = mk_line(start, end, true, pts.reverse());
        drawable.push(multiKey);
    }
    
    let rect = mk_rectangle(name, -rect_w/2, -rect_h/2, rect_w, rect_h); // central part with the name of the entity
    drawable.unshift(rect);

    return mk_group(drawable, rect_w/2, rect_h/2);
}

/**
 * Takes the object from parse ( not necessarily but the object has to have the correct fields)
 * and draws it to the screen
 * @param {App} ui
 * @param {Object} erObj
 * @returns {void}
 */
const draw = function(ui, erObj)
{
    const graph = ui.editor.graph;
    const view = graph.view;
    const bds = graph.getGraphBounds();

    // Computes unscaled, untranslated graph bounds
    const x = Math.ceil(Math.max(0, bds.x / view.scale - view.translate.x) + 4 * graph.gridSize);
    const y = Math.ceil(Math.max(0, (bds.y + bds.height) / view.scale - view.translate.y) + 4 * graph.gridSize);
    
    // Get object that i can draw
    const cells = (() => 
    {
        if(erObj.isEntity) return mk_drawable_from_entity(erObj);
        else               return mk_drawable_from_relation(erObj);
    })();
    
    // Draw cells to the screen and select them
    graph.setSelectionCells(graph.importCells(cells, x, y)[0]);
    graph.scrollCellToVisible(graph.getSelectionCell());
}

module.exports = draw;