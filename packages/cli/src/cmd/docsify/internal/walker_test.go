package internal

import (
	"os"
	"path/filepath"
	"testing"
)

func TestExtLang(t *testing.T) {
	tests := []struct {
		ext      string
		expected Language
		present  bool
	}{
		{".go", LangGo, true},
		{".ts", LangTypeScript, true},
		{".tsx", LangTypeScript, true},
		{".js", LangJavaScript, true},
		{".jsx", LangJavaScript, true},
		{".py", LangPython, true},
		{".rs", LangRust, true},
		{".java", "", false},
		{".md", "", false},
	}
	for _, tc := range tests {
		got, ok := extLang[tc.ext]
		if !tc.present {
			if ok {
				t.Errorf("extLang[%q] should not exist", tc.ext)
			}
			continue
		}
		if !ok {
			t.Errorf("extLang[%q] should exist", tc.ext)
		}
		if got != tc.expected {
			t.Errorf("extLang[%q] = %q, want %q", tc.ext, got, tc.expected)
		}
	}
}

func TestWalk(t *testing.T) {
	dir := t.TempDir()

	files := []struct {
		path string
		lang Language
	}{
		{"main.go", LangGo},
		{"lib.ts", LangTypeScript},
		{"ui.tsx", LangTypeScript},
		{"util.js", LangJavaScript},
		{"setup.jsx", LangJavaScript},
		{"script.py", LangPython},
		{"mod.rs", LangRust},
	}
	for _, f := range files {
		p := filepath.Join(dir, f.path)
		if err := os.WriteFile(p, nil, 0644); err != nil {
			t.Fatal(err)
		}
	}

	os.WriteFile(filepath.Join(dir, ".hidden.go"), nil, 0644)
	os.Mkdir(filepath.Join(dir, "node_modules"), 0755)
	os.WriteFile(filepath.Join(dir, "node_modules", "pkg.js"), nil, 0644)
	os.WriteFile(filepath.Join(dir, "readme.md"), nil, 0644)

	result, err := Walk(dir, nil)
	if err != nil {
		t.Fatal(err)
	}

	if len(result) != len(files)+1 {
		t.Errorf("expected %d files (including node_modules/pkg.js), got %d", len(files)+1, len(result))
	}

	for _, f := range result {
		if f.Lang == LangUnknown {
			t.Errorf("unexpected unknown language for %s", f.RelPath)
		}
	}
}

func TestWalk_excludeDirs(t *testing.T) {
	dir := t.TempDir()

	os.MkdirAll(filepath.Join(dir, "vendor", "pkg"), 0755)
	os.WriteFile(filepath.Join(dir, "vendor", "pkg", "lib.go"), nil, 0644)
	os.WriteFile(filepath.Join(dir, "main.go"), nil, 0644)

	exclude := map[string]bool{"vendor": true}
	result, err := Walk(dir, exclude)
	if err != nil {
		t.Fatal(err)
	}

	for _, f := range result {
		if filepath.HasPrefix(f.RelPath, "vendor") {
			t.Errorf("file in excluded dir was returned: %s", f.RelPath)
		}
	}

	if len(result) != 1 {
		t.Errorf("expected 1 file (main.go), got %d", len(result))
	}
}

func TestWalk_skipUnsupportedExtension(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "notes.txt"), nil, 0644)
	os.WriteFile(filepath.Join(dir, "app.go"), nil, 0644)

	result, err := Walk(dir, nil)
	if err != nil {
		t.Fatal(err)
	}
	if len(result) != 1 {
		t.Errorf("expected 1 file (.txt skipped), got %d", len(result))
	}
}
