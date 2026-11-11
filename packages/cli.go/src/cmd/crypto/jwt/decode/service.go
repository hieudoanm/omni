package decode

import (
	"encoding/json"
	"fmt"

	"github.com/golang-jwt/jwt/v5"
)

func runDecode(token string, jsonOutput bool) error {
	parser := jwt.NewParser(jwt.WithoutClaimsValidation())
	parsed, _, err := parser.ParseUnverified(token, jwt.MapClaims{})
	if err != nil {
		return fmt.Errorf("parse failed: %w", err)
	}

	parts := splitJWT(token)

	headerData, _ := jwt.NewParser().DecodeSegment(parts[0])
	var headerJSON interface{}
	if err := json.Unmarshal(headerData, &headerJSON); err != nil {
		headerJSON = string(headerData)
	}

	if jsonOutput {
		var payload interface{}
		if claims, ok := parsed.Claims.(jwt.MapClaims); ok {
			payload = map[string]interface{}(claims)
		}
		out, err := json.MarshalIndent(map[string]interface{}{
			"header":  headerJSON,
			"payload": payload,
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
	} else {
		fmt.Printf("Header:\n%s\n\n", string(headerData))
		fmt.Printf("Payload:\n")
		if claims, ok := parsed.Claims.(jwt.MapClaims); ok {
			for k, v := range claims {
				fmt.Printf("  %s: %v\n", k, v)
			}
		}
	}
	return nil
}

func splitJWT(token string) []string {
	dot1 := -1
	dot2 := -1
	for i, c := range token {
		if c == '.' {
			if dot1 == -1 {
				dot1 = i
			} else if dot2 == -1 {
				dot2 = i
				break
			}
		}
	}
	if dot1 == -1 || dot2 == -1 {
		return []string{token}
	}
	return []string{token[:dot1], token[dot1+1 : dot2]}
}
