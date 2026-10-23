package factorial

import (
	"encoding/json"
	"fmt"
	"math/big"
)

func runFactorial(number int, jsonOutput bool) error {
	n := int64(number)
	if n < 0 {
		return fmt.Errorf("factorial of negative number is undefined")
	}

	result := new(big.Int).MulRange(1, n)

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"n":         n,
			"factorial": result.String(),
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Println(result.String())
	}
	return nil
}
