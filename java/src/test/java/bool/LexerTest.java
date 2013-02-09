package bool;

import org.junit.Test;

import java.io.IOException;

import static org.junit.Assert.assertEquals;

public class LexerTest {
    @Test
    public void test_lex() throws IOException {
        Lexer lexer = new Lexer("foo && bar");
        assertEquals(Parser.TOKEN_VAR, lexer.yylex());
        assertEquals("foo", lexer.yytext());

        assertEquals(Parser.TOKEN_AND, lexer.yylex());
        assertEquals("&&", lexer.yytext());

        assertEquals(Parser.TOKEN_VAR, lexer.yylex());
        assertEquals("bar", lexer.yytext());
    }

    @Test
    public void test_lex_error() throws IOException {
        Lexer lexer = new Lexer("" +
                "          \n" +
                "          \n" +
                "  a       \n" +
                "    ?     \n"
        );
        lexer.yylex();
        try {
            lexer.yylex();
        } catch (SyntaxError e) {
            assertEquals("Unexpected character: ?", e.getMessage());
            assertEquals(4, e.getLine());
            assertEquals(5, e.getColumn());
        }
    }
    
    @Test
    public void test_again() throws IOException {
        Lexer lexer = new Lexer("" +
        "          \n" +
        "          \n" +
        "  a       \n" +
        "    ||    \n" +
        "      c   \n" +
        "        &&"
        );
        lexer.yylex();
        try {
            lexer.yylex();
        } catch (SyntaxError e) {
            assertEquals("syntax error, unexpected end of input, expecting TOKEN_VAR or TOKEN_NOT or TOKEN_LPAREN", e.getMessage());
            assertEquals(6, e.getLine());
            assertEquals(10, e.getColumn());
        }
        
    }
}
