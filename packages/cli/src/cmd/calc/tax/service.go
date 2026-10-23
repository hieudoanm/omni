package tax

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"math"
	"os"
	"strings"
)

type Period string
type SalaryMode string

const (
	Monthly Period = "monthly"
	Annual  Period = "annual"

	Gross SalaryMode = "gross"
	Net   SalaryMode = "net"
)

type TaxBracket struct {
	Limit float64
	Rate  float64
}

type TaxBreakdown struct {
	Rate    float64
	Taxable float64
	Tax     float64
}

const (
	PersonalDeduction  = 11_000_000
	DependentDeduction = 4_400_000
	InsuranceCap       = 36_000_000
)

var employeeInsurance = map[string]float64{
	"BHXH": 0.08,
	"BHYT": 0.015,
	"BHTN": 0.01,
}

var taxBrackets = []TaxBracket{
	{5_000_000, 0.05},
	{5_000_000, 0.10},
	{8_000_000, 0.15},
	{14_000_000, 0.20},
	{20_000_000, 0.25},
	{28_000_000, 0.30},
	{1e18, 0.35},
}

func toMonthly(v float64, p Period) float64 {
	if p == Annual {
		return v / 12
	}
	return v
}

func sumRates(r map[string]float64) float64 {
	s := 0.0
	for _, v := range r {
		s += v
	}
	return s
}

func clampInsuranceBase(gross float64, enabled bool) float64 {
	if !enabled {
		return 0
	}
	if gross > InsuranceCap {
		return InsuranceCap
	}
	return gross
}

func calculateTax(taxable float64) ([]TaxBreakdown, float64) {
	var out []TaxBreakdown
	remain := taxable
	total := 0.0

	for _, b := range taxBrackets {
		if remain <= 0 {
			break
		}
		apply := math.Min(b.Limit, remain)
		tax := apply * b.Rate
		out = append(out, TaxBreakdown{b.Rate, apply, tax})
		total += tax
		remain -= apply
	}
	return out, total
}

func solveGrossFromNet(targetNet float64, dependents int, insurance bool) float64 {
	gross := targetNet
	for i := 0; i < 20; i++ {
		base := clampInsuranceBase(gross, insurance)
		ins := base * sumRates(employeeInsurance)
		deductions := PersonalDeduction + float64(dependents)*DependentDeduction + ins
		taxable := math.Max(0, gross-deductions)
		_, tax := calculateTax(taxable)
		net := gross - ins - tax
		gross += targetNet - net
	}
	return gross
}

func runTax(mode, period string, income float64, dependents int, insurance, jsonOut, csvOut bool) error {
	switch strings.ToLower(mode) {
	case "gross", "":
		mode = "gross"
	case "net":
	default:
		return fmt.Errorf("invalid mode: %q (use gross or net)", mode)
	}

	switch strings.ToLower(period) {
	case "monthly", "":
		period = "monthly"
	case "annual":
	default:
		return fmt.Errorf("invalid period: %q (use monthly or annual)", period)
	}

	var sm SalaryMode = Gross
	if mode == "net" {
		sm = Net
	}
	var p Period = Monthly
	if period == "annual" {
		p = Annual
	}

	if income <= 0 {
		return fmt.Errorf("--income must be greater than 0")
	}

	var gross float64
	if sm == Gross {
		gross = toMonthly(income, p)
	} else {
		gross = solveGrossFromNet(income, dependents, insurance)
	}

	base := clampInsuranceBase(gross, insurance)
	empIns := base * sumRates(employeeInsurance)

	deductions := PersonalDeduction + float64(dependents)*DependentDeduction + empIns
	taxable := math.Max(0, gross-deductions)
	breakdown, tax := calculateTax(taxable)
	net := gross - empIns - tax

	if jsonOut {
		result := map[string]interface{}{
			"gross":      gross,
			"net":        net,
			"tax":        tax,
			"insurance":  empIns,
			"dependents": dependents,
			"deductions": deductions,
			"taxable":    taxable,
			"breakdown":  breakdown,
			"mode":       mode,
			"period":     period,
		}
		b, _ := json.MarshalIndent(result, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	if csvOut {
		file, err := os.Create("pit-vietnam.csv")
		if err != nil {
			return err
		}
		defer file.Close()

		w := csv.NewWriter(file)
		defer w.Flush()

		w.WriteAll([][]string{
			{"Gross", fmt.Sprintf("%.0f", gross)},
			{"Net", fmt.Sprintf("%.0f", net)},
			{"Tax", fmt.Sprintf("%.0f", tax)},
			{"Insurance", fmt.Sprintf("%.0f", empIns)},
			{"Dependents", fmt.Sprintf("%d", dependents)},
			{"Deductions", fmt.Sprintf("%.0f", deductions)},
			{"Taxable Income", fmt.Sprintf("%.0f", taxable)},
		})
		fmt.Printf("Exported to pit-vietnam.csv\n")
		return nil
	}

	fmt.Printf("Gross: %.0f VND\n", gross)
	fmt.Printf("Net:   %.0f VND\n", net)
	fmt.Printf("Tax:   %.0f VND\n\n", tax)

	fmt.Println("Breakdown:")
	for _, b := range breakdown {
		fmt.Printf("  %.0f%%  →  %.0f VND\n", b.Rate*100, b.Tax)
	}

	return nil
}
