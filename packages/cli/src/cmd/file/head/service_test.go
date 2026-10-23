package head

import (
	"bytes"
	"io"
	"os"
	"path/filepath"
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

func TestRunHead(t *testing.T) {
	tmp := t.TempDir()
	path := filepath.Join(tmp, "test.txt")
	content := "line1\nline2\nline3\nline4\nline5\n"
	os.WriteFile(path, []byte(content), 0644)

	output := captureOutput(func() {
		if err := runHead(path, 3, false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "line1") {
		t.Errorf("expected line1, got: %s", output)
	}
	if strings.Contains(output, "line4") {
		t.Errorf("expected only 3 lines, got line4")
	}
}

func TestRunHead_DefaultLines(t *testing.T) {
	tmp := t.TempDir()
	path := filepath.Join(tmp, "test.txt")
	var content string
	for i := 1; i <= 15; i++ {
		content += "line\n"
	}
	os.WriteFile(path, []byte(content), 0644)

	output := captureOutput(func() {
		if err := runHead(path, 10, false); err != nil {
			t.Fatal(err)
		}
	})
	count := strings.Count(output, "line")
	if count != 10 {
		t.Errorf("expected 10 lines by default, got: %d", count)
	}
}

func TestRunHead_FileNotFound(t *testing.T) {
	err := runHead("/nonexistent/file.txt", 10, false)
	if err == nil {
		t.Fatal("expected error for nonexistent file")
	}
}

func TestRunHead_JSON(t *testing.T) {
	tmp := t.TempDir()
	path := filepath.Join(tmp, "test.txt")
	os.WriteFile(path, []byte("hello\nworld\n"), 0644)

	output := captureOutput(func() {
		if err := runHead(path, 2, true); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "hello") {
		t.Errorf("expected hello in json, got: %s", output)
	}
	if !strings.Contains(output, `"file":`) {
		t.Errorf("expected file key in json, got: %s", output)
	}
}

func TestRunHead_RunE(t *testing.T) {
	tmp := t.TempDir()
	path := filepath.Join(tmp, "test.txt")
	os.WriteFile(path, []byte("line1\nline2\nline3\n"), 0644)

	cmd := NewCommand()
	cmd.Flags().Set("file", path)
	cmd.Flags().Set("lines", "2")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "line1") {
		t.Errorf("expected line1 in output, got: %s", output)
	}
	if strings.Contains(output, "line3") {
		t.Errorf("expected only 2 lines, got line3")
	}
}

func TestRunHead_JSONViaRunE(t *testing.T) {
	tmp := t.TempDir()
	path := filepath.Join(tmp, "test.txt")
	os.WriteFile(path, []byte("hello\nworld\n"), 0644)

	cmd := NewCommand()
	cmd.Flags().Set("file", path)
	cmd.Flags().Set("json", "true")
	cmd.Flags().Set("lines", "1")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "hello") {
		t.Errorf("expected hello in json via RunE, got: %s", output)
	}
}
