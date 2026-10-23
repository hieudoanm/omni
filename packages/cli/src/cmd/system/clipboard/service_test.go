package clipboard

import (
	"database/sql"
	"fmt"
	"io"
	"os"
	"strings"
	"testing"
	"time"
)

func captureOutput(fn func()) string {
	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w
	fn()
	w.Close()
	out, _ := io.ReadAll(r)
	os.Stdout = orig
	return string(out)
}

func TestCreateClipTable(t *testing.T) {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()

	if err := createClipTable(db); err != nil {
		t.Fatalf("createClipTable failed: %v", err)
	}

	var name string
	err = db.QueryRow("SELECT name FROM sqlite_master WHERE type='table' AND name='clips'").Scan(&name)
	if err != nil {
		t.Fatalf("clips table should exist: %v", err)
	}
}

func TestCreateClipTable_Error(t *testing.T) {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatal(err)
	}
	db.Close()

	err = createClipTable(db)
	if err == nil {
		t.Error("expected error for closed database")
	}
}

func TestInsertClip(t *testing.T) {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()

	createClipTable(db)

	err = insertClip(db, "test clipboard content")
	if err != nil {
		t.Fatalf("insertClip failed: %v", err)
	}

	var content string
	err = db.QueryRow("SELECT content FROM clips WHERE id=1").Scan(&content)
	if err != nil {
		t.Fatalf("query failed: %v", err)
	}
	if content != "test clipboard content" {
		t.Errorf("expected 'test clipboard content', got %q", content)
	}
}

func TestClipboardLoop_Success(t *testing.T) {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	createClipTable(db)

	origJSON := jsonOutput
	jsonOutput = false
	defer func() { jsonOutput = origJSON }()

	callCount := 0
	output := captureOutput(func() {
		clipboardLoop(db, func() (string, error) {
			callCount++
			if callCount == 1 {
				return "test clip content", nil
			}
			return "", nil
		}, func(d time.Duration) {}, 2)
	})
	if callCount != 2 {
		t.Errorf("expected 2 read calls, got %d", callCount)
	}
	if !strings.Contains(output, "test clip") {
		t.Errorf("expected 'test clip' in output, got %q", output)
	}
}

func TestClipboardLoop_ReadError(t *testing.T) {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	createClipTable(db)

	sleepCount := 0
	output := captureOutput(func() {
		clipboardLoop(db, func() (string, error) {
			return "", fmt.Errorf("read error")
		}, func(d time.Duration) {
			sleepCount++
		}, 1)
	})
	if output != "" {
		t.Errorf("expected empty output on read error, got %q", output)
	}
	if sleepCount != 1 {
		t.Errorf("expected 1 sleep call (1s), got %d", sleepCount)
	}
}

func TestClipboardLoop_EmptyText(t *testing.T) {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	createClipTable(db)

	sleepCount := 0
	output := captureOutput(func() {
		clipboardLoop(db, func() (string, error) {
			return "", nil
		}, func(d time.Duration) {
			sleepCount++
		}, 1)
	})
	if output != "" {
		t.Errorf("expected empty output for empty text, got %q", output)
	}
}

func TestClipboardLoop_RepeatText(t *testing.T) {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	createClipTable(db)

	origJSON := jsonOutput
	jsonOutput = false
	defer func() { jsonOutput = origJSON }()

	readIdx := 0
	output := captureOutput(func() {
		clipboardLoop(db, func() (string, error) {
			readIdx++
			if readIdx == 1 {
				return "unique text", nil
			}
			return "unique text", nil
		}, func(d time.Duration) {}, 2)
	})
	if !strings.Contains(output, "Saved: unique text") {
		t.Errorf("expected 'Saved: unique text' in output, got %q", output)
	}
}

func TestRunClipboardWatcher_Success(t *testing.T) {
	origOpen := sqlOpen
	sqlOpen = func(driver, dsn string) (*sql.DB, error) {
		return sql.Open("sqlite3", ":memory:")
	}
	defer func() { sqlOpen = origOpen }()

	origIters := testClipboardIters
	testClipboardIters = 1
	defer func() { testClipboardIters = origIters }()

	captureOutput(func() {
		runWatcher()
	})
}

func TestClipboardLoop_JSONOutput(t *testing.T) {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	createClipTable(db)

	origJSON := jsonOutput
	jsonOutput = true
	defer func() { jsonOutput = origJSON }()

	output := captureOutput(func() {
		clipboardLoop(db, func() (string, error) {
			return "clip content", nil
		}, func(d time.Duration) {}, 1)
	})
	if !strings.Contains(output, `"content": "clip content"`) {
		t.Errorf("expected JSON content in output, got %q", output)
	}
}

func TestClipboardLoop_InsertError(t *testing.T) {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatal(err)
	}
	createClipTable(db)
	db.Close()

	output := captureOutput(func() {
		clipboardLoop(db, func() (string, error) {
			return "some text", nil
		}, func(d time.Duration) {}, 1)
	})
	if output != "" {
		t.Errorf("expected no output on insert error, got %q", output)
	}
}

func TestPreviewClip_ShortText(t *testing.T) {
	tests := []string{
		"hello",
		"",
		"short",
		"exactly 40 chars -- this is exactly 40",
	}

	for _, input := range tests {
		t.Run(input, func(t *testing.T) {
			got := previewClip(input)
			if got != input {
				t.Errorf("previewClip(%q) = %q, want %q", input, got, input)
			}
		})
	}
}

func TestPreviewClip_LongText(t *testing.T) {
	input := "this is a very long string that should definitely be truncated because it exceeds 40 characters"
	expected := "this is a very long string that should d..."

	got := previewClip(input)
	if got != expected {
		t.Errorf("previewClip(%q) = %q, want %q", input, got, expected)
	}
}

func TestPreviewClip_Exact40Chars(t *testing.T) {
	input := "1234567890123456789012345678901234567890"
	if len(input) != 40 {
		t.Fatalf("test string must be exactly 40 chars, got %d", len(input))
	}

	got := previewClip(input)
	if got != input {
		t.Errorf("previewClip for 40-char string = %q, want %q", got, input)
	}
}

func TestPreviewClip_41Chars(t *testing.T) {
	input := "12345678901234567890123456789012345678901"
	if len(input) != 41 {
		t.Fatalf("test string must be exactly 41 chars, got %d", len(input))
	}

	got := previewClip(input)
	expected := "1234567890123456789012345678901234567890..."
	if got != expected {
		t.Errorf("previewClip for 41-char string = %q, want %q", got, expected)
	}
	if len(got) != 43 {
		t.Errorf("expected truncated result to be 43 chars (40 + ...), got %d", len(got))
	}
}
