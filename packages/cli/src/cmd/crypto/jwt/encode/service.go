package encode

import (
	"encoding/json"
	"fmt"

	"github.com/golang-jwt/jwt/v5"
)

func runEncode(algorithm, key, claimsJSON string, jsonOutput bool) error {
	var claims jwt.MapClaims
	if err := json.Unmarshal([]byte(claimsJSON), &claims); err != nil {
		return fmt.Errorf("invalid claims JSON: %w", err)
	}

	var signingMethod jwt.SigningMethod
	switch algorithm {
	case "HS256":
		signingMethod = jwt.SigningMethodHS256
	case "HS384":
		signingMethod = jwt.SigningMethodHS384
	case "HS512":
		signingMethod = jwt.SigningMethodHS512
	default:
		return fmt.Errorf("unsupported algorithm: %s (use HS256, HS384, HS512)", algorithm)
	}

	token := jwt.NewWithClaims(signingMethod, claims)
	signed, err := token.SignedString([]byte(key))
	if err != nil {
		return fmt.Errorf("signing failed: %w", err)
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"token": signed,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Println(signed)
	}
	return nil
}
