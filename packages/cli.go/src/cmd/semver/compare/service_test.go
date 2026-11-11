package compare

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

func TestRunCompareLess(t *testing.T) {
	output := captureOutput(func() {
		if err := runCompare("1.0.0", "2.0.0", false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "<") {
		t.Errorf("expected '<' in output, got: %s", output)
	}
}

func TestRunCompareGreater(t *testing.T) {
	output := captureOutput(func() {
		if err := runCompare("2.0.0", "1.0.0", false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, ">") {
		t.Errorf("expected '>' in output, got: %s", output)
	}
}

func TestRunCompareEqual(t *testing.T) {
	output := captureOutput(func() {
		if err := runCompare("1.2.3", "1.2.3", false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "==") {
		t.Errorf("expected '==' in output, got: %s", output)
	}
}

func TestRunComparePrerelease(t *testing.T) {
	output := captureOutput(func() {
		if err := runCompare("1.0.0-alpha", "1.0.0", false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "<") {
		t.Errorf("expected '<' for prerelease, got: %s", output)
	}
}

func TestRunCompareMissingA(t *testing.T) {
	err := runCompare("", "1.0.0", false)
	if err == nil {
		t.Error("expected error when --a is missing")
	}
}

func TestRunCompareMissingB(t *testing.T) {
	err := runCompare("1.0.0", "", false)
	if err == nil {
		t.Error("expected error when --b is missing")
	}
}

func TestRunCompareInvalidVersion(t *testing.T) {
	err := runCompare("abc", "1.0.0", false)
	if err == nil {
		t.Error("expected error for invalid version")
	}
}

func TestRunCompareJSON(t *testing.T) {
	output := captureOutput(func() {
		if err := runCompare("1.0.0", "2.0.0", true); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "relation") {
		t.Errorf("expected JSON 'relation' field, got: %s", output)
	}
}
