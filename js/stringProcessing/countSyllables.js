/** @module stringProcessing/countSyllables */

var cleanText = require( "../stringProcessing/cleanText.js" );
var getWords = require( "../stringProcessing/getWords.js" );
var syllableArray = require( "../config/syllables.js" );
var arrayToRegex = require( "../stringProcessing/createRegexFromArray.js" );
var forEach = require( "lodash/forEach" );
var find = require( "lodash/find" );
var isUndefined = require( "lodash/isUndefined" );

/**
 * The function removing a matched word(part) from a string.
 *
 * @param {String} word The original word.
 * @param {RegExp} replacementRegex The regex used for the deleting.
 * @returns {string} The word that is the result of the deleting.
 */
var replaceWord = function ( word, replacementRegex ) {
	return word.replace( replacementRegex, "" );
};

/**
 * The function that creates a regex out of a word that should be found anywhere in the string.
 *
 * @param {String} word A word that should be found anywhere in the string.
 * @param {String} letters The letters that shouldn't be matched when following the word.
 * @returns {String} The regex created with the exclusion words and disallowed letters.
 */
var getExclusionAnywhere = function ( word, letters ) {
	return "(" + word + "[^"+ letters + "])|(" + word + "$)";
};

/**
 * The function that creates a regex out of a word that should be found at the beginning or end of the string.
 *
 * @param {String} word A word that should be found at the beginning or end of the string.
 * @param {String} letters The letters that shouldn't be matched when following the word.
 * @returns {string} The regex created with the exclusion words and disallowed letters.
 */
var getExclusionBeginEnd = function ( word, letters ) {
	return "(^" + word + "[^"+ letters + "])|(" + word + "$)";
};

/**
 * The function that creates a regex-string.
 *
 * @param {String} word A word that should be found anywhere in a string, but not if followed by an 'n'.
 * @returns {String} The regex-string.
 */
var getExclusionsNoNRegex = function ( word ) {
	return getExclusionAnywhere( word, "n" );
};

/**
 * The function that creates a regex-string.
 *
 * @param {String} word A word that should be found anywhere in a string, but not if followed by an 'n' or 's'.
 * @returns {String} The regex-string.
 */
var getExclusionsNoNSRegex = function ( word ) {
	return getExclusionAnywhere( word, "ns" );
};

/**
 * The function that creates a regex-string.
 *
 * @param {String} word A word that should be found anywhere in a string, but not if followed by an 'r' or 's'.
 * @returns {String} The regex-string.
 */
var getExclusionsNoRSRegex = function ( word ) {
	return getExclusionAnywhere( word, "rs" );
};

/**
 * The function that creates a regex-string.
 *
 * @param {String} word A word that should be found anywhere in a string, but not if followed by an 'n' or 'r'.
 * @returns {String} The regex-string.
 */
var getExclusionsNoNRRegex = function ( word ) {
	return getExclusionAnywhere( word, "nr" );
};

/**
 * The function that creates a regex-string.
 *
 * @param {String} word A word that should be found anywhere in a string, but not if followed by an 'n', 'r' or 's'.
 * @returns {String} The regex-string.
 */
var getExclusionsNoNRSRegex = function ( word ) {
	return getExclusionAnywhere( word, "nrs" );
};

/**
 * The function that creates a regex-string.
 *
 * @param {String} word A word that should be found at the beginning or end of a string, but not if followed by an 's'.
 * @returns {String} The regex-string.
 */
var getExclusionsBeginEndNoSRegex = function ( word ) {
	return getExclusionBeginEnd( word, "s" );
};

/**
 * The function that creates a regex-string.
 *
 * @param {String} word A word that should be found at the beginning or end of a string, but not if followed by an 'n' or 'r'.
 * @returns {String} The regex-string.
 */
var getExclusionsBeginEndNoNRRegex = function ( word ) {
	return getExclusionBeginEnd( word, "nr" );
};

/**
 * The function that creates a regex-string.
 *
 * @param {String} word A word that should be found at the beginning or end of a string, but not if followed by an 'n', 'r' or 's'.
 * @returns {String} The regex-string.
 */
var getExclusionsBeginEndNoNRSRegex = function ( word ) {
	return getExclusionBeginEnd( word, "nrs" );
};

/**
 * The function that creates a regex-string.
 *
 * @param {String} word A word that should be found anywhere in a string.
 * @returns {String} The regex-string.
 */
var getExclusionWordPartRegex = function ( word ) {
	return "(" + word + ")";
};

/**
 * The function that creates a regex-string.
 *
 * @param {String} word A word that should be found at the beginning or end of a string.
 * @returns {String} The regex-string.
 */
var getExclusionCompoundRegex = function ( word ) {
	return "^(" + word + ")|(" + word + "$)";
};

/**
 * The function that creates a regex-string.
 *
 * @param {String} word A word that should be found at the end of a string.
 * @returns {String} The regex-string.
 */
var getExclusionCompoundEndRegex = function ( word ) {
	return "(" + word + "$)";
};

/**
 * The function that creates a regex-string.
 *
 * @param {String} word A word that should be found at the end of a string, including its plural.
 * @returns {String} The regex-string.
 */
var getExclusionsEndPluralRegex = function ( word ) {
	return "^(" + word + "s?)|(" + word + "s?$)";
};

/**
 * The function that creates a regex-string.
 *
 * @param {String} word A word that should be found at the begin of a string, but not if followed by an 's'.
 * @returns {String} The regex-string.
 */
var getExclusionsBeginNoSRegex = function ( word ) {
	return "(^" + word + "[^s])|(^" + word + "$)";
};

/**
 * The function that creates a regex out of a word that should only be found as independent word in the string.
 *
 * @param {String} word A word that should only be found as independent word in the string.
 * @returns {String} The regex created with the exclusion words and disallowed letters.
 */
var getExclusionIndependent = function ( word ) {
	return "(^" + word + "$)";
};

/**
 * The function building a regex for the list of exclusion words.
 *
 * @param {Array} exclusionWords The exclusion words to match in the regex.
 * @param {Function} getExclusionRegex The function building the regex for a word.
 * @returns {RegExp} The regex built with the exclusion words.
 */
var getRegex = function ( exclusionWords, getExclusionRegex ) {
	var wordArray = [];
	for ( var k = 0; k < exclusionWords.length; k++ ) {
		wordArray.push( getExclusionRegex( exclusionWords[ k ].word ) );
	}
	return arrayToRegex( wordArray, true );
};

/**
 * The function building a regex for exclusion words that should only be found as independent words in the string.
 * @param {string} locale The locale
 * @returns {RegExp} The regex built with the exclusion words that should only be found as independent words in the string.
 */
var getExclusionWordRegex = function ( locale ) {
	return getRegex( syllableArray( locale ).exclusionWords, getExclusionIndependent );
};

/**
 * The function building a regex for exclusion words that should be found at the end of a string.
 * @param {string} locale The locale
 * @returns {RegExp} The regex built with the exclusion words that should be found at the end of a string.
 */
var getCompoundRegex = function ( locale ) {
	return getRegex( syllableArray( locale ).exclusionCompounds, getExclusionCompoundRegex );
};

/**
 * The function building a regex for exclusion words that should be found at the beginning or end of a string.
 * @param {string} locale The locale
 * @returns {RegExp} The regex built with the exclusion words that should be found at the beginning or end of a string.
 */
var getCompoundEndRegex = function ( locale ) {
	return getRegex( syllableArray( locale ).exclusionCompoundEnds, getExclusionCompoundEndRegex );
};

/**
 * The function building a regex for exclusion words that should be found at the end of the string, including their plurals.
 * @param {string} locale The locale
 * @returns {RegExp} The regex built with the exclusion words that should be found at the end of the string, including their plurals.
 */
var getEndPluralRegex = function ( locale ) {
	return getRegex( syllableArray( locale ).exclusionsEndPlural, getExclusionsEndPluralRegex );
};

/**
 * The function building a regex for exclusion words that should be found at the begin or end of the string, but not if followed by an 's'
 * @param {string} locale The locale
 * @returns {RegExp} The regex built with the exclusion words that should be found at the begin
 * or end of the string, but not if followed by an 's'
 */
var getBeginEndNoSRegex = function ( locale ) {
	return getRegex( syllableArray( locale ).exclusionsBeginEndNoS, getExclusionsBeginEndNoSRegex );
};

/**
 * The function building a regex for exclusion words that should be found at the beginning of a string, but not if followed by an 's'.
 * @param {string} locale The locale
 * @returns {RegExp} The regex built with the exclusion words that should be found at the beginning of a string,
 * but not if followed by an 's'.
 */
var getBeginNoSRegex = function ( locale ) {
	return getRegex( syllableArray( locale ).exclusionsBeginNoS, getExclusionsBeginNoSRegex );
};

/**
 * The function building a regex for exclusion words that should be found anywhere in a string, but not if followed by an 'n'.
 * @param {string} locale The locale
 * @returns {RegExp} The regex built with the exclusion words that should be found anywhere in a string,
 * but not if followed by an 'n'.
 */
var getNoNRegex = function ( locale ) {
	return getRegex( syllableArray( locale ).exclusionsNoN, getExclusionsNoNRegex );
};

/**
 * The function building a regex for exclusion words that should be found anywhere in a string, but not if followed by an 'n' or 's'.
 * @param {string} locale The locale
 * @returns {RegExp} The regex built with the exclusion words that should be found anywhere in a string,
 * but not if followed by an 'n' or 's'.
 */
var getNoNSRegex = function ( locale ) {
	return getRegex( syllableArray( locale ).exclusionsNoNS, getExclusionsNoNSRegex );
};

/**
 * The function building a regex for exclusion words that should be found anywhere in a string, but not if followed by an 'r' or 's'..
 * @param {string} locale The locale
 * @returns {RegExp} The regex built with the exclusion words that should be found anywhere in a string,
 * but not if followed by an 'r' or 's'..
 */
var getNoRSRegex = function ( locale ) {
	return getRegex( syllableArray( locale ).exclusionsNoRS, getExclusionsNoRSRegex );
};

/**
 * The function building a regex for exclusion words that should be found anywhere in a string, but not if followed by an 'n' or 'r'.
 * @param {string} locale The locale
 * @returns {RegExp} The regex built with the exclusion words that should be found anywhere in a string,
 * but not if followed by an 'n' or 'r'.
 */
var getNoNRRegex = function ( locale ) {
	return getRegex( syllableArray( locale ).exclusionsNoNR, getExclusionsNoNRRegex );
};

/**
 * The function building a regex for exclusion words that should be found at the beginning or end of a string.
 * @param {string} locale The locale
 * @returns {RegExp} The regex built with the exclusion words that should be found at the beginning or end of a string.
 */
var getBeginEndNoNRRegex = function ( locale ) {
	return getRegex( syllableArray( locale ).exclusionsBeginEndNoNR, getExclusionsBeginEndNoNRRegex );
};

/**
 * The function building a regex for exclusion words that should be found at the beginning
 * or end of a string, but not if followed by an 'n' or 'r'.
 * @param {string} locale The locale
 * @returns {RegExp} The regex built with the exclusion words that should be found at the beginning or end of a string,
 * but not if followed by an 'n' or 'r'.
 */
var getNoNRSRegex = function ( locale ) {
	return getRegex( syllableArray( locale ).exclusionsNoNRS, getExclusionsNoNRSRegex );
};

/**
 * The function building a regex for exclusion words that should be found anywhere in a string, but not if followed by an 'n', 'r' or 's'.
 * @param {string} locale The locale
 * @returns {RegExp} The regex built with the exclusion words that should be found anywhere in a string,
 * but not if followed by an 'n', 'r' or 's'.
 */
var getBeginEndNoNRSRegex = function ( locale ) {
	return getRegex( syllableArray( locale ).exclusionsBeginEndNoNRS, getExclusionsBeginEndNoNRSRegex );
};

/**
 * The function building a regex for exclusion words that should be found anywhere in a string.
 * @param {string} locale The locale
 * @returns {RegExp} The regex built with the exclusion words that should be found anywhere in a string.
 */
var getWordPartRegex = function ( locale ) {
	return getRegex( syllableArray( locale ).exclusionWordParts, getExclusionWordPartRegex );
};

/**
 * The function counting the syllables in exclusion words.
 *
 * @param {String} word A word from the text.
 * @param {String} exclusionRegex The regex-string.
 * @param {Array} exclusionWords The list with exclusion words.
 * @returns {number} The syllable count.
 */

var countSyllablesInExclusions = function ( word, exclusionRegex, exclusionWords ) {
	var count = 0;
	for ( var i = 0; i < exclusionWords.length; i++ ) {
		var regex = new RegExp( exclusionRegex( exclusionWords[ i ].word ), "ig" );
		var matches = word.match( regex );
		if ( matches !== null ) {
			count += ( matches.length * exclusionWords[ i ].syllables );
		}
	}
	return count;
};

/**
 * The function that counts the number of exclusion syllables using the getExclusionIndependent.
 *
 * @param {string} word The word from the text of which the exclusion syllables are counted.
 * @param {string} locale The locale
 * @returns {number} The syllable count.
 */
var countSyllablesInExclusionsWords = function ( word, locale ) {
	return countSyllablesInExclusions( word, getExclusionIndependent, syllableArray( locale ).exclusionWords );
};


/**
 * The function that counts the number of exclusion syllables using the getExclusionsEndPluralRegex.
 *
 * @param {string} word The word from the text of which the exclusion syllables are counted.
 * @param {string} locale The locale
 * @returns {number} The syllable count.
 */
var countSyllablesInExclusionsEndPlural = function ( word, locale ) {
	return countSyllablesInExclusions( word, getExclusionsEndPluralRegex, syllableArray( locale ).exclusionsEndPlural );
};

/**
 * The function that counts the number of exclusion syllables using the getExclusionsBeginEndNoSRegex.
 *
 * @param {string} word The word from the text of which the exclusion syllables are counted.
 * @param {string} locale The locale
 * @returns {number} The syllable count.
 */
var countSyllablesInExclusionsBeginEndNoS = function ( word, locale ) {
	return countSyllablesInExclusions( word, getExclusionsBeginEndNoSRegex, syllableArray( locale ).exclusionsBeginEndNoS );
};

/**
 * The function that counts the number of exclusion syllables using the getExclusionsBeginNoSRegex.
 *
 * @param {string} word The word from the text of which the exclusion syllables are counted.
 * @param {string} locale The locale
 * @returns {number} The syllable count.
 */
var countSyllablesInExclusionsBeginNoS = function ( word, locale ) {
	return countSyllablesInExclusions( word, getExclusionsBeginNoSRegex, syllableArray( locale ).exclusionsBeginNoS );
};

/**
 * The function that counts the number of exclusion syllables using the getExclusionsNoNRegex.
 *
 * @param {string} word The word from the text of which the exclusion syllables are counted.
 * @param {string} locale The locale
 * @returns {number} The syllable count.
 */
var countSyllablesInExclusionsNoN = function ( word, locale ) {
	return countSyllablesInExclusions( word, getExclusionsNoNRegex, syllableArray( locale ).exclusionsNoN );
};

/**
 * The function that counts the number of exclusion syllables using the getExclusionsNoNSRegex.
 *
 * @param {string} word The word from the text of which the exclusion syllables are counted.
 * @param {string} locale The locale
 * @returns {number} The syllable count.
 */
var countSyllablesInExclusionsNoNS = function ( word, locale ) {
	return countSyllablesInExclusions( word, getExclusionsNoNSRegex, syllableArray( locale ).exclusionsNoNS );
};

/**
 * The function that counts the number of exclusion syllables using the getExclusionsNoRSRegex.
 *
 * @param {string} word The word from the text of which the exclusion syllables are counted.
 * @param {string} locale The locale
 * @returns {number} The syllable count.
 */
var countSyllablesInExclusionsNoRS = function ( word, locale ) {
	return countSyllablesInExclusions( word, getExclusionsNoRSRegex, syllableArray( locale ).exclusionsNoRS );
};

/**
 * The function that counts the number of exclusion syllables using the getExclusionsNoNRRegex.
 *
 * @param {string} word The word from the text of which the exclusion syllables are counted.
 * @param {string} locale The locale
 * @returns {number} The syllable count.
 */
var countSyllablesInExclusionsNoNR = function ( word, locale ) {
	return countSyllablesInExclusions( word, getExclusionsNoNRRegex, syllableArray( locale ).exclusionsNoNR );
};

/**
 * The function that counts the number of exclusion syllables using the getExclusionsBeginEndNoNRRegex.
 *
 * @param {string} word The word from the text of which the exclusion syllables are counted.
 * @param {string} locale The locale
 * @returns {number} The syllable count.
 */
var countSyllablesInExclusionsBeginEndNoNR = function ( word, locale ) {
	return countSyllablesInExclusions( word, getExclusionsBeginEndNoNRRegex, syllableArray( locale ).exclusionsBeginEndNoNR );
};

/**
 * The function that counts the number of exclusion syllables using the getExclusionsNoNRSRegex.
 *
 * @param {string} word The word from the text of which the exclusion syllables are counted.
 * @param {string} locale The locale
 * @returns {number} The syllable count.
 */
var countSyllablesInExclusionsNoNRS = function ( word, locale ) {
	return countSyllablesInExclusions( word, getExclusionsNoNRSRegex, syllableArray( locale ).exclusionsNoNRS );
};

/**
 * The function that counts the number of exclusion syllables using the getExclusionsBeginEndNoNRSRegex.
 *
 * @param {string} word The word from the text of which the exclusion syllables are counted.
 * @param {string} locale The locale
 * @returns {number} The syllable count.
 */
var countSyllablesInExclusionsBeginEndNoNRS = function ( word, locale ) {
	return countSyllablesInExclusions( word, getExclusionsBeginEndNoNRSRegex, syllableArray( locale ).exclusionsBeginEndNoNRS );
};

/**
 * The function that counts the number of exclusion syllables using the getExclusionCompoundRegex.
 *
 * @param {string} word The word from the text of which the exclusion syllables are counted.
 * @param {string} locale The locale
 * @returns {number} The syllable count.
 */
var countSyllablesInCompoundWordParts = function ( word, locale ) {
	return countSyllablesInExclusions( word, getExclusionCompoundRegex, syllableArray( locale ).exclusionCompounds );
};

/**
 * The function that counts the number of exclusion syllables using the getExclusionCompoundEndRegex.
 *
 * @param {string} word The word from the text of which the exclusion syllables are counted.
 * @param {string} locale The locale
 * @returns {number} The syllable count.
 */
var countSyllablesInCompoundWordEnds = function ( word, locale ) {
	return countSyllablesInExclusions( word, getExclusionCompoundEndRegex, syllableArray( locale ).exclusionCompoundEnds );
};

/**
 * The function that counts the number of exclusion syllables using the getExclusionWordPartRegex.
 *
 * @param {string} word The word from the text of which the exclusion syllables are counted.
 * @param {string} locale The locale
 * @returns {number} The syllable count.
 */
var countSyllablesInExclusionWordParts = function ( word, locale ) {
	return countSyllablesInExclusions( word, getExclusionWordPartRegex, syllableArray( locale ).exclusionWordParts );
};

/**
 * Counts the syllables by splitting on consonants.
 *
 * @param {string} word A word to count syllables for.
 * @returns {number} The syllable count
 */
var countBasicSyllables = function( word ) {
	var i, splitWord, count = 0;
	splitWord = word.split( /[^aáäâeéëêiíïîoóöôuúüûy]/g );
	for ( i = 0; i < splitWord.length; i++ ) {
		if ( splitWord[ i ] !== "" ) {
			count++;
		}
	}
	return count;
};

/**
 * Advanced syllable counter to match texstring with regexes.
 *
 * @param {String} word The word to count the syllables for.
 * @param {String} operator The operator to determine which regex to use.
 * @param {string} locale The paper's locale
 * @returns {number} The amount of syllables found in a word.
 */
var countAdvancedSyllables = function( word, operator, locale ) {
	var matches;
	var regex = "";
	switch ( operator ) {
		case "add":
			regex = arrayToRegex( syllableArray( locale ).addSyllables, true );
			break;
		case "subtract":
			regex = arrayToRegex( syllableArray( locale ).subtractSyllables, true );
			break;
		default:
			break;
	}
	matches = word.match( regex ) || [];
	return matches.length;
};

/**
 * Counts the number of syllables in a text string, calls exclusion word syllable counters, basic syllable
 * counter and advanced syllable counter.
 *
 * @param {String} text The text to count the syllables from.
 * @param {String} locale The paper's locale
 * @returns {number} The syllable count
 */
