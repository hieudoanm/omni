package passwd

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"math/big"
	"strings"
)

const (
	passwdLower   = "abcdefghijklmnopqrstuvwxyz"
	passwdUpper   = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	passwdDigits  = "0123456789"
	passwdSymbols = "!@#$%^&*()-_=+[]{}<>?|~"
	passwdVowels  = "aeiou"
	passwdCons    = "bcdfghjklmnpqrstvwxyz"
)

// randIndex returns a uniform random index in [0, n) using crypto/rand.
func randIndex(n int) (int, error) {
	v, err := rand.Int(rand.Reader, big.NewInt(int64(n)))
	if err != nil {
		return 0, err
	}
	return int(v.Int64()), nil
}

func runPasswd(length, count int, digits, symbols, noUpper, pin, clip, pronounceable, jsonOutput bool) error {
	var passwords []string

	gen := func() (string, error) {
		if pin {
			pinStr := make([]byte, length)
			for j := range pinStr {
				idx, err := randIndex(len(passwdDigits))
				if err != nil {
					return "", err
				}
				pinStr[j] = passwdDigits[idx]
			}
			return string(pinStr), nil
		}

		if pronounceable {
			return GeneratePronounceable(length)
		}

		charset := passwdLower
		if !noUpper {
			charset += passwdUpper
		}
		if digits {
			charset += passwdDigits
		}
		if symbols {
			charset += passwdSymbols
		}

		pw := make([]byte, length)
		for j := range pw {
			idx, err := randIndex(len(charset))
			if err != nil {
				return "", err
			}
			pw[j] = charset[idx]
		}
		return string(pw), nil
	}

	for i := 0; i < count; i++ {
		pw, err := gen()
		if err != nil {
			return err
		}
		passwords = append(passwords, pw)
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"passwords": passwords,
			"count":     count,
			"length":    length,
			"type": func() string {
				if pin {
					return "pin"
				}
				if pronounceable {
					return "pronounceable"
				}
				return "random"
			}(),
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		for i, p := range passwords {
			if clip && i == len(passwords)-1 {
				fmt.Print(p)
			} else {
				fmt.Println(p)
			}
		}
	}
	return nil
}

func GeneratePronounceable(length int) (string, error) {
	var sb strings.Builder
	for sb.Len() < length {
		consIdx, err := randIndex(len(passwdCons))
		if err != nil {
			return "", err
		}
		sb.WriteByte(passwdCons[consIdx])
		vowelIdx, err := randIndex(len(passwdVowels))
		if err != nil {
			return "", err
		}
		sb.WriteByte(passwdVowels[vowelIdx])
	}
	return sb.String()[:length], nil
}
