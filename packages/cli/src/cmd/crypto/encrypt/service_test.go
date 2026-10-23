package encrypt

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

func TestRunEncrypt(t *testing.T) {
	tmp := t.TempDir()
	input := filepath.Join(tmp, "secret.txt")
	os.WriteFile(input, []byte("hello world"), 0644)

	output := captureOutput(func() {
		if err := runEncrypt(input, "password", "", false); err != nil {
			t.Fatal(err)
		}
	})

	encFile := input + ".enc"
	if _, err := os.Stat(encFile); os.IsNotExist(err) {
		t.Fatal("expected encrypted file to exist")
	}
	if !strings.Contains(output, ".enc") {
		t.Errorf("expected output path in output, got: %s", output)
	}
}

func TestRunEncrypt_CustomOutput(t *testing.T) {
	tmp := t.TempDir()
	input := filepath.Join(tmp, "secret.txt")
	os.WriteFile(input, []byte("hello world"), 0644)
	outputPath := filepath.Join(tmp, "custom.enc")

	output := captureOutput(func() {
		if err := runEncrypt(input, "password", outputPath, false); err != nil {
			t.Fatal(err)
		}
	})

	if _, err := os.Stat(outputPath); os.IsNotExist(err) {
		t.Fatal("expected custom encrypted file to exist")
	}
	if !strings.Contains(output, "custom.enc") {
		t.Errorf("expected custom output path in output, got: %s", output)
	}
}

func TestRunEncrypt_JSON(t *testing.T) {
	tmp := t.TempDir()
	input := filepath.Join(tmp, "secret.txt")
	os.WriteFile(input, []byte("hello world"), 0644)

	output := captureOutput(func() {
		if err := runEncrypt(input, "password", "", true); err != nil {
			t.Fatal(err)
		}
	})

	if !strings.Contains(output, `"input"`) {
		t.Errorf("expected json output, got: %s", output)
	}
}

func TestRunEncrypt_MissingFile(t *testing.T) {
	err := runEncrypt("/nonexistent/file.txt", "password", "", false)
	if err == nil {
		t.Fatal("expected error for missing file")
	}
}

func TestRunEncrypt_RunE(t *testing.T) {
	tmp := t.TempDir()
	input := filepath.Join(tmp, "secret.txt")
	os.WriteFile(input, []byte("hello world"), 0644)

	cmd := NewCommand()
	cmd.Flags().Set("file", input)
	cmd.Flags().Set("password", "test")

	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})

	if !strings.Contains(output, ".enc") {
		t.Errorf("expected output via RunE, got: %s", output)
	}
}
