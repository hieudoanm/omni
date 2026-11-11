package code

import (
	"testing"
)

func TestCodePatternsForGo(t *testing.T) {
	name, patterns, ok := codePatternsFor("main.go", "")
	if !ok {
		t.Fatal("expected patterns for .go")
	}
	if name != "go" {
		t.Errorf("language = %q, want %q", name, "go")
	}
	if len(patterns) == 0 {
		t.Fatal("expected patterns for go")
	}
}

func TestCodePatternsForTS(t *testing.T) {
	_, patterns, ok := codePatternsFor("app.ts", "")
	if !ok {
		t.Fatal("expected patterns for .ts")
	}
	var hasFunction bool
	for _, p := range patterns {
		if p.kind == "function" {
			hasFunction = true
		}
	}
	if !hasFunction {
		t.Error("expected function pattern for .ts")
	}
}

func TestCodePatternsForJSX(t *testing.T) {
	_, _, ok := codePatternsFor("component.tsx", "")
	if !ok {
		t.Fatal("expected patterns for .tsx")
	}
}

func TestCodePatternsForPython(t *testing.T) {
	_, patterns, ok := codePatternsFor("main.py", "")
	if !ok {
		t.Fatal("expected patterns for .py")
	}
	var hasClass bool
	for _, p := range patterns {
		if p.kind == "class" {
			hasClass = true
		}
	}
	if !hasClass {
		t.Error("expected class pattern for .py")
	}
}

func TestCodePatternsForRust(t *testing.T) {
	_, patterns, ok := codePatternsFor("main.rs", "")
	if !ok {
		t.Fatal("expected patterns for .rs")
	}
	var hasFn bool
	for _, p := range patterns {
		if p.kind == "function" {
			hasFn = true
		}
	}
	if !hasFn {
		t.Error("expected function pattern for .rs")
	}
}

func TestCodePatternsForUnknown(t *testing.T) {
	_, _, ok := codePatternsFor("unknown.xyz", "")
	if ok {
		t.Error("expected no patterns for unknown extension")
	}
}

func TestCodePatternsLangFilter(t *testing.T) {
	_, _, ok := codePatternsFor("main.go", "ts")
	if ok {
		t.Error("expected no match when lang filter doesn't match")
	}

	_, _, ok = codePatternsFor("main.go", "go")
	if !ok {
		t.Error("expected match when lang filter matches")
	}
}

func TestCodePatternsLangFilterTsMismatch(t *testing.T) {
	_, _, ok := codePatternsFor("app.ts", "py")
	if ok {
		t.Error("expected no patterns for .ts when lang filter is py")
	}
}

func TestCodePatternsLangFilterPyMismatch(t *testing.T) {
	_, _, ok := codePatternsFor("main.py", "go")
	if ok {
		t.Error("expected no patterns for .py when lang filter is go")
	}
}

func TestCodePatternsLangFilterRsMismatch(t *testing.T) {
	_, _, ok := codePatternsFor("main.rs", "go")
	if ok {
		t.Error("expected no patterns for .rs when lang filter is go")
	}
}

func TestCodePatternsForJS(t *testing.T) {
	_, patterns, ok := codePatternsFor("app.js", "")
	if !ok {
		t.Fatal("expected patterns for .js")
	}
	if !containsKind(patterns, "function") {
		t.Error("expected function pattern for .js")
	}
}

func TestContainsKind(t *testing.T) {
	_, patterns, _ := codePatternsFor("main.go", "")
	if !containsKind(patterns, "function") {
		t.Error("expected go patterns to contain function")
	}
	if containsKind(patterns, "class") {
		t.Error("expected go patterns to NOT contain class")
	}
}

func TestCodeRegexPatterns(t *testing.T) {
	tests := []struct {
		ext    string
		line   string
		kind   string
		symbol string
	}{
		{".go", "func ParseCard(s string) Card", "function", "ParseCard"},
		{".go", "type Card struct {}", "type", "Card"},
		{".go", "var MaxRetries = 3", "variable", "MaxRetries"},
		{".go", "const DefaultTimeout = 30", "constant", "DefaultTimeout"},
		{".ts", "function greet(name: string) {}", "function", "greet"},
		{".ts", "class UserService {}", "class", "UserService"},
		{".ts", "interface Config {}", "interface", "Config"},
		{".py", "def hello():", "function", "hello"},
		{".py", "class Person:", "class", "Person"},
		{".rs", "fn main() {}", "function", "main"},
		{".rs", "struct Point {}", "struct", "Point"},
		{".rs", "trait Display {}", "trait", "Display"},
	}

	for _, tc := range tests {
		_, patterns, ok := codePatternsFor("file"+tc.ext, "")
		if !ok {
			t.Errorf("no patterns for %s", tc.ext)
			continue
		}

		var found bool
		for _, p := range patterns {
			if p.kind != tc.kind {
				continue
			}
			matches := p.re.FindStringSubmatch(tc.line)
			if matches != nil && matches[p.nameIdx] == tc.symbol {
				found = true
				break
			}
		}
		if !found {
			t.Errorf("pattern for %s %s did not match %q", tc.kind, tc.ext, tc.line)
		}
	}
}
