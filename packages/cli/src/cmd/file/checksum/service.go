package checksum

import (
	"crypto/md5"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"os"
)

func runChecksum(filePath, algorithm string, jsonOutput bool) error {
	f, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer f.Close()

	var hash string
	switch algorithm {
	case "md5":
		h := md5.New()
		io.Copy(h, f)
		hash = hex.EncodeToString(h.Sum(nil))
	case "sha1":
		h := sha1.New()
		io.Copy(h, f)
		hash = hex.EncodeToString(h.Sum(nil))
	case "sha256":
		h := sha256.New()
		io.Copy(h, f)
		hash = hex.EncodeToString(h.Sum(nil))
	case "sha512":
		h := sha512.New()
		io.Copy(h, f)
		hash = hex.EncodeToString(h.Sum(nil))
	default:
		h := sha256.New()
		io.Copy(h, f)
		hash = hex.EncodeToString(h.Sum(nil))
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]string{
			"file":      filePath,
			"algorithm": algorithm,
			"hash":      hash,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Printf("%s  %s\n", hash, filePath)
	}
	return nil
}
