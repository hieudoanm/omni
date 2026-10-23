package now

import (
	"bytes"
	"encoding/json"
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

func TestRunNow(t *testing.T) {
	output := captureOutput(func() {
		if err := RunNow("", false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Local:") {
		t.Errorf("expected Local: in output, got: %s", output)
	}
	if !strings.Contains(output, "UTC:") {
		t.Errorf("expected UTC: in output, got: %s", output)
	}
	if !strings.Contains(output, "Unix:") {
		t.Errorf("expected Unix: in output, got: %s", output)
	}
}

func TestRunNow_JSON(t *testing.T) {
	output := captureOutput(func() {
		if err := RunNow("", true); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		t.Fatalf("invalid JSON: %v\noutput: %s", err, output)
	}
	if _, ok := result["utc"]; !ok {
		t.Error("expected utc field")
	}
	if _, ok := result["local"]; !ok {
		t.Error("expected local field")
	}
	if _, ok := result["unix"]; !ok {
		t.Error("expected unix field")
	}
}

func TestRunNow_CustomFormat(t *testing.T) {
	output := captureOutput(func() {
		if err := RunNow("2006-01-02", false); err != nil {
			t.Fatal(err)
		}
	})
	year := strings.TrimSpace(output)
	if len(year) != 10 {
		t.Errorf("expected 10-char date, got: %q", year)
	}
}
