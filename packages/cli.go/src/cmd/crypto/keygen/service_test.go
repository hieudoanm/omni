package keygen

import (
	"crypto/rand"
	"crypto/rsa"
	"errors"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

type failingReader struct{}

func (r *failingReader) Read([]byte) (int, error) {
	return 0, errors.New("simulated read error")
}

func TestWriteKeys_invalidPrivateKey(t *testing.T) {
	path := filepath.Join(t.TempDir(), "testkey")
	err := writeKeys("not-a-key", 123, path)
	if err == nil {
		t.Fatal("expected error for invalid private key type")
	}
}

func TestWriteKeys_invalidPublicKey(t *testing.T) {
	path := filepath.Join(t.TempDir(), "testkey")
	priv, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatal(err)
	}
	err = writeKeys(priv, "not-a-public-key", path)
	if err == nil {
		t.Fatal("expected error for invalid public key type")
	}
}

func TestGenRSA_2048(t *testing.T) {
	path := filepath.Join(t.TempDir(), "id_rsa")
	if err := GenRSA(2048, path); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(path); os.IsNotExist(err) {
		t.Error("private key file not created")
	}
	if _, err := os.Stat(path + ".pub"); os.IsNotExist(err) {
		t.Error("public key file not created")
	}
}

func TestGenRSA_4096(t *testing.T) {
	path := filepath.Join(t.TempDir(), "id_rsa")
	if err := GenRSA(4096, path); err != nil {
		t.Fatal(err)
	}
}

func TestGenRSA_invalidBits(t *testing.T) {
	err := GenRSA(1024, "/tmp/test")
	if err == nil {
		t.Fatal("expected error for 1024-bit RSA")
	}
}

func TestGenECDSA_256(t *testing.T) {
	path := filepath.Join(t.TempDir(), "id_ecdsa")
	if err := GenECDSA(256, path); err != nil {
		t.Fatal(err)
	}
}

func TestGenECDSA_384(t *testing.T) {
	path := filepath.Join(t.TempDir(), "id_ecdsa")
	if err := GenECDSA(384, path); err != nil {
		t.Fatal(err)
	}
}

func TestGenECDSA_521(t *testing.T) {
	path := filepath.Join(t.TempDir(), "id_ecdsa")
	if err := GenECDSA(521, path); err != nil {
		t.Fatal(err)
	}
}

func TestGenECDSA_invalidBits(t *testing.T) {
	err := GenECDSA(128, "/tmp/test")
	if err == nil {
		t.Fatal("expected error for 128-bit ECDSA")
	}
}

func TestGenEd25519(t *testing.T) {
	path := filepath.Join(t.TempDir(), "id_ed25519")
	if err := GenEd25519(path); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(path); os.IsNotExist(err) {
		t.Error("private key file not created")
	}
	if _, err := os.Stat(path + ".pub"); os.IsNotExist(err) {
		t.Error("public key file not created")
	}
}

func TestGenEd25519_randError(t *testing.T) {
	old := KeygenReader
	KeygenReader = &failingReader{}
	defer func() { KeygenReader = old }()

	err := GenEd25519(filepath.Join(t.TempDir(), "id_ed25519"))
	if err == nil {
		t.Fatal("expected error from failing reader")
	}
}

func TestGenRSA_2048_nestedDir(t *testing.T) {
	path := filepath.Join(t.TempDir(), "subdir", "nested", "id_rsa")
	if err := GenRSA(2048, path); err != nil {
		t.Fatal(err)
	}
}

func TestRunKeygen_unsupportedAlgorithm(t *testing.T) {
	err := runKeygen("dsa", 1024, "/tmp/key", false)
	if err == nil {
		t.Fatal("expected error")
	}
	if !strings.Contains(err.Error(), "unsupported algorithm") {
		t.Errorf("err = %q, want unsupported algorithm error", err.Error())
	}
}

func TestRunKeygen_ed25519_json(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "id_ed25519")

	r, w, _ := os.Pipe()
	oldStdout := os.Stdout
	os.Stdout = w

	err := runKeygen("ed25519", 256, path, true)

	w.Close()
	out, _ := io.ReadAll(r)
	os.Stdout = oldStdout

	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(out), `"algorithm": "ed25519"`) {
		t.Errorf("expected JSON with algorithm ed25519, got: %s", string(out))
	}
	if _, err := os.Stat(path); os.IsNotExist(err) {
		t.Error("private key file not created")
	}
}

func TestRunKeygen_rsa_json(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "id_rsa")

	r, w, _ := os.Pipe()
	oldStdout := os.Stdout
	os.Stdout = w

	err := runKeygen("rsa", 2048, path, true)

	w.Close()
	out, _ := io.ReadAll(r)
	os.Stdout = oldStdout

	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(out), `"algorithm": "rsa"`) {
		t.Errorf("expected JSON with algorithm rsa, got: %s", string(out))
	}
	if _, err := os.Stat(path); os.IsNotExist(err) {
		t.Error("private key file not created")
	}
}
