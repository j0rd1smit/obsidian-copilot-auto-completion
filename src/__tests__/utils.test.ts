import {describe, expect, test} from "@jest/globals";
import {isMatchBetweenPathAndPatterns} from "../utils";

describe("isMatchBetweenPathAndPatterns", () => {


    test.each([
        ["example.md", "*.md"],
        ["something_else.md", "*.md"],
        ["main.js", "*.js"],
        ["test.ts", "*.ts"],
    ])("should match file extension wild cards. path=%s pattern: %s", (path, pattern) => {
        const result = isMatchBetweenPathAndPatterns(path, [pattern]);
        expect(result).toBe(true);
    })

    test.each([
        "example.md",
        "src/example.md",
        "some/long/path/example.md",
        "other.md",
    ])("should always match with itself: %s", (path) => {
        const result = isMatchBetweenPathAndPatterns(path, [path]);
        expect(result).toBe(true);
    });

    test('returns false when patterns array is empty', () => {
        const result = isMatchBetweenPathAndPatterns('some/path', []);
        expect(result).toBe(false);
    });

    test('returns false when patterns array contains only empty spaces', () => {
        const result = isMatchBetweenPathAndPatterns('some/path', ['   ']);
        expect(result).toBe(false);
    })

    test('returns false when path and patterns are empty', () => {
        const result = isMatchBetweenPathAndPatterns('', []);
        expect(result).toBe(false);
    });

    test.each([
        ["src/example.md", "src/**/*.md"],
        ["src/some/long/path/example.md", "src/**/example.md"],
        ["src/some/long/path/example.md", "src/**"],

    ])("returns true if a folder wildcard pattern matches the path: path=%s pattern=`%s`", (path, pattern) => {
        const result = isMatchBetweenPathAndPatterns(path, [pattern]);
        expect(result).toBe(true);
    });

    test('supports multiple glob patterns', () => {
        const result = isMatchBetweenPathAndPatterns('some/path.js', ['**/*.js', '!**/node_modules/**']);
        expect(result).toBe(true);
    });

    test('supports negation', () => {
        const result = isMatchBetweenPathAndPatterns('some/path.js', ['!some/path.js']);
        expect(result).toBe(false);
    });

    test('supports extglobs', () => {
        const result = isMatchBetweenPathAndPatterns('some/path.js', ['some/+(*.js|*.ts)']);
        expect(result).toBe(true);
    });

    test('supports brace expansion', () => {
        const result = isMatchBetweenPathAndPatterns('some/path1.md', ['some/path{1..5}.md']);
        expect(result).toBe(true);
    });

    test('supports regex character classes', () => {
        const result = isMatchBetweenPathAndPatterns('some/path-3.js', ['some/path-[1-5].js']);
        expect(result).toBe(true);
    });

    test('supports regex logical "or"', () => {
        const result = isMatchBetweenPathAndPatterns('some/path-abc.js', ['some/path-(abc|xyz).js']);
        expect(result).toBe(true);
    });

    test('should return false for a list of empty patterns', () => {
        const result = isMatchBetweenPathAndPatterns('test.md', ['']);
        expect(result).toBe(false);
    });

    test("not matches can undo other matches", () => {
        const result = isMatchBetweenPathAndPatterns('secret/test.md', ['secret/*', '!secret/test.md']);
        expect(result).toBe(false);
    });

    test.each([
        "src/Python.md",
        "Python.md",
        "hello Python world.md",
        "src/test/Python.md",
        "src/test/hello/Python.md",
        "src/test/hello/Python world.md",
    ])("Python example from description should work for path: %s", (path) => {
        const patterns = ["**/*Python*.md"]
        const result = isMatchBetweenPathAndPatterns(path, patterns);
        expect(result).toBe(true);
    });

    test.each([
        "src/secret/test.md",
        "secret/test.md",
        "hello/secret/world.md",
        "src/test/secret/test.md",
        "src/test/hello/secret/test.md",
        "src/test/hello/secret/world.md",
    ])("secret example from description should work for path: %s", (path) => {
        const patterns = ["**/secret/**"]
        const result = isMatchBetweenPathAndPatterns(path, patterns);
        expect(result).toBe(true);
    });


    test.each([
        "path/to/folder/test.md",
        "path/to/folder/hello.md",
        "path/to/folder/sub/hello.md",
        "path/to/folder/sub2/test.md",
    ])("secret example from description should work for path: %s", (path) => {
        const patterns = ["path/to/folder/**"]
        const result = isMatchBetweenPathAndPatterns(path, patterns);
        expect(result).toBe(true);
    });
});
