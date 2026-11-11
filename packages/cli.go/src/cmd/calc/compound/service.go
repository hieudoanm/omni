package compound

import (
	"encoding/json"
	"fmt"
	"math"
)

type compoundYearRow struct {
	Year     int     `json:"year"`
	Balance  float64 `json:"balance"`
	Interest float64 `json:"interest"`
	Deposits float64 `json:"deposits"`
}

func compoundingPeriods(freq string) float64 {
	switch freq {
	case "daily":
		return 365
	case "monthly":
		return 12
	case "quarterly":
		return 4
	default:
		return 1
	}
}

func futureValue(principal, rate, years, contribute float64, n float64) (totalFV, totalContributions float64) {
	nt := n * years
	r := rate / 100.0

	fvPrincipal := principal * math.Pow(1+r/n, nt)

	var fvContributions float64
	if contribute > 0 {
		if r == 0 {
			fvContributions = contribute * nt
		} else {
			fvContributions = contribute * (math.Pow(1+r/n, nt) - 1) / (r / n)
		}
	}

	totalFV = fvPrincipal + fvContributions
	totalContributions = principal + contribute*nt
	return
}

func yearBreakdown(principal, rate, years, contribute float64, n float64) []compoundYearRow {
	var rows []compoundYearRow

	r := rate / 100.0
	for y := 1; y <= int(years); y++ {
		pt := n * float64(y)
		fv := principal * math.Pow(1+r/n, pt)
		deposits := principal + contribute*n*float64(y)
		if contribute > 0 {
			if r > 0 {
				fv += contribute * (math.Pow(1+r/n, pt) - 1) / (r / n)
			} else {
				fv = principal + contribute*n*float64(y)
			}
		}
		interest := fv - deposits
		rows = append(rows, compoundYearRow{Year: y, Balance: fv, Interest: interest, Deposits: deposits})
	}
	return rows
}

func runCompound(principal, rate, years, contribute float64, compound string, jsonOutput bool) error {
	n := compoundingPeriods(compound)

	fv, totalDeposits := futureValue(principal, rate, years, contribute, n)
	totalInterest := fv - totalDeposits

	if jsonOutput {
		rows := yearBreakdown(principal, rate, years, contribute, n)
		out, err := json.MarshalIndent(map[string]interface{}{
			"principal":      principal,
			"rate":           rate,
			"years":          years,
			"compounding":    compound,
			"contribution":   contribute,
			"future_value":   fv,
			"total_deposits": totalDeposits,
			"total_interest": totalInterest,
			"year_breakdown": rows,
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
		return nil
	}

	freqLabel := compound
	periodLabel := "per " + compound[:len(compound)-2] + "y"
	if compound == "monthly" {
		periodLabel = "per month"
	} else if compound == "daily" {
		periodLabel = "per day"
	}

	fmt.Println("=== Compound Interest Calculator ===")
	fmt.Printf("Principal:         %15.2f\n", principal)
	fmt.Printf("Annual rate:       %15.2f%%\n", rate)
	fmt.Printf("Years:             %15.0f\n", years)
	fmt.Printf("Compounding:       %15s\n", freqLabel)
	if contribute > 0 {
		fmt.Printf("Contribution:      %15.2f %s\n", contribute, periodLabel)
	}
	fmt.Println()

	rows := yearBreakdown(principal, rate, years, contribute, n)
	fmt.Printf("%-6s %14s %14s %14s\n", "Year", "Deposits", "Interest", "Balance")
	fmt.Println("------   ------------   ------------   ------------")
	for _, r := range rows {
		fmt.Printf("%-6d %14.2f %14.2f %14.2f\n", r.Year, r.Deposits, r.Interest, r.Balance)
	}
	fmt.Println()

	fmt.Printf("%-6s %14.2f %14.2f %14.2f\n", "Total", totalDeposits, totalInterest, fv)

	return nil
}
