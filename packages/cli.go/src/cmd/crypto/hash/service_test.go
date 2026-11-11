package hash

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

func TestComputeHash_md5(t *testing.T) {
	got, err := ComputeHash([]byte("hello"), "md5")
	if err != nil {
		t.Fatal(err)
	}
	want := "5d41402abc4b2a76b9719d911017c592"
	if got != want {
		t.Errorf("got %q, want %q", got, want)
	}
}

func TestComputeHash_sha1(t *testing.T) {
	got, err := ComputeHash([]byte("hello"), "sha1")
	if err != nil {
		t.Fatal(err)
	}
	want := "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d"
	if got != want {
		t.Errorf("got %q, want %q", got, want)
	}
}

func TestComputeHash_sha256(t *testing.T) {
	got, err := ComputeHash([]byte("hello"), "sha256")
	if err != nil {
		t.Fatal(err)
	}
	want := "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
	if got != want {
		t.Errorf("got %q, want %q", got, want)
	}
}

func TestComputeHash_sha512(t *testing.T) {
	got, err := ComputeHash([]byte("hello"), "sha512")
	if err != nil {
		t.Fatal(err)
	}
	want := "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043"
	if got != want {
		t.Errorf("got %q, want %q", got, want)
	}
}

func TestComputeHash_unknown(t *testing.T) {
	_, err := ComputeHash([]byte("hello"), "sha999")
	if err == nil {
		t.Fatal("expected error for unknown algorithm")
	}
}

func TestComputeHash_emptyInput(t *testing.T) {
	got, err := ComputeHash([]byte{}, "sha256")
	if err != nil {
		t.Fatal(err)
	}
	want := "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
	if got != want {
		t.Errorf("got %q, want %q", got, want)
	}
}

func TestComputeHash_caseInsensitive(t *testing.T) {
	got, err := ComputeHash([]byte("hello"), "MD5")
	if err != nil {
		t.Fatal(err)
	}
	want := "5d41402abc4b2a76b9719d911017c592"
	if got != want {
		t.Errorf("got %q, want %q", got, want)
	}
}

func TestComputeHash_nilInput(t *testing.T) {
	got, err := ComputeHash(nil, "sha256")
	if err != nil {
		t.Fatal(err)
	}
	want := "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
	if got != want {
		t.Errorf("got %q, want %q", got, want)
	}
}

func TestComputeHash_unicodeInput(t *testing.T) {
	got, err := ComputeHash([]byte("héllo wörld 🔐"), "sha256")
	if err != nil {
		t.Fatal(err)
	}
	want := "9be81d7b234d569ec072f94cf871c8becbb2ebf83d69191d719a867c7c2d63b1"
	if got != want {
		t.Errorf("got %q, want %q", got, want)
	}
}

func TestComputeHash_largeInput(t *testing.T) {
	input := make([]byte, 100000)
	for i := range input {
		input[i] = byte(i % 256)
	}
	got, err := ComputeHash(input, "sha256")
	if err != nil {
		t.Fatal(err)
	}
	want := "db8f1d69251d95e2c88268d3c540533cc5182e0e33065a6f3f322f606a574489"
	if got != want {
		t.Errorf("got %q, want %q", got, want)
	}
}

func TestCmd_WithTextAndSHA256(t *testing.T) {
	cmd := NewCommand()
	cmd.Flags().Set("text", "test")
	cmd.Flags().Set("algo", "sha256")

	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	output = strings.TrimSpace(output)
	want := "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
	if output != want {
		t.Errorf("got %q, want %q", output, want)
	}
}

func TestCmd_WithTextMD5(t *testing.T) {
	cmd := NewCommand()
	cmd.Flags().Set("text", "hello")
	cmd.Flags().Set("algo", "md5")

	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	output = strings.TrimSpace(output)
	want := "5d41402abc4b2a76b9719d911017c592"
	if output != want {
		t.Errorf("got %q, want %q", output, want)
	}
}

func TestCmd_WithTextSHA1(t *testing.T) {
	cmd := NewCommand()
	cmd.Flags().Set("text", "hello")
	cmd.Flags().Set("algo", "sha1")

	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	output = strings.TrimSpace(output)
	want := "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d"
	if output != want {
		t.Errorf("got %q, want %q", output, want)
	}
}

func TestCmd_WithTextSHA512(t *testing.T) {
	cmd := NewCommand()
	cmd.Flags().Set("text", "hello")
	cmd.Flags().Set("algo", "sha512")

	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	output = strings.TrimSpace(output)
	want := "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043"
	if output != want {
		t.Errorf("got %q, want %q", output, want)
	}
}

func TestCmd_WithHMAC(t *testing.T) {
	cmd := NewCommand()
	cmd.Flags().Set("text", "hello")
	cmd.Flags().Set("algo", "sha256")
	cmd.Flags().Set("key", "secret")

	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	output = strings.TrimSpace(output)
	want := "88aab3ede8d3adf94d26ab90d3bafd4a2083070c3bcce9c014ee04a443847c0b"
	if output != want {
		t.Errorf("got %q, want %q", output, want)
	}
}

