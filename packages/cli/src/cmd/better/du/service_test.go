package du

import (
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestRun(t *testing.T) {
	dir := t.TempDir()
	os.Mkdir(filepath.Join(dir, "sub"), 0755)
	os.WriteFile(filepath.Join(dir, "sub", "b.dat"), make([]byte, 200), 0644)

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	err := run(dir, 0, "size", false, false, 0, false)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}

	output := string(out)
	if !strings.Contains(output, "sub") {
		t.Errorf("expected sub in output, got:\n%s", output)
	}
}

func TestRunHuman(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "big.bin"), make([]byte, 2048), 0644)

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	err := run(dir, 0, "size", false, true, 0, false)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}

	output := string(out)
	if !strings.Contains(output, "2.0K") && !strings.Contains(output, "Size") {
		t.Errorf("expected human-readable output, got:\n%s", output)
	}
}

func TestRunJSON(t *testing.T) {
	dir := t.TempDir()
	os.Mkdir(filepath.Join(dir, "subdir"), 0755)

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	err := run(dir, 0, "size", false, false, 0, true)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}

	output := string(out)
	if !strings.Contains(output, `"path": "subdir"`) {
		t.Errorf("expected JSON with subdir, got:\n%s", output)
	}
	if !strings.Contains(output, `"count"`) {
		t.Errorf("expected count field, got:\n%s", output)
	}
}

func TestRunSortByName(t *testing.T) {
	dir := t.TempDir()
	os.Mkdir(filepath.Join(dir, "b_dir"), 0755)
	os.Mkdir(filepath.Join(dir, "a_dir"), 0755)

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	err := run(dir, 0, "name", false, false, 0, false)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}

	output := string(out)
	aIdx := strings.Index(output, "a_dir")
	bIdx := strings.Index(output, "b_dir")
	if aIdx < 0 || bIdx < 0 {
		t.Errorf("expected both dirs in output, got:\n%s", output)
	}
	if aIdx > bIdx {
		t.Errorf("expected a_dir before b_dir when sorted by name, got:\n%s", output)
	}
}

func TestRunThreshold(t *testing.T) {
	dir := t.TempDir()
	os.Mkdir(filepath.Join(dir, "small_dir"), 0755)
	os.Mkdir(filepath.Join(dir, "large_dir"), 0755)
	os.WriteFile(filepath.Join(dir, "large_dir", "big.bin"), make([]byte, 5000), 0644)

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	err := run(dir, 0, "size", false, false, 1, false)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}

	output := string(out)
	if !strings.Contains(output, "large_dir") {
		t.Errorf("expected large_dir to exceed threshold, got:\n%s", output)
	}
}

func TestRunAll(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "f.txt"), []byte("f"), 0644)

	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	err := run(dir, 0, "size", true, false, 0, false)

	w.Close()
	os.Stdout = orig
	out, _ := io.ReadAll(r)

	if err != nil {
		t.Fatal(err)
	}

	output := string(out)
	if !strings.Contains(output, "f.txt") {
		t.Errorf("expected f.txt with --all, got:\n%s", output)
	}
}

func TestRunBadDir(t *testing.T) {
	err := run("/nonexistent/dir", 0, "size", false, false, 0, false)
	if err == nil {
		t.Error("expected error for nonexistent directory")
	}
}

func TestHumanSize(t *testing.T) {
	tests := []struct {
		input int64
		want  string
	}{
		{0, "0B"},
		{100, "100B"},
		{1024, "1.0K"},
		{1536, "1.5K"},
		{1048576, "1.0M"},
		{1073741824, "1.0G"},
		{1610612736, "1.5G"},
		{1099511627776, "1.0T"},
	}
	for _, tt := range tests {
		t.Run(tt.want, func(t *testing.T) {
			got := humanSize(tt.input)
			if got != tt.want {
				t.Errorf("humanSize(%d) = %q, want %q", tt.input, got, tt.want)
			}
		})
	}
}
