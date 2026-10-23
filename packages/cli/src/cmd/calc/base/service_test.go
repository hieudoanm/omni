package base

import (
	"bytes"
	"encoding/json"
	"io"
	"os"
	"strconv"
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

func TestBaseConversion(t *testing.T) {
	n, _ := strconv.ParseInt("FF", 16, 64)
	if n != 255 {
		t.Errorf("hex FF = %d, want 255", n)
	}
	result := strconv.FormatInt(n, 2)
	if result != "11111111" {
		t.Errorf("dec 255 to bin = %s, want 11111111", result)
	}
	result = strconv.FormatInt(n, 16)
	if result != "ff" {
		t.Errorf("dec 255 to hex = %s, want ff", result)
	}
}

func TestRunBase(t *testing.T) {
	output := captureOutput(func() {
		if err := runBase("FF", "hex", "dec", false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "255") {
		t.Errorf("expected output containing 255, got %q", output)
	}
}

func TestRunBase_InvalidFrom(t *testing.T) {
	err := runBase("FF", "invalid", "dec", false)
	if err == nil {
		t.Fatal("expected error for invalid base")
	}
	if !strings.Contains(err.Error(), "unknown base") {
		t.Errorf("expected unknown base error, got %v", err)
	}
}

func TestRunBase_InvalidValue(t *testing.T) {
	err := runBase("XYZ", "hex", "dec", false)
	if err == nil {
		t.Fatal("expected error for invalid value")
	}
}

func TestRunBase_Json(t *testing.T) {
	output := captureOutput(func() {
		if err := runBase("FF", "hex", "dec", true); err != nil {
			t.Fatal(err)
		}
	})
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(strings.TrimSpace(output)), &result); err != nil {
		t.Fatalf("invalid json output: %v", err)
	}
	if result["result"] != "255" {
		t.Errorf("expected result 255, got %v", result["result"])
	}
}

func TestCmd_RunE(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("value", "FF")
	cmd.Flags().Set("from", "hex")
	cmd.Flags().Set("to", "dec")
	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "255") {
		t.Errorf("expected output containing 255, got %q", output)
	}
}