func TestCmd_WithHMAC_JSON(t *testing.T) {
	cmd := NewCommand()
	cmd.Flags().Set("text", "hello")
	cmd.Flags().Set("algo", "sha256")
	cmd.Flags().Set("key", "secret")
	cmd.Flags().Set("json", "true")

	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})

	if !strings.Contains(output, `"mode": "hmac"`) {
		t.Errorf("expected hmac mode in JSON, got:\n%s", output)
	}
	if !strings.Contains(output, `"hash":`) {
		t.Errorf("expected hash field in JSON, got:\n%s", output)
	}
}

func TestCmd_WithFileArg(t *testing.T) {
	tmp := t.TempDir()
	filePath := tmp + "/test.txt"
	if err := os.WriteFile(filePath, []byte("hello"), 0644); err != nil {
		t.Fatal(err)
	}

	cmd := NewCommand()
	cmd.Flags().Set("algo", "sha256")

	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{filePath}); err != nil {
			t.Fatal(err)
		}
	})
	output = strings.TrimSpace(output)
	want := "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
	if output != want {
		t.Errorf("got %q, want %q", output, want)
	}
}

func TestCmd_WithCheck(t *testing.T) {
	tmp := t.TempDir()
	filePath := tmp + "/data.txt"
	if err := os.WriteFile(filePath, []byte("hello"), 0644); err != nil {
		t.Fatal(err)
	}

	hash := "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
	checkInput := hash + " " + filePath

	cmd := NewCommand()
	cmd.Flags().Set("check", "true")
	cmd.Flags().Set("algo", "sha256")
	cmd.Flags().Set("text", checkInput)

	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	output = strings.TrimSpace(output)
	if !strings.Contains(output, "OK") {
		t.Errorf("expected OK in output, got %q", output)
	}
}

func TestCmd_WithCheck_Mismatch(t *testing.T) {
	tmp := t.TempDir()
	filePath := tmp + "/data.txt"
	if err := os.WriteFile(filePath, []byte("hello"), 0644); err != nil {
		t.Fatal(err)
	}

	checkInput := "0000000000000000000000000000000000000000000000000000000000000000 " + filePath

	cmd := NewCommand()
	cmd.Flags().Set("check", "true")
	cmd.Flags().Set("algo", "sha256")
	cmd.Flags().Set("text", checkInput)

	err := cmd.RunE(cmd, []string{})
	if err == nil {
		t.Fatal("expected error for hash mismatch")
	}
	if !strings.Contains(err.Error(), "hash mismatch") {
		t.Errorf("expected hash mismatch error, got %v", err)
	}
}

func TestCmd_WithCheck_JSON(t *testing.T) {
	tmp := t.TempDir()
	filePath := tmp + "/data.txt"
	if err := os.WriteFile(filePath, []byte("hello"), 0644); err != nil {
		t.Fatal(err)
	}

	hash := "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
	checkInput := hash + " " + filePath

	cmd := NewCommand()
	cmd.Flags().Set("check", "true")
	cmd.Flags().Set("algo", "sha256")
	cmd.Flags().Set("json", "true")
	cmd.Flags().Set("text", checkInput)

	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})

	if !strings.Contains(output, `"status": true`) {
		t.Errorf("expected status true in JSON, got:\n%s", output)
	}
}

func TestCmd_WithStdin(t *testing.T) {
	cmd := NewCommand()
	r, w, _ := os.Pipe()
	w.Write([]byte("hello"))
	w.Close()
	oldStdin := os.Stdin
	os.Stdin = r
	defer func() { os.Stdin = oldStdin }()

	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})
	output = strings.TrimSpace(output)
	want := "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
	if output != want {
		t.Errorf("got %q, want %q", output, want)
	}
}

func TestCmd_WithTextSHA256JSON(t *testing.T) {
	cmd := NewCommand()
	cmd.Flags().Set("text", "hello")
	cmd.Flags().Set("algo", "sha256")
	cmd.Flags().Set("json", "true")

	output := captureOutput(func() {
		if err := cmd.RunE(cmd, []string{}); err != nil {
			t.Fatal(err)
		}
	})

	if !strings.Contains(output, `"algorithm": "sha256"`) {
		t.Errorf("expected sha256 in JSON, got:\n%s", output)
	}
	if !strings.Contains(output, `"hash":`) {
		t.Errorf("expected hash in JSON, got:\n%s", output)
	}
}

func TestCmd_WithCheck_InvalidFormat(t *testing.T) {
	cmd := NewCommand()
	cmd.Flags().Set("check", "true")
	cmd.Flags().Set("text", "invalidformat")

	err := cmd.RunE(cmd, []string{})
	if err == nil {
		t.Fatal("expected error for invalid check format")
	}
	if !strings.Contains(err.Error(), "invalid --check format") {
		t.Errorf("expected invalid check format error, got %v", err)
	}
}
