'use strict';

// The % operator works weird with negative numbers, this fixes it
Number.prototype.mod = function(n) 
{
    return ((this%n)+n)%n;
};


const widthsMap = require('../resources/widthsMap');
/**
 * Calculates width in pixels of a text string given font and size via lookup table
 * if no font or size are supplied they default to Arial 12pt
 * from https://github.com/adambisek/string-pixel-width
 * 
 * @param {string} string
 * @param {Object} settings
 * @returns {number}
 */
const getPixelWidth = (string, settings) => 
{
    const sett = { font: 'Arial', size: 12, ...settings };
    const font = sett.font.toLowerCase();
    const size = sett.size;
    const variant = 0 + (sett.bold ? 1 : 0) + (sett.italic ? 2 : 0);
    const map = sett.map || widthsMap;
    const available = Object.keys(map);
    if (available.indexOf(font) === -1)
        throw new Error(`This font is not supported. Supported fonts are: ${available.join(', ')}`);
    
    let totalWidth = 0;
    string.split('').forEach((char) => 
    {
      if (/[\x00-\x1F]/.test(char)) return true; // non-printable character

      // use width of 'x' as fallback for unregistered char
      const widths = map[font][char] || map[font].x;
      const width = widths[variant];
      totalWidth += width;
      return true;
    });
    return totalWidth * (size / 100);
};


// Easy 2d vector class with some useful methods
class vec2d
{
    /**
     * @param {...} _ Expecting 2 numbers or one vec2d
     */
    constructor()
    {
        switch(arguments.length)
        {
        case 0: this.x = this.y = 0; break; // default
        case 1: this.x = arguments[0].x; this.y = arguments[0].y; break; // with other vec2d
        case 2: this.x = arguments[0]; this.y = arguments[1]; break; // with x and y coordinates
        default: throw new Error('Invalid number of arguments in vec2d contructor');
        }
    }

    /**
     * Calculates Euclidean norm
     * @returns {number}
     */
    length()
    { 
        return Math.sqrt( Math.pow(this.x, 2) + Math.pow(this.y, 2)); 
    }

    /**
     * Performs scalar multiplication
     * @param {number} lamda
     * @returns {vec2d}
     */
    scalar(lamda)
    { 
        return new vec2d(this.x * lamda, this.y * lamda); 
    }

    /**
     * @param {vec2d} other
     * @returns {vec2d}
     */
    sum(other)
    { 
        return new vec2d(this.x + other.x, this.y + other.y); 
    }

    /**
     * @param {vec2d} other
     * @returns {vec2d}
     */
    sub(other)
    { 
        return new vec2d(this.x - other.x, this.y - other.y); 
    }

    /**
     * Return vec2d with same direction but with length equal to 1
     * @returns {vec2d}
     */
    unit()
    { 
        return this.scalar( 1 / this.length() ); 
    }
}


exports.vec2d = vec2d;
exports.getPixelWidth = getPixelWidth;