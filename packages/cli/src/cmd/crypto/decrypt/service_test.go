package decrypt

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
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

func encryptFile(t *testing.T, input, password, output string) {
	t.Helper()
	data, err := os.ReadFile(input)
	if err != nil {
		t.Fatal(err)
	}
	key := sha256.Sum256([]byte(password))
	block, err := aes.NewCipher(key[:])
	if err != nil {
		t.Fatal(err)
	}
	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		t.Fatal(err)
	}
	nonce := make([]byte, aesgcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		t.Fatal(err)
	}
	ciphertext := aesgcm.Seal(nil, nonce, data, nil)
	if err := os.WriteFile(output, append(nonce, ciphertext...), 0644); err != nil {
		t.Fatal(err)
	}
}

func TestRunDecrypt(t *testing.T) {
	tmp := t.TempDir()
	input := filepath.Join(tmp, "secret.txt")
	os.WriteFile(input, []byte("hello world"), 0644)
	encFile := filepath.Join(tmp, "secret.txt.enc")
	encryptFile(t, input, "password", encFile)

	output := captureOutput(func() {
		if err := runDecrypt(encFile, "password", "", false); err != nil {
			t.Fatal(err)
		}
	})

	decFile := filepath.Join(tmp, "secret.txt")
	if _, err := os.Stat(decFile); os.IsNotExist(err) {
		t.Fatal("expected decrypted file to exist")
	}
	content, _ := os.ReadFile(decFile)
	if string(content) != "hello world" {
		t.Errorf("expected 'hello world', got %q", string(content))
	}
	if !strings.Contains(output, "secret.txt") {
		t.Errorf("expected output path in output, got: %s", output)
	}
}

func TestRunDecrypt_CustomOutput(t *testing.T) {
	tmp := t.TempDir()
	plainFile := filepath.Join(tmp, "plain.txt")
	os.WriteFile(plainFile, []byte("data"), 0644)
	encFile := filepath.Join(tmp, "secret.enc")
	encryptFile(t, plainFile, "password", encFile)
	outputPath := filepath.Join(tmp, "restored.txt")

	output := captureOutput(func() {
		if err := runDecrypt(encFile, "password", outputPath, false); err != nil {
			t.Fatal(err)
		}
	})

	if _, err := os.Stat(outputPath); os.IsNotExist(err) {
		t.Fatal("expected custom decrypted file to exist")
	}
	if !strings.Contains(output, "restored.txt") {
		t.Errorf("expected custom output path in output, got: %s", output)
	}
}

func TestRunDecrypt_JSON(t *testing.T) {
	tmp := t.TempDir()
	input := filepath.Join(tmp, "secret.txt")
	os.WriteFile(input, []byte("data"), 0644)
	encFile := filepath.Join(tmp, "secret.txt.enc")
	encryptFile(t, input, "password", encFile)

	output := captureOutput(func() {
		if err := runDecrypt(encFile, "password", "", true); err != nil {
			t.Fatal(err)
		}
	})

	var result map[string]interface{}
	if err := json.Unmarshal([]byte(strings.TrimSpace(output)), &result); err != nil {
		t.Errorf("expected valid json, got: %s", output)
	}
}

func TestRunDecrypt_WrongPassword(t *testing.T) {
	tmp := t.TempDir()
	input := filepath.Join(tmp, "secret.txt")
	os.WriteFile(input, []byte("data"), 0644)
	encFile := filepath.Join(tmp, "secret.txt.enc")
	encryptFile(t, input, "password", encFile)

	err := runDecrypt(encFile, "wrongpassword", "", false)
	if err == nil {
		t.Fatal("expected error for wrong password")
	}
}

func TestRunDecrypt_MissingFile(t *testing.T) {
	err := runDecrypt("/nonexistent/file.enc", "password", "", false)
	if err == nil {
		t.Fatal("expected error for missing file")
	}
}

func TestRunDecrypt_TooSmall(t *testing.T) {
	tmp := t.TempDir()
	smallFile := filepath.Join(tmp, "small.enc")
	os.WriteFile(smallFile, []byte("tiny"), 0644)

	err := runDecrypt(smallFile, "password", "", false)
	if err == nil {
		t.Fatal("expected error for too-small file")
	}
}

func TestRunDecrypt_RunE(t *testing.T) {
	tmp := t.TempDir()
	input := filepath.Join(tmp, "secret.txt")
	os.WriteFile(input, []byte("hello"), 0644)
	encFile := filepath.Join(tmp, "secret.txt.enc")
	encryptFile(t, input, "test", encFile)

	cmd := NewCommand()
	cmd.Flags().Set("file", encFile)
	cmd.Flags().Set("password", "test")

	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})

	if !strings.Contains(output, "secret.txt") {
		t.Errorf("expected decrypted output via RunE, got: %s", output)
	}
}
