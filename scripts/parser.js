'use strict';

/**
 * Assign the project to an employee.
 * @param {string} text
 * @return {Object}
 */
const mk_entityObj_from_text = function(text)
{
    // text must be like:
    // entity|e entityName(att1 [pk], att2 [pk], ... )xy where x, y must be in [n, e, s, w]

    let isEntity = true;
    let name = '';
    let attributes = [];
    let style = '';


    // parse the first part, up to the '('
    text = text.split('(');
    if(text.length !== 2) throw new Error('Syntax error'); // there was no '(' or there where more than one
    let head = text[0].split(' ').filter(e => e); // this makes shure there are no empty string
    if(head.length !== 2) throw new Error('Syntax error'); // entityName cannot contain spaces
    name = head[1];

    // parse the part inside the parenthesis
    text = text[1].split(')');
    let body = text[0];
    if(body)
    {
        body = body.split(',')
        body.forEach(elem => // loop through the attributes
        {
            elem = elem.split(' ').filter(e => e);
            if(!elem || elem.length > 2 || elem.length === 0) throw new Error('Syntax error'); // must be one ot two
            if(elem.length == 2) // if they are two and the second is pk then the attribute is the key ( or part of it )
            {
                if(elem[1].toLowerCase() !== 'pk') throw new Error('Syntax error');
                attributes.push({'name': elem[0], 'isKey': true});
            }else // non key attribute
                attributes.push({'name': elem[0], 'isKey':false});

        });
    }

    // parse the last part after ')'
    let tail = text[1];
    if(tail)
    {
        tail = tail.trim();
        if(tail.length > 2) throw new Error('Syntax error'); // must be one or two
        tail.split('').forEach(char => 
        {
            if( !'NESW'.includes(char.toUpperCase())) throw new Error('Syntax error'); // every char must be one of [n,e,s,w]
        });
        // ugly way to order char alphabetically and delete any repeating ones
        style = tail.toUpperCase().split('').sort().filter((elem, i, arr) => elem != arr[i-1]).join('');
    }

    return {
        isEntity : isEntity,
        name : name,
        attributes : attributes,
        style : style
    };
}

/**
 * Assign the project to an employee.
 * @param {string} text
 * @returns {Object}
 */
const mk_relationObj_from_text = function(text)
{
    // text must be like:
    // relation|r relationName(att1, att2, ... )[dir1 type1, dir2 type2]
    // where dir is in [n,e,s,w] and type in [11,1n,nm,0n (and the flipped versions)] 

    let isEntity = false;
    let name = '';
    let attributes = [];
    let style = [];

    // parse the first part, up to the '('
    text = text.split('(');
    if(text.length !== 2) throw new Error('Syntax error'); // there was no '(' or there where more than one
    let head = text[0].split(' ').filter(e => e); // this makes shure there are no empty string
    if(head.length !== 2) throw new Error('Syntax error'); // relationName cannot contain spaces
    name = head[1];

    // parse the part inside the parenthesis
    text = text[1].split(')');
    let body = text[0];
    if(body)
    {
        body = body.split(',')
        body.forEach(elem => // loop through the attributes
        {
            elem = elem.split(' ').filter(e => e);
            if(!elem || elem.length !== 1) throw new Error('Syntax error'); // must be one
            attributes.push({'name': elem[0], 'isKey':false});
        });
    }

    // parse the last part after ')'
    let tail = text[1];
    if(tail)
    {
        tail = tail.split(',');
        if(tail.length != 2) throw new Error('Syntax error'); // must be two
        tail.forEach(sub => 
        {
            if(!sub) throw new Error('Syntax error');
            sub = sub.split(' ').filter(e => e)
            if(sub.length != 2) throw new Error('Syntax error');
            // check that the parts are within what is expected 
            if(!('NESW'.split('').includes(sub[0].toUpperCase()) 
                && '1N 11 NN N1 01 10 0N N0 MN NM'.split(' ').includes(sub[1].toUpperCase()))) // check cardinality
                throw new Error('Syntax error');
            style.push(sub.map(s=>s.toUpperCase()));
        });
        if(style[0][0] === style[1][0] ) throw new Error('Syntax error'); // the two directions cant be equal
    }

    return {
        isEntity : isEntity,
        name : name,
        attributes : attributes,
        style : style
    };
}


/**
 * Assign the project to an employee.
 * @param {string} text
 * @returns {Object}
 */
const parse = function(text)
{
    text = text.trim().replace(/\n|\t/g, ' '); // clean up the text

    const first = text.split(' ').filter(e=>e)[0] || 'nope'; // get first word of text

    if(['e', 'entity'].includes(first.toLowerCase()))        return mk_entityObj_from_text(text);
    else if(['r', 'relation'].includes(first.toLowerCase())) return mk_relationObj_from_text(text);
    else throw new Error('Syntax error');
}


if (require.main === module) {
    
    const text = 'entity User(id pk, name, birthday)NS';
    console.log(text);
    
    try{ console.log( parse(text)); }
    catch(e){ console.log(e.message); }
}

module.exports = parse;