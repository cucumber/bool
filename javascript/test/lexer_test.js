var assert = require('assert');
var lexer = require('../lib/lexer');
// Install our own parseError function that doesn't depend on the parser.
var SyntaxError = require('../lib/syntax_error');
lexer.parseError = function(message, hash){
  throw new SyntaxError(message, hash);
};

function lex() {
  return [lexer.lex(), lexer.yytext];
}

describe('Lexer', function() {
  it('tokenizes a feature keyword', function() {
    lexer.setInput("  \n  Feature:");

    assert.deepEqual([ 'TOKEN_FEATURE', 'Feature:' ], lex());
  });

  it('tokenizes a named feature with given when', function() {
    lexer.setInput("Feature:     Hello\n" +
                   "  Given I have 4 cukes in my belly\n" +
                   "  When I go shopping\n"
                   );

    assert.deepEqual([ 'TOKEN_FEATURE', 'Feature:' ], lex());
    assert.deepEqual([ 'TOKEN_NAME', 'Hello' ], lex());
    assert.deepEqual([ 'TOKEN_STEP', 'Given ' ], lex());
    assert.deepEqual([ 'TOKEN_NAME', 'I have 4 cukes in my belly' ], lex());
    assert.deepEqual([ 'TOKEN_STEP', 'When ' ], lex());
    assert.deepEqual([ 'TOKEN_NAME', 'I go shopping' ], lex());
  });

  it('tokenizes a named feature with description', function() {
    lexer.setInput("Feature:     Hello\n" +
                   "  This is a description\n" +
                   "  and so is this");

    assert.deepEqual([ 'TOKEN_FEATURE', 'Feature:' ], lex());
    assert.deepEqual([ 'TOKEN_NAME', 'Hello' ], lex());
    assert.deepEqual([ 'TOKEN_DESCRIPTION_LINE', 'This is a description' ], lex());
    assert.deepEqual([ 'TOKEN_DESCRIPTION_LINE', 'and so is this' ], lex());
  });

  it('does not recognise a spaceless keyword', function() {
    lexer.setInput("Feature: Hello\n" +
                   "  Whenny is not a keyword\n"
                   );

    assert.deepEqual([ 'TOKEN_FEATURE', 'Feature:' ], lex());
    assert.deepEqual([ 'TOKEN_NAME', 'Hello' ], lex());
    assert.deepEqual([ 'TOKEN_DESCRIPTION_LINE', 'Whenny is not a keyword' ], lex());
  });

  it ('tokenizes descriptions and given when then even when description is long', function() {
    lexer.setInput("Feature:     Hello\n" +
                   "  this is a longer description than the given step\n" +
                   "  Given a step");

    assert.deepEqual([ 'TOKEN_FEATURE', 'Feature:' ], lex());
    assert.deepEqual([ 'TOKEN_NAME', 'Hello' ], lex());
    assert.deepEqual([ 'TOKEN_DESCRIPTION_LINE', 'this is a longer description than the given step' ], lex());
    assert.deepEqual([ 'TOKEN_STEP', 'Given ' ], lex());
    assert.deepEqual([ 'TOKEN_NAME', 'a step' ], lex());
  });

  it ('tokenizes descriptions and given/when/then when the steps are longer than the descriptions', function() {
    lexer.setInput("Feature:     Hello\n" +
                   "  description\n" +
                   "more\n" +
                   "  Given a reasonably long step\n" +
                   "  When I do something interesting\n" +
                   "  Then stuff happens"
                   );

    assert.deepEqual([ 'TOKEN_FEATURE', 'Feature:' ], lex());
    assert.deepEqual([ 'TOKEN_NAME', 'Hello' ], lex());
    assert.deepEqual([ 'TOKEN_DESCRIPTION_LINE', 'description' ], lex());
    assert.deepEqual([ 'TOKEN_DESCRIPTION_LINE', 'more' ], lex());
    assert.deepEqual([ 'TOKEN_STEP', 'Given ' ], lex());
    assert.deepEqual([ 'TOKEN_NAME', 'a reasonably long step' ], lex());
    assert.deepEqual([ 'TOKEN_STEP', 'When ' ], lex());
    assert.deepEqual([ 'TOKEN_NAME', 'I do something interesting' ], lex());
    assert.deepEqual([ 'TOKEN_STEP', 'Then ' ], lex());
    assert.deepEqual([ 'TOKEN_NAME', 'stuff happens' ], lex());
  });

  it ('lexes a DocString', function() {
    lexer.setInput("  \"\"\"  \n" +
                   "  This is\n" +
                   "   a DocString\n" +
                   "  \"\"\"\n");

    assert.deepEqual([ 'TOKEN_TREBLE_QUOTE', '"""  ' ], lex());
    assert.deepEqual([ 'TOKEN_DOC_STRING', '\n  This is\n   a DocString' ], lex());
    assert.deepEqual([ 'TOKEN_TREBLE_QUOTE', '\n  """' ], lex());
  });

  it ('lexes cells', function() {
    lexer.setInput("|foo|bar|");

    assert.deepEqual([ 'TOKEN_PIPE', '|' ], lex());
    assert.deepEqual([ 'TOKEN_CELL', 'foo' ], lex());
    assert.deepEqual([ 'TOKEN_PIPE', '|' ], lex());
    assert.deepEqual([ 'TOKEN_CELL', 'bar' ], lex());
    assert.deepEqual([ 'TOKEN_PIPE', '|' ], lex());
  });

  it ('lexes empty cells', function() {
    lexer.setInput("|||");

    assert.deepEqual([ 'TOKEN_PIPE', '|' ], lex());
    assert.deepEqual([ 'TOKEN_PIPE', '|' ], lex());
    assert.deepEqual([ 'TOKEN_PIPE', '|' ], lex());
  });
});

