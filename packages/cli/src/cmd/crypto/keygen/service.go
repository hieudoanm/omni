package keygen

import (
	"crypto/ecdsa"
	"crypto/ed25519"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

var KeygenReader io.Reader = rand.Reader

func runKeygen(algorithm string, bits int, output string, jsonOutput bool) error {
	switch algorithm {
	case "rsa":
		if err := GenRSA(bits, output); err != nil {
			return err
		}
	case "ecdsa":
		if err := GenECDSA(bits, output); err != nil {
			return err
		}
	case "ed25519":
		if err := GenEd25519(output); err != nil {
			return err
		}
	default:
		return fmt.Errorf("unsupported algorithm: %s (use rsa, ecdsa, or ed25519)", algorithm)
	}

	if jsonOutput {
		abs, _ := filepath.Abs(output)
		b, _ := json.MarshalIndent(map[string]interface{}{
			"algorithm":   algorithm,
			"bits":        bits,
			"private_key": abs,
			"public_key":  abs + ".pub",
		}, "", "  ")
		fmt.Println(string(b))
	}

	return nil
}

func GenRSA(bits int, path string) error {
	if bits != 2048 && bits != 4096 {
		return fmt.Errorf("rsa key size must be 2048 or 4096")
	}
	key, err := rsa.GenerateKey(rand.Reader, bits)
	if err != nil {
		return fmt.Errorf("generate rsa key: %w", err)
	}
	return writeKeys(key, &key.PublicKey, path)
}

func GenECDSA(bits int, path string) error {
	var curve elliptic.Curve
	switch bits {
	case 256:
		curve = elliptic.P256()
	case 384:
		curve = elliptic.P384()
	case 521:
		curve = elliptic.P521()
	default:
		return fmt.Errorf("ecdsa key size must be 256, 384, or 521")
	}
	key, err := ecdsa.GenerateKey(curve, rand.Reader)
	if err != nil {
		return fmt.Errorf("generate ecdsa key: %w", err)
	}
	return writeKeys(key, &key.PublicKey, path)
}

func GenEd25519(path string) error {
	pub, priv, err := ed25519.GenerateKey(KeygenReader)
	if err != nil {
		return fmt.Errorf("generate ed25519 key: %w", err)
	}
	return writeKeys(priv, pub, path)
}

func writeKeys(privateKey, publicKey any, path string) error {
	privBytes, err := x509.MarshalPKCS8PrivateKey(privateKey)
	if err != nil {
		return fmt.Errorf("marshal private key: %w", err)
	}

	pubBytes, err := x509.MarshalPKIXPublicKey(publicKey)
	if err != nil {
		return fmt.Errorf("marshal public key: %w", err)
	}

	if err := os.MkdirAll(filepath.Dir(path), 0700); err != nil {
		return err
	}

	privFile, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		return fmt.Errorf("create private key file: %w", err)
	}
	defer privFile.Close()

	if err := pem.Encode(privFile, &pem.Block{Type: "PRIVATE KEY", Bytes: privBytes}); err != nil {
		return err
	}
	privFile.Close()

	pubFile, err := os.OpenFile(path+".pub", os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0644)
	if err != nil {
		return fmt.Errorf("create public key file: %w", err)
	}
	defer pubFile.Close()

	if err := pem.Encode(pubFile, &pem.Block{Type: "PUBLIC KEY", Bytes: pubBytes}); err != nil {
		return err
	}
	pubFile.Close()

	abs, _ := filepath.Abs(path)
	fmt.Printf("Wrote %s\n", abs)
	fmt.Printf("Wrote %s.pub\n", abs)
	return nil
}
