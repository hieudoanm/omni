package sort

import (
	"bytes"
	"io"
	"os"
	"strings"
	"testing"
)

func captureOutput(fn func()) string {
	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w
	fn()
	w.Close()
	var buf bytes.Buffer
	io.Copy(&buf, r)
	os.Stdout = old
	return buf.String()
}

func TestRunSortAscending(t *testing.T) {
	output := captureOutput(func() {
		if err := runSort([]string{"2.0.0", "1.0.0", "3.0.0"}, false); err != nil {
			t.Fatal(err)
		}
	})
	lines := strings.Split(strings.TrimSpace(output), "\n")
	if len(lines) != 3 {
		t.Fatalf("expected 3 lines, got %d: %s", len(lines), output)
	}
	if lines[0] != "1.0.0" || lines[1] != "2.0.0" || lines[2] != "3.0.0" {
		t.Errorf("unexpected order: %s", output)
	}
}

func TestRunSortWithPrefix(t *testing.T) {
	output := captureOutput(func() {
		if err := runSort([]string{"v3.0.0", "v1.0.0", "v2.0.0"}, false); err != nil {
			t.Fatal(err)
		}
	})
	lines := strings.Split(strings.TrimSpace(output), "\n")
	if lines[0] != "1.0.0" || lines[1] != "2.0.0" || lines[2] != "3.0.0" {
		t.Errorf("unexpected order: %s", output)
	}
}

func TestRunSortPrerelease(t *testing.T) {
	output := captureOutput(func() {
		if err := runSort([]string{"1.0.0-beta", "1.0.0-alpha", "1.0.0"}, false); err != nil {
			t.Fatal(err)
		}
	})
	lines := strings.Split(strings.TrimSpace(output), "\n")
	if len(lines) != 3 {
		t.Fatalf("expected 3 lines, got %d: %s", len(lines), output)
	}
}

func TestRunSortSingle(t *testing.T) {
	output := captureOutput(func() {
		if err := runSort([]string{"1.2.3"}, false); err != nil {
			t.Fatal(err)
		}
	})
	if strings.TrimSpace(output) != "1.2.3" {
		t.Errorf("unexpected output: %s", output)
	}
}

func TestRunSortNoVersions(t *testing.T) {
	err := runSort(nil, false)
	if err == nil {
		t.Error("expected error when no versions provided")
	}
}

func TestRunSortInvalidVersion(t *testing.T) {
	err := runSort([]string{"1.0.0", "abc"}, false)
	if err == nil {
		t.Error("expected error for invalid version")
	}
}

func TestRunSortJSON(t *testing.T) {
	output := captureOutput(func() {
		if err := runSort([]string{"3.0.0", "1.0.0", "2.0.0"}, true); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "sorted") {
		t.Errorf("expected JSON 'sorted' field, got: %s", output)
	}
}
