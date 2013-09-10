package bool;

public class Lexer implements Parser.Lexer {
    %%{
        machine lexer;
        alphtype char;

        main := |*
            [ \t\r];
            '\n'              => { ++firstLine; lineStart = p + 1; };
            [A-Za-z0-9_\-@]+  => { ret = TOKEN_VAR;    fbreak; };
            '&&'              => { ret = TOKEN_AND;    fbreak; };
            '||'              => { ret = TOKEN_OR;     fbreak; };
            '!'               => { ret = TOKEN_NOT;    fbreak; };
            '('               => { ret = TOKEN_LPAREN; fbreak; };
            ')'               => { ret = TOKEN_RPAREN; fbreak; };
        *|;
    }%%

    %%write data noerror;

    private int firstLine = 1, lastLine = 1, firstColumn = 1, lastColumn = 1;
    private int lineStart = 0;

    private int cs, ts, te, p, act;
    private final int pe, eof;
    private final char[] data;

    private String yytext = null;

    public Lexer(char[] data)  {
        this.data = data;
        eof = pe = data.length;

        %% write init;
    }

    public Lexer(String data) {
        this(data.toCharArray());
    }

    @Override
    public Position getStartPos() {
        return new Position(firstLine, firstColumn);
    }

    @Override
    public Position getEndPos() {
        return new Position(lastLine, lastColumn);
    }

    @Override
    public Token getLVal() {
        return new Token(yytext, firstLine, firstColumn, lastLine, lastColumn);
    }

    @Override
    public final int yylex() {
        int ret = -1;

        if (p == eof) {
            ret = EOF;
        }

        %% write exec;

        lastLine = firstLine;

        if(ret == -1) {
            yytext = new String(data, p, pe - p);
            String message = "syntax error: " + yytext;
            firstColumn = lastColumn = p - lineStart + 1;
            throw new SyntaxError(message, firstLine, firstColumn, lastLine, lastColumn);
        } else {
            firstColumn = ts - lineStart + 1;
            lastColumn  = te - lineStart + 1;
            yytext = new String(data, ts, te-ts);
        }

        return ret;
    }

    @Override
    public void yyerror(Parser.Location location, String message) {
        throw new SyntaxError(message, location.begin.getLine(), location.begin.getColumn(), location.end.getLine(), location.end.getColumn());
    }
}

