package hash

import (
	"crypto/hmac"
	"crypto/md5"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"hash"
	"io"
	"os"
	"strings"
)

func runHash(algorithm, text, key string, check, jsonOutput bool, args []string) error {
	var input []byte

	if text != "" {
		input = []byte(text)
	} else if len(args) > 0 {
		var err error
		input, err = os.ReadFile(args[0])
		if err != nil {
			return fmt.Errorf("read file: %w", err)
		}
	} else {
		var err error
		input, err = io.ReadAll(os.Stdin)
		if err != nil {
			return fmt.Errorf("read stdin: %w", err)
		}
	}

	if check {
		parts := strings.SplitN(strings.TrimSpace(string(input)), " ", 2)
		if len(parts) != 2 {
			return fmt.Errorf("invalid --check format: expected 'hash filename'")
		}
		expectedHash := parts[0]
		filename := parts[1]

		fileContent, err := os.ReadFile(filename)
		if err != nil {
			return fmt.Errorf("read file for check: %w", err)
		}

		actualHash, err := ComputeHash(fileContent, algorithm)
		if err != nil {
			return err
		}

		status := actualHash == expectedHash
		if jsonOutput {
			b, _ := json.MarshalIndent(map[string]interface{}{
				"filename":  filename,
				"algorithm": algorithm,
				"expected":  expectedHash,
				"actual":    actualHash,
				"status":    status,
			}, "", "  ")
			fmt.Println(string(b))
		} else {
			if status {
				fmt.Printf("%s: OK\n", filename)
			} else {
				fmt.Printf("%s: FAILED\n", filename)
				return fmt.Errorf("hash mismatch")
			}
		}
		return nil
	}

	if key != "" {
		var h func() hash.Hash
		switch strings.ToLower(algorithm) {
		case "md5":
			h = md5.New
		case "sha1":
			h = sha1.New
		case "sha256":
			h = sha256.New
		case "sha512":
			h = sha512.New
		default:
			return fmt.Errorf("unknown algorithm: %s", algorithm)
		}
		mac := hmac.New(h, []byte(key))
		mac.Write(input)
		result := hex.EncodeToString(mac.Sum(nil))
		if jsonOutput {
			b, _ := json.MarshalIndent(map[string]interface{}{
				"algorithm": algorithm,
				"mode":      "hmac",
				"hash":      result,
			}, "", "  ")
			fmt.Println(string(b))
		} else {
			fmt.Println(result)
		}
	} else {
		result, err := ComputeHash(input, algorithm)
		if err != nil {
			return err
		}
		if jsonOutput {
			b, _ := json.MarshalIndent(map[string]interface{}{
				"algorithm": algorithm,
				"hash":      result,
			}, "", "  ")
			fmt.Println(string(b))
		} else {
			fmt.Println(result)
		}
	}

	return nil
}

func ComputeHash(input []byte, algorithm string) (string, error) {
	switch strings.ToLower(algorithm) {
	case "md5":
		h := md5.Sum(input)
		return hex.EncodeToString(h[:]), nil
	case "sha1":
		h := sha1.Sum(input)
		return hex.EncodeToString(h[:]), nil
	case "sha256":
		h := sha256.Sum256(input)
		return hex.EncodeToString(h[:]), nil
	case "sha512":
		h := sha512.Sum512(input)
		return hex.EncodeToString(h[:]), nil
	default:
		return "", fmt.Errorf("unknown algorithm: %s", algorithm)
	}
}
