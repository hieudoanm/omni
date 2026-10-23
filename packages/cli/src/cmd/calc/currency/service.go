package currency

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type frankfurterResponse struct {
	Amount float64            `json:"amount"`
	Base   string             `json:"base"`
	Date   string             `json:"date"`
	Rates  map[string]float64 `json:"rates"`
}

func runCurrency(from, to string, amount float64, jsonOutput bool) error {
	url := fmt.Sprintf("https://api.frankfurter.app/latest?base=%s&symbols=%s", from, to)
	responseByte, err := requests.Get(url, requests.Options{})
	if err != nil {
		return fmt.Errorf("fetch error: %w", err)
	}

	var response frankfurterResponse
	if err := json.Unmarshal(responseByte, &response); err != nil {
		return fmt.Errorf("parse error: %w", err)
	}

	rate, ok := response.Rates[to]
	if !ok {
		return fmt.Errorf("no rate found for %s", to)
	}

	converted := amount * rate
	if jsonOutput {
		out, err := json.MarshalIndent(map[string]interface{}{
			"from":   from,
			"to":     to,
			"amount": amount,
			"rate":   rate,
			"result": converted,
			"date":   response.Date,
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
	} else {
		fmt.Printf("%.2f %s = %.2f %s (rate: %f)\n", amount, from, converted, to, rate)
	}
	return nil
}
