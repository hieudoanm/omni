package passwd

import (
	"encoding/json"
	"fmt"
	"math/rand"
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

func runPasswd(length, count int, digits, symbols, noUpper, pin, clip, pronounceable, jsonOutput bool) error {
	var passwords []string

	gen := func() string {
		if pin {
			pinStr := make([]byte, length)
			for j := range pinStr {
				pinStr[j] = passwdDigits[rand.Intn(len(passwdDigits))]
			}
			return string(pinStr)
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
			pw[j] = charset[rand.Intn(len(charset))]
		}
		return string(pw)
	}

	for i := 0; i < count; i++ {
		passwords = append(passwords, gen())
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
			if clip && i == 0 {
				fmt.Print(p)
			} else {
				fmt.Println(p)
			}
		}
	}
	return nil
}

func GeneratePronounceable(length int) string {
	var sb strings.Builder
	for sb.Len() < length {
		sb.WriteByte(passwdCons[rand.Intn(len(passwdCons))])
		sb.WriteByte(passwdVowels[rand.Intn(len(passwdVowels))])
	}
	return sb.String()[:length]
}