module.exports = function( text, locale ) {
	var count = 0;
	var exclusionWordRegex = getExclusionWordRegex( locale );
	var compoundRegex = getCompoundRegex( locale );
	var wordPartRegex = getWordPartRegex( locale );
	var compoundEndRegex = getCompoundEndRegex( locale );
	var exclusionsEndPluralRegex = getEndPluralRegex( locale );
	var exclusionsBeginEndNoSRegex = getBeginEndNoSRegex( locale );
	var exclusionsBeginNoSRegex = getBeginNoSRegex( locale );
	var exclusionsNoNRegex = getNoNRegex( locale );
	var exclusionsNoNSRegex = getNoNSRegex( locale );
	var exclusionsNoRSRegex = getNoRSRegex( locale );
	var exclusionsNoNRRegex = getNoNRRegex( locale );
	var exclusionsBeginEndNoNRRegex = getBeginEndNoNRRegex( locale );
	var exclusionsNoNRSRegex = getNoNRSRegex( locale );
	var exclusionsBeginEndNoNRSRegex = getBeginEndNoNRSRegex( locale );

	text = text.replace( /[.,!?:;¿¡]/g, " " );
	var words = getWords( text );
	forEach( words, function ( word ) {

		console.log( word );
		var exclusions = [
			{
				countSyllables: countSyllablesInExclusionsWords,
				replacementRegex: exclusionWordRegex
			},
			{
				countSyllables: countSyllablesInCompoundWordParts,
				replacementRegex: compoundRegex
			},
			{
				countSyllables: countSyllablesInCompoundWordEnds,
				replacementRegex: compoundEndRegex
			},
			{
				countSyllables: countSyllablesInExclusionWordParts,
				replacementRegex: wordPartRegex
			},
			{
				countSyllables: countSyllablesInExclusionsEndPlural,
				replacementRegex: exclusionsEndPluralRegex
			},
			{
				countSyllables: countSyllablesInExclusionsBeginEndNoS,
				replacementRegex: exclusionsBeginEndNoSRegex
			},
			{
				countSyllables: countSyllablesInExclusionsBeginNoS,
				replacementRegex: exclusionsBeginNoSRegex
			},
			{
				countSyllables: countSyllablesInExclusionsNoN,
				replacementRegex: exclusionsNoNRegex
			},
			{
				countSyllables: countSyllablesInExclusionsNoNS,
				replacementRegex: exclusionsNoNSRegex
			},
			{
				countSyllables: countSyllablesInExclusionsNoRS,
				replacementRegex: exclusionsNoRSRegex
			},
			{
				countSyllables: countSyllablesInExclusionsNoNR,
				replacementRegex: exclusionsNoNRRegex
			},
			{
				countSyllables: countSyllablesInExclusionsBeginEndNoNR,
				replacementRegex: exclusionsBeginEndNoNRRegex
			},
			{
				countSyllables: countSyllablesInExclusionsNoNRS,
				replacementRegex: exclusionsNoNRSRegex
			},
			{
				countSyllables: countSyllablesInExclusionsBeginEndNoNRS,
				replacementRegex: exclusionsBeginEndNoNRSRegex
			}
		];

		forEach( exclusions, function( exclusion ) {
			var syllableCount = exclusion.countSyllables( word, locale );
			if ( syllableCount > 0 ) {
				count += syllableCount;

				word = replaceWord( word, exclusion.replacementRegex );
				console.log( word );
			}
		} );

		console.log(count)
		count += countBasicSyllables( word );
		console.log(count)
		count += countAdvancedSyllables( word, "add", locale );
		console.log(count)
		count -= countAdvancedSyllables( word, "subtract", locale );
		console.log(count)
		/*
		forEach( word, function( word ) {
			console.log(count)
			count += countBasicSyllables( text );
			console.log(count)
			count += countAdvancedSyllables( text, "add", locale );
			console.log(count)
			count -= countAdvancedSyllables( text, "subtract", locale );
			console.log(count)

		})*/
	} );


/*
	count += countExclusionSyllables( text, locale );

	text = removeExclusionWords( text, locale );

	count += countBasicSyllables( text );
	//console.log( count );
	count += countAdvancedSyllables( text, "add", locale );
	//console.log( count );
	count -= countAdvancedSyllables( text, "subtract", locale );
	//console.log( count );

	*/
	console.log( count );
	return count;

};

