package internal

import (
	"encoding/json"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestJSONQuery(t *testing.T) {
	data := map[string]interface{}{
		"name": "test",
		"nested": map[string]interface{}{
			"key": "value",
		},
		"items": []interface{}{
			map[string]interface{}{"id": 1},
			map[string]interface{}{"id": 2},
		},
	}

	tests := []struct {
		name  string
		query string
		want  interface{}
	}{
		{"root key", ".name", "test"},
		{"nested key", ".nested.key", "value"},
		{"array item", ".items[0].id", 1},
		{"second array item", ".items[1].id", 2},
	}
	for _, tt := range tests {
		got, err := JSONQuery(data, tt.query)
		if err != nil {
			t.Errorf("%s: unexpected error: %v", tt.name, err)
			continue
		}
		if got != tt.want {
			t.Errorf("%s: got %v (%T), want %v (%T)", tt.name, got, got, tt.want, tt.want)
		}
	}
}

func TestJSONQueryErrors(t *testing.T) {
	data := map[string]interface{}{
		"name": "test",
	}
	tests := []struct {
		name  string
		query string
	}{
		{"missing key", ".missing"},
		{"not an object on array", ".name[0]"},
	}
	for _, tt := range tests {
		_, err := JSONQuery(data, tt.query)
		if err == nil {
			t.Errorf("%s: expected error", tt.name)
		}
	}
}

func TestJSONDiff(t *testing.T) {
	dir := t.TempDir()
	f1 := filepath.Join(dir, "a.json")
	f2 := filepath.Join(dir, "b.json")

	write := func(path, content string) {
		if err := os.WriteFile(path, []byte(content), 0644); err != nil {
			t.Fatal(err)
		}
	}

	t.Run("identical", func(t *testing.T) {
		write(f1, `{"a":1}`)
		write(f2, `{"a":1}`)
		if err := JSONDiff(f1, f2); err != nil {
			t.Errorf("expected no error: %v", err)
		}
	})

	t.Run("one file missing", func(t *testing.T) {
		if err := JSONDiff("/nonexistent", f2); err == nil {
			t.Error("expected error for missing file")
		}
	})
}

func TestJSONMerge(t *testing.T) {
	dir := t.TempDir()
	base := filepath.Join(dir, "base.json")
	patch := filepath.Join(dir, "patch.json")

	write := func(path, content string) {
		if err := os.WriteFile(path, []byte(content), 0644); err != nil {
			t.Fatal(err)
		}
	}

	write(base, `{"a":1,"b":2}`)
	write(patch, `{"b":3,"c":4}`)

	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	if err := JSONMerge(base, patch); err != nil {
		os.Stdout = old
		t.Fatalf("unexpected error: %v", err)
	}

	w.Close()
	os.Stdout = old

	var result map[string]interface{}
	if err := json.NewDecoder(r).Decode(&result); err != nil {
		t.Fatalf("decode output: %v", err)
	}
	if result["a"] != float64(1) || result["b"] != float64(3) || result["c"] != float64(4) {
		t.Errorf("got %v, want {a:1, b:3, c:4}", result)
	}
}

func TestJSONMergeError(t *testing.T) {
	if err := JSONMerge("/nonexistent", "/nonexistent2"); err == nil {
		t.Error("expected error for missing file")
	}
}

func TestJSONDiffEdgeCases(t *testing.T) {
	dir := t.TempDir()
	f1 := filepath.Join(dir, "a.json")
	f2 := filepath.Join(dir, "b.json")

	write := func(path, content string) {
		if err := os.WriteFile(path, []byte(content), 0644); err != nil {
			t.Fatal(err)
		}
	}

	capture := func(fn func() error) (string, error) {
		old := os.Stdout
		r, w, _ := os.Pipe()
		os.Stdout = w
		err := fn()
		w.Close()
		os.Stdout = old
		out, _ := io.ReadAll(r)
		return string(out), err
	}

	t.Run("empty objects identical", func(t *testing.T) {
		write(f1, `{}`)
		write(f2, `{}`)
		out, err := capture(func() error { return JSONDiff(f1, f2) })
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
		if out != "" {
			t.Errorf("expected no output, got: %s", out)
		}
	})

	t.Run("empty vs non-empty", func(t *testing.T) {
		write(f1, `{}`)
		write(f2, `{"a":1}`)
		out, err := capture(func() error { return JSONDiff(f1, f2) })
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
		if out == "" {
			t.Error("expected output for differing files")
		}
		if !strings.Contains(out, "+") {
			t.Error("expected '+' lines in diff output")
		}
	})

	t.Run("array differences", func(t *testing.T) {
		write(f1, `[1,2,3]`)
		write(f2, `[1,2,4]`)
		out, err := capture(func() error { return JSONDiff(f1, f2) })
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
		if out == "" {
			t.Error("expected output for differing arrays")
		}
		if !strings.Contains(out, "-") || !strings.Contains(out, "+") {
			t.Error("expected both '-' and '+' in diff output")
		}
	})

	t.Run("deeply nested objects", func(t *testing.T) {
		write(f1, `{"a":{"b":{"c":1}}}`)
		write(f2, `{"a":{"b":{"c":2}}}`)
		out, err := capture(func() error { return JSONDiff(f1, f2) })
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
		if out == "" {
			t.Error("expected output for differing nested objects")
		}
	})

	t.Run("missing files", func(t *testing.T) {
		if err := JSONDiff("/nonexistent1", "/nonexistent2"); err == nil {
			t.Error("expected error for missing files")
		}
	})
}

func TestJSONMergeEdgeCases(t *testing.T) {
	dir := t.TempDir()
	base := filepath.Join(dir, "base.json")
	patch := filepath.Join(dir, "patch.json")

	write := func(path, content string) {
		if err := os.WriteFile(path, []byte(content), 0644); err != nil {
			t.Fatal(err)
		}
	}

	capture := func(fn func() error) (map[string]interface{}, error) {
		old := os.Stdout
		r, w, _ := os.Pipe()
		os.Stdout = w
		err := fn()
		w.Close()
		os.Stdout = old
		var result map[string]interface{}
		decodeErr := json.NewDecoder(r).Decode(&result)
		if decodeErr != nil {
			return nil, decodeErr
		}
		return result, err
	}

	t.Run("empty base", func(t *testing.T) {
		write(base, `{}`)
		write(patch, `{"a":1}`)
		result, err := capture(func() error { return JSONMerge(base, patch) })
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
		if result["a"] != float64(1) {
			t.Errorf("got %v, want a=1", result)
		}
	})

	t.Run("empty patch", func(t *testing.T) {
		write(base, `{"a":1}`)
		write(patch, `{}`)
		result, err := capture(func() error { return JSONMerge(base, patch) })
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
		if result["a"] != float64(1) {
			t.Errorf("got %v, want a=1", result)
		}
	})

	t.Run("conflicting key types", func(t *testing.T) {
		write(base, `{"a":1}`)
		write(patch, `{"a":"one"}`)
		result, err := capture(func() error { return JSONMerge(base, patch) })
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
		if result["a"] != "one" {
			t.Errorf("got %v, want a=\"one\"", result)
		}
	})

	t.Run("deep nesting replaced", func(t *testing.T) {
		write(base, `{"a":{"b":1,"c":2}}`)
		write(patch, `{"a":{"b":2}}`)
		result, err := capture(func() error { return JSONMerge(base, patch) })
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
		nested, ok := result["a"].(map[string]interface{})
		if !ok {
			t.Fatalf("expected map for 'a', got %T", result["a"])
		}
		if nested["b"] != float64(2) {
			t.Errorf("b = %v, want 2", nested["b"])
		}
		if _, exists := nested["c"]; exists {
			t.Error("'c' should not exist after shallow replace")
		}
	})

	t.Run("nil merge (null value)", func(t *testing.T) {
		write(base, `{"a":1}`)
		write(patch, `{"a":null}`)
		result, err := capture(func() error { return JSONMerge(base, patch) })
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}
		if result["a"] != nil {
			t.Errorf("got %v, want nil for 'a'", result["a"])
		}
	})
}

