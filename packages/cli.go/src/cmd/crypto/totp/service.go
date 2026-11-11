package totp

import (
	"crypto/hmac"
	"crypto/sha1"
	"encoding/base32"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"math"
	"strings"
	"time"
)

func runTOTP(secretStr string, step, digits int, timeStr string, jsonOutput bool) error {
	secret := strings.ToUpper(strings.TrimSpace(secretStr))
	secret = strings.ReplaceAll(secret, " ", "")

	padding := 8 - len(secret)%8
	if padding > 0 && padding < 8 {
		secret += strings.Repeat("=", padding)
	}

	key, err := base32.StdEncoding.DecodeString(secret)
	if err != nil {
		return fmt.Errorf("invalid Base32 secret: %w", err)
	}

	var t time.Time
	if timeStr != "" {
		t, err = time.Parse(time.RFC3339, timeStr)
		if err != nil {
			return fmt.Errorf("invalid time (use RFC3339): %w", err)
		}
	} else {
		t = time.Now()
	}

	counter := uint64(t.Unix()) / uint64(step)

	counterBytes := make([]byte, 8)
	binary.BigEndian.PutUint64(counterBytes, counter)

	mac := hmac.New(sha1.New, key)
	mac.Write(counterBytes)
	hash := mac.Sum(nil)

	offset := hash[len(hash)-1] & 0x0f
	code := int32(binary.BigEndian.Uint32(hash[offset:offset+4]) & 0x7fffffff)
	code %= int32(math.Pow10(digits))

	format := fmt.Sprintf("%%0%dd", digits)
	codeStr := fmt.Sprintf(format, code)

	remaining := uint64(step) - (uint64(t.Unix()) % uint64(step))

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"code":      codeStr,
			"step":      step,
			"remaining": remaining,
			"time":      t.Format(time.RFC3339),
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Println(codeStr)
	}
	return nil
}
