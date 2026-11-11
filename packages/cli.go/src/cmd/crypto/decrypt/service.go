package decrypt

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"os"
)

func runDecrypt(file, password, output string, jsonOutput bool) error {
	data, err := os.ReadFile(file)
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

	nonceSize := aesgcm.NonceSize()
	if len(data) < nonceSize {
		return fmt.Errorf("file too small to be valid encrypted data")
	}

	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	plaintext, err := aesgcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return fmt.Errorf("decryption failed (wrong password or corrupted file): %w", err)
	}

	outPath := output
	if outPath == "" {
		outPath = file
		if len(outPath) > 4 && outPath[len(outPath)-4:] == ".enc" {
			outPath = outPath[:len(outPath)-4]
		} else {
			outPath = outPath + ".dec"
		}
	}

	if err := os.WriteFile(outPath, plaintext, 0644); err != nil {
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