func TestJSONMerge_PatchMissing(t *testing.T) {
	dir := t.TempDir()
	base := filepath.Join(dir, "base.json")
	if err := os.WriteFile(base, []byte(`{"a":1}`), 0644); err != nil {
		t.Fatal(err)
	}
	if err := JSONMerge(base, "/nonexistent/patch.json"); err == nil {
		t.Error("expected error when patch file is missing")
	}
}

func TestJSONMerge_InvalidBaseJSON(t *testing.T) {
	dir := t.TempDir()
	base := filepath.Join(dir, "base.json")
	patch := filepath.Join(dir, "patch.json")
	if err := os.WriteFile(base, []byte(`{invalid}`), 0644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(patch, []byte(`{"a":1}`), 0644); err != nil {
		t.Fatal(err)
	}
	if err := JSONMerge(base, patch); err == nil {
		t.Error("expected error for invalid base JSON")
	}
}

func TestJSONMerge_InvalidPatchJSON(t *testing.T) {
	dir := t.TempDir()
	base := filepath.Join(dir, "base.json")
	patch := filepath.Join(dir, "patch.json")
	if err := os.WriteFile(base, []byte(`{"a":1}`), 0644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(patch, []byte(`{invalid}`), 0644); err != nil {
		t.Fatal(err)
	}
	if err := JSONMerge(base, patch); err == nil {
		t.Error("expected error for invalid patch JSON")
	}
}

func TestJSONMerge_EmptyObjects(t *testing.T) {
	dir := t.TempDir()
	base := filepath.Join(dir, "base.json")
	patch := filepath.Join(dir, "patch.json")
	if err := os.WriteFile(base, []byte(`{}`), 0644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(patch, []byte(`{}`), 0644); err != nil {
		t.Fatal(err)
	}
	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w
	err := JSONMerge(base, patch)
	w.Close()
	os.Stdout = old
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	var result map[string]interface{}
	if decodeErr := json.NewDecoder(r).Decode(&result); decodeErr != nil {
		t.Fatalf("decode output: %v", decodeErr)
	}
	if len(result) != 0 {
		t.Errorf("expected empty result, got %v", result)
	}
}

func TestJSONMerge_ConflictingKeys(t *testing.T) {
	dir := t.TempDir()
	base := filepath.Join(dir, "base.json")
	patch := filepath.Join(dir, "patch.json")
	if err := os.WriteFile(base, []byte(`{"a":1,"b":2}`), 0644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(patch, []byte(`{"b":3,"c":4}`), 0644); err != nil {
		t.Fatal(err)
	}
	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w
	err := JSONMerge(base, patch)
	w.Close()
	os.Stdout = old
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	var result map[string]interface{}
	if decodeErr := json.NewDecoder(r).Decode(&result); decodeErr != nil {
		t.Fatalf("decode output: %v", decodeErr)
	}
	if result["a"] != float64(1) {
		t.Errorf("a = %v, want 1", result["a"])
	}
	if result["b"] != float64(3) {
		t.Errorf("b = %v, want 3 (patch should override)", result["b"])
	}
	if result["c"] != float64(4) {
		t.Errorf("c = %v, want 4", result["c"])
	}
}

func TestJSONMerge_NestedMerge(t *testing.T) {
	dir := t.TempDir()
	base := filepath.Join(dir, "base.json")
	patch := filepath.Join(dir, "patch.json")
	if err := os.WriteFile(base, []byte(`{"a":{"b":1,"c":2},"d":3}`), 0644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(patch, []byte(`{"a":{"b":10}}`), 0644); err != nil {
		t.Fatal(err)
	}
	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w
	err := JSONMerge(base, patch)
	w.Close()
	os.Stdout = old
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	var result map[string]interface{}
	if decodeErr := json.NewDecoder(r).Decode(&result); decodeErr != nil {
		t.Fatalf("decode output: %v", decodeErr)
	}
	if result["d"] != float64(3) {
		t.Errorf("d = %v, want 3", result["d"])
	}
}
