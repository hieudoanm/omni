package mortgage

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/calc/internal"
)

func runMortgage(principal, rate, years, taxes, insurance, pmi float64, jsonOutput bool) error {
	n := years * 12
	payment := internal.CalcPayment(principal, rate, years)

	monthlyTaxes := taxes / 12
	monthlyInsurance := insurance / 12
	monthlyPMI := pmi / 12
	totalMonthly := payment + monthlyTaxes + monthlyInsurance + monthlyPMI
	totalPaid := totalMonthly * n
	totalInterest := totalPaid - principal - monthlyTaxes*n - monthlyInsurance*n - monthlyPMI*n

	if jsonOutput {
		out, err := json.MarshalIndent(map[string]interface{}{
			"principal":         principal,
			"rate":              rate,
			"years":             years,
			"monthly_payment":   payment,
			"monthly_taxes":     monthlyTaxes,
			"monthly_insurance": monthlyInsurance,
			"monthly_pmi":       monthlyPMI,
			"total_monthly":     totalMonthly,
			"total_paid":        totalPaid,
			"total_interest":    totalInterest,
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
		return nil
	}

	fmt.Println("=== Mortgage Calculator ===")
	fmt.Printf("Principal:           %14.2f\n", principal)
	fmt.Printf("Annual rate:         %14.2f%%\n", rate)
	fmt.Printf("Years:               %14.0f\n", years)
	fmt.Println()
	fmt.Printf("Principal & Interest: %12.2f\n", payment)
	if taxes > 0 {
		fmt.Printf("Property taxes:      %12.2f/mo\n", monthlyTaxes)
	}
	if insurance > 0 {
		fmt.Printf("Insurance:           %12.2f/mo\n", monthlyInsurance)
	}
	if pmi > 0 {
		fmt.Printf("PMI:                 %12.2f/mo\n", monthlyPMI)
	}
	fmt.Println(strings.Repeat("-", 35))
	fmt.Printf("Total monthly:       %12.2f\n", totalMonthly)
	fmt.Println()
	fmt.Printf("Total paid:          %14.2f\n", totalPaid)
	fmt.Printf("Total interest:      %14.2f\n", totalInterest)
	return nil
}
