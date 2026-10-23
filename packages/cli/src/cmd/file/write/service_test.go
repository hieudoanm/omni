package write

import (
	"bytes"
	"encoding/json"
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

func TestGetWriteContentWithContent(t *testing.T) {
	result, err := getWriteContent("hello")
	if err != nil {
		t.Fatal(err)
	}
	if result != "hello" {
		t.Errorf("got %q, want %q", result, "hello")
	}
}

func TestOpenFileForWrite(t *testing.T) {
	flag, mode, err := openFileForWrite("/tmp/test.txt", false, false, "")
	if err != nil {
		t.Fatal(err)
	}
	if mode != os.FileMode(0644) {
		t.Errorf("mode = %o, want 644", mode)
	}
	if flag&os.O_APPEND != 0 {
		t.Error("expected not append")
	}
	if flag&os.O_TRUNC == 0 {
		t.Error("expected truncate")
	}
	if flag&os.O_CREATE == 0 {
		t.Error("expected O_CREATE")
	}
}

func TestOpenFileForWriteAppend(t *testing.T) {
	flag, mode, err := openFileForWrite("/tmp/test.txt", true, false, "")
	if err != nil {
		t.Fatal(err)
	}
	if mode != os.FileMode(0644) {
		t.Errorf("mode = %o, want 644", mode)
	}
	if flag&os.O_APPEND == 0 {
		t.Error("expected append")
	}
	if flag&os.O_WRONLY == 0 {
		t.Error("expected O_WRONLY")
	}
}

func TestOpenFileForWriteWithMode(t *testing.T) {
	flag, mode, err := openFileForWrite("/tmp/test.txt", false, false, "600")
	if err != nil {
		t.Fatal(err)
	}
	if mode != os.FileMode(0600) {
		t.Errorf("mode = %o, want 600", mode)
	}
	if flag&os.O_CREATE == 0 {
		t.Error("expected O_CREATE")
	}
}

func TestOpenFileForWriteWithMkdir(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "sub", "nested", "file.txt")

	flag, mode, err := openFileForWrite(path, false, true, "")
	if err != nil {
		t.Fatal(err)
	}
	if mode != os.FileMode(0644) {
		t.Errorf("mode = %o, want 644", mode)
	}
	_ = flag
	if _, err := os.Stat(filepath.Dir(path)); os.IsNotExist(err) {
		t.Error("directory was not created")
	}
}

func TestOpenFileForWriteInvalidMode(t *testing.T) {
	_, _, err := openFileForWrite("/tmp/test.txt", false, false, "abc")
	if err == nil {
		t.Fatal("expected error for invalid mode")
	}
}

func TestOutputWriteResultText(t *testing.T) {
	output := captureOutput(func() {
		err := outputWriteResult("/tmp/test.txt", 100, false, false)
		if err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Written 100 bytes") {
		t.Errorf("expected write message, got: %s", output)
	}
}

func TestOutputWriteResultAppendText(t *testing.T) {
	output := captureOutput(func() {
		err := outputWriteResult("/tmp/test.txt", 50, true, false)
		if err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Appended 50 bytes") {
		t.Errorf("expected append message, got: %s", output)
	}
}

func TestOutputWriteResultJSON(t *testing.T) {
	output := captureOutput(func() {
		err := outputWriteResult("/tmp/test.txt", 200, false, true)
		if err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
	if result["bytes"].(float64) != 200 {
		t.Errorf("bytes = %v, want 200", result["bytes"])
	}
	if result["append"].(bool) != false {
		t.Error("expected append = false")
	}
}

func TestOutputWriteResultAppendJSON(t *testing.T) {
	output := captureOutput(func() {
		err := outputWriteResult("/tmp/test.txt", 30, true, true)
		if err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
	if result["append"].(bool) != true {
		t.Error("expected append = true")
	}
	if result["file"] != "/tmp/test.txt" {
		t.Errorf("file = %v, want %q", result["file"], "/tmp/test.txt")
	}
}

func TestReadStdinPiped(t *testing.T) {
	oldStdin := os.Stdin
	defer func() { os.Stdin = oldStdin }()

	r, w, _ := os.Pipe()
	w.Write([]byte("hello world\n"))
	w.Close()

	os.Stdin = r
	data, err := readStdin()
	if err != nil {
		t.Fatal(err)
	}
	if string(data) != "hello world" {
		t.Errorf("got %q, want %q", string(data), "hello world")
	}
}

func TestReadStdinPipedNoTrailingNewline(t *testing.T) {
	oldStdin := os.Stdin
	defer func() { os.Stdin = oldStdin }()

	r, w, _ := os.Pipe()
	w.Write([]byte("no newline"))
	w.Close()

	os.Stdin = r
	data, err := readStdin()
	if err != nil {
		t.Fatal(err)
	}
	if string(data) != "no newline" {
		t.Errorf("got %q, want %q", string(data), "no newline")
	}
}

func TestReadStdinPipedMultipleLines(t *testing.T) {
	oldStdin := os.Stdin
	defer func() { os.Stdin = oldStdin }()

	r, w, _ := os.Pipe()
	w.Write([]byte("line1\nline2\nline3\n"))
	w.Close()

	os.Stdin = r
	data, err := readStdin()
	if err != nil {
		t.Fatal(err)
	}
	if string(data) != "line1\nline2\nline3" {
		t.Errorf("got %q, want %q", string(data), "line1\nline2\nline3")
	}
}

func TestReadStdinPipedEmpty(t *testing.T) {
	oldStdin := os.Stdin
	defer func() { os.Stdin = oldStdin }()

	r, w, _ := os.Pipe()
	w.Close()

	os.Stdin = r
	data, err := readStdin()
	if err != nil {
		t.Fatal(err)
	}
	if string(data) != "" {
		t.Errorf("got %q, want %q", string(data), "")
	}
}

func TestIsStdinPiped(t *testing.T) {
	oldStdin := os.Stdin
	defer func() { os.Stdin = oldStdin }()

	r, w, _ := os.Pipe()
	w.Write([]byte("data"))
	w.Close()

	os.Stdin = r
	if !isStdinPiped() {
		t.Error("expected stdin to be piped")
	}
}
