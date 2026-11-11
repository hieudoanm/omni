package internal

import (
	"math"
	"testing"
)

func TestCalcPayment_zeroRate(t *testing.T) {
	got := CalcPayment(120000, 0, 10)
	want := 120000.0 / (10 * 12)
	if math.Abs(got-want) > 0.01 {
		t.Errorf("CalcPayment(120000, 0, 10) = %.2f, want %.2f", got, want)
	}
}

func TestCalcPayment_typical(t *testing.T) {
	got := CalcPayment(200000, 6.5, 30)
	// Expected: ~1264.14 for $200k at 6.5% for 30 years
	if got < 1200 || got > 1300 {
		t.Errorf("CalcPayment(200000, 6.5, 30) = %.2f, want ~1264", got)
	}
}

func TestCalcPayment_smallPrincipal(t *testing.T) {
	got := CalcPayment(1000, 5.0, 1)
	if got <= 0 || got > 100 {
		t.Errorf("CalcPayment(1000, 5, 1) = %.2f, want reasonable monthly payment", got)
	}
}

func TestCalcPayment_highRate(t *testing.T) {
	got := CalcPayment(50000, 25.0, 5)
	if got <= 0 {
		t.Errorf("CalcPayment(50000, 25, 5) = %.2f, want positive", got)
	}
}

func TestCalcPayment_zeroPrincipal(t *testing.T) {
	got := CalcPayment(0, 5.0, 10)
	if got != 0 {
		t.Errorf("CalcPayment(0, 5, 10) = %.2f, want 0", got)
	}
}

func TestCalcPayment_zeroYears(t *testing.T) {
	got := CalcPayment(100000, 5.0, 0)
	if !math.IsInf(got, 0) {
		t.Errorf("CalcPayment(100000, 5, 0) = %.2f, want +Inf", got)
	}
}

func TestCalcPayment_precision(t *testing.T) {
	got := CalcPayment(100000, 3.5, 15)
	// $100k at 3.5% for 15 years = ~$714.94/mo
	if math.Abs(got-714.94) > 1.0 {
		t.Errorf("CalcPayment(100000, 3.5, 15) = %.2f, want ~714.94", got)
	}
}
