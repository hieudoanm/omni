package loan

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/calc/internal"
)

type monthRow struct {
	Month    int     `json:"month"`
	Payment  float64 `json:"payment"`
	Interest float64 `json:"interest"`
	Balance  float64 `json:"balance"`
}

func runLoan(principal, rate, years float64, jsonOutput bool) error {
	payment := internal.CalcPayment(principal, rate, years)
	n := years * 12
	totalPayment := payment * n
	totalInterest := totalPayment - principal

	r := rate / 100.0 / 12

	if jsonOutput {
		var schedule []monthRow
		balance := principal
		for i := 1; i <= int(n) && i <= 12; i++ {
			interest := balance * r
			principalPaid := payment - interest
			balance -= principalPaid
			schedule = append(schedule, monthRow{i, payment, interest, balance})
		}
		out, err := json.MarshalIndent(map[string]interface{}{
			"principal":      principal,
			"rate":           rate,
			"years":          years,
			"monthly":        payment,
			"total_paid":     totalPayment,
			"total_interest": totalInterest,
			"schedule":       schedule,
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
		return nil
	}

	fmt.Println("=== Loan Amortization ===")
	fmt.Printf("Principal:     %15.2f\n", principal)
	fmt.Printf("Annual rate:   %15.2f%%\n", rate)
	fmt.Printf("Years:         %15.0f\n", years)
	fmt.Printf("Monthly:       %15.2f\n", payment)
	fmt.Printf("Total paid:    %15.2f\n", totalPayment)
	fmt.Printf("Total interest:%15.2f\n", totalInterest)
	fmt.Println()
	fmt.Printf("%-6s %12s %12s %12s\n", "Month", "Payment", "Interest", "Balance")
	fmt.Println("------   ------------   ------------   ------------")
	balance := principal
	for i := 1; i <= int(n) && i <= 12; i++ {
		interest := balance * r
		principalPaid := payment - interest
		balance -= principalPaid
		fmt.Printf("%-6d %12.2f %12.2f %12.2f\n", i, payment, interest, balance)
	}
	if n > 12 {
		fmt.Printf("... (%0.f more months)\n", n-12)
	}
	return nil
}
