package code

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/search/shared"
)

func TestSearchCodeSymbolsGo(t *testing.T) {
	dir := t.TempDir()
	goContent := `package main

func ParseCard(s string) Card {
	return Card{}
}

type Card struct {
	Value string
}

var MaxRetries = 3
`
	os.WriteFile(filepath.Join(dir, "main.go"), []byte(goContent), 0644)

	results, err := searchCodeSymbols("Parse", dir, "", "", 0)
	if err != nil {
		t.Fatal(err)
	}
	if len(results) == 0 {
		t.Fatal("expected results, got none")
	}
	if results[0].Symbol != "ParseCard" {
		t.Errorf("symbol = %q, want %q", results[0].Symbol, "ParseCard")
	}
	if results[0].Kind != "method" {
		t.Errorf("kind = %q, want %q", results[0].Kind, "method")
	}
	if results[0].Language != "go" {
		t.Errorf("language = %q, want %q", results[0].Language, "go")
	}
}

func TestSearchCodeSymbolsKindFilter(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "main.go"), []byte("func Hello() {}\ntype World struct {}\n"), 0644)

	results, err := searchCodeSymbols(".", dir, "", "function", 0)
	if err != nil {
		t.Fatal(err)
	}
	for _, r := range results {
		if r.Kind != "function" {
			t.Errorf("expected only functions, got %s %s", r.Kind, r.Symbol)
		}
	}
}

func TestSearchCodeSymbolsLangFilter(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "main.go"), []byte("func Hello() {}"), 0644)
	os.WriteFile(filepath.Join(dir, "main.py"), []byte("def hello():\n    pass\n"), 0644)

	results, err := searchCodeSymbols("hello", dir, "py", "", 0)
	if err != nil {
		t.Fatal(err)
	}
	if len(results) != 1 {
		t.Fatalf("expected 1 result, got %d", len(results))
	}
	if results[0].Language != "python" {
		t.Errorf("language = %q, want %q", results[0].Language, "python")
	}
}

func TestSearchCodeSymbolsNoMatch(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "main.go"), []byte("func Hello() {}"), 0644)

	results, err := searchCodeSymbols("NonExistent", dir, "", "", 0)
	if err != nil {
		t.Fatal(err)
	}
	if len(results) != 0 {
		t.Errorf("expected 0 results, got %d", len(results))
	}
}

func TestSearchCodeSymbolsMaxResults(t *testing.T) {
	dir := t.TempDir()
	content := ""
	for i := 0; i < 10; i++ {
		content += "func Func() {}\n"
	}
	os.WriteFile(filepath.Join(dir, "main.go"), []byte(content), 0644)

	results, err := searchCodeSymbols("Func", dir, "", "", 3)
	if err != nil {
		t.Fatal(err)
	}
	if len(results) > 3 {
		t.Errorf("expected at most 3 results, got %d", len(results))
	}
}

func TestOutputCodeResultsText(t *testing.T) {
	results := []symbolMatch{
		{File: "main.go", Line: 1, Symbol: "Hello", Kind: "function", Language: "go"},
	}
	output := shared.CaptureOutput(func() {
		if err := outputCodeResults(results, "Hello", false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Hello") {
		t.Errorf("expected Hello in output, got: %s", output)
	}
	if !strings.Contains(output, "function") {
		t.Errorf("expected function in output, got: %s", output)
	}
}

func TestOutputCodeResultsJSON(t *testing.T) {
	results := []symbolMatch{
		{File: "main.go", Line: 1, Symbol: "Hello", Kind: "function", Language: "go"},
	}
	output := shared.CaptureOutput(func() {
		if err := outputCodeResults(results, "Hello", true); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, `"symbol": "Hello"`) {
		t.Errorf("expected JSON with Hello, got: %s", output)
	}
	if !strings.Contains(output, `"count": 1`) {
		t.Errorf("expected count 1, got: %s", output)
	}
}

func TestOutputCodeResultsMultiple(t *testing.T) {
	results := []symbolMatch{
		{File: "a.go", Line: 1, Symbol: "Hello", Kind: "function", Language: "go"},
		{File: "b.go", Line: 1, Symbol: "World", Kind: "function", Language: "go"},
	}
	output := shared.CaptureOutput(func() {
		if err := outputCodeResults(results, "test", false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "2 symbols found") {
		t.Errorf("expected count in output, got: %s", output)
	}
}

func TestSearchCodeSymbolsReadError(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "main.go"), []byte("func Hello() {}"), 0000)

	results, err := searchCodeSymbols("Hello", dir, "", "", 0)
	if err != nil {
		t.Fatal(err)
	}
	if len(results) != 0 {
		t.Errorf("expected 0 results for unreadable file, got %d", len(results))
	}
}

func TestOutputCodeResultsEmpty(t *testing.T) {
	output := shared.CaptureOutput(func() {
		if err := outputCodeResults(nil, "Hello", false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "no symbols found") {
		t.Errorf("expected 'no symbols found', got: %s", output)
	}
}

func TestSearchCodeSymbolsInvalidPattern(t *testing.T) {
	_, err := searchCodeSymbols("[invalid", ".", "", "", 0)
	if err == nil {
		t.Fatal("expected error for invalid pattern")
	}
}
