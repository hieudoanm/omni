package internal

import "math"

func CalcPayment(principal, annualRate, years float64) float64 {
	if annualRate == 0 {
		return principal / (years * 12)
	}
	r := annualRate / 100.0 / 12
	n := years * 12
	return principal * r * math.Pow(1+r, n) / (math.Pow(1+r, n) - 1)
}
