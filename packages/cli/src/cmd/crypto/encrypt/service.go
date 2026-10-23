package encrypt

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"os"
)

func runEncrypt(file, password, output string, jsonOutput bool) error {
	plaintext, err := os.ReadFile(file)
	if err != nil {
		return err
	}

	key := sha256.Sum256([]byte(password))
	block, err := aes.NewCipher(key[:])
	if err != nil {
		return err
	}

	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return err
	}

	nonce := make([]byte, aesgcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return err
	}

	ciphertext := aesgcm.Seal(nil, nonce, plaintext, nil)

	outPath := output
	if outPath == "" {
		outPath = file + ".enc"
	}

	if err := os.WriteFile(outPath, append(nonce, ciphertext...), 0644); err != nil {
		return err
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"input":  file,
			"output": outPath,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Println(outPath)
	}
	return nil
}
