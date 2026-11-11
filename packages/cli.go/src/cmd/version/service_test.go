package version

import (
	"bytes"
	"encoding/json"
	"os"
	"testing"
)

func TestRunVersion_TextOutput(t *testing.T) {
	V = "1.2.3"
	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	if err := runVersion(false); err != nil {
		t.Fatal(err)
	}

	w.Close()
	os.Stdout = old

	var buf bytes.Buffer
	_, _ = buf.ReadFrom(r)
	if buf.String() != "Version: 1.2.3\n" {
		t.Errorf("output = %q", buf.String())
	}
}

func TestRunVersion_JSONOutput(t *testing.T) {
	V = "2.0.0"
	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	if err := runVersion(true); err != nil {
		t.Fatal(err)
	}

	w.Close()
	os.Stdout = old

	var buf bytes.Buffer
	_, _ = buf.ReadFrom(r)

	var result map[string]interface{}
	if err := json.Unmarshal(buf.Bytes(), &result); err != nil {
		t.Fatalf("JSON decode: %v", err)
	}
	if result["version"] != "2.0.0" {
		t.Errorf("version = %v", result["version"])
	}
}
