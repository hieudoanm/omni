package unit

import (
	"math"
	"testing"
)

func TestFindUnit_exact(t *testing.T) {
	u := findUnit("mm")
	if u == nil {
		t.Fatal("findUnit('mm') returned nil")
	}
	if u.cat != "length" {
		t.Errorf("category = %q, want 'length'", u.cat)
	}
}

func TestFindUnit_alias(t *testing.T) {
	u := findUnit("meter")
	if u == nil {
		t.Fatal("findUnit('meter') returned nil")
	}
	if u.cat != "length" {
		t.Errorf("category = %q, want 'length'", u.cat)
	}
}

func TestFindUnit_caseInsensitive(t *testing.T) {
	u := findUnit("KG")
	if u == nil {
		t.Fatal("findUnit('KG') returned nil")
	}
	if u.cat != "weight" {
		t.Errorf("category = %q, want 'weight'", u.cat)
	}
}

func TestFindUnit_unknown(t *testing.T) {
	u := findUnit("nonexistent")
	if u != nil {
		t.Errorf("findUnit('nonexistent') = %v, want nil", u)
	}
}

func TestFindUnit_empty(t *testing.T) {
	u := findUnit("")
	if u != nil {
		t.Errorf("findUnit('') = %v, want nil", u)
	}
}

func TestFindUnit_allEntries(t *testing.T) {
	entries := []string{
		"mm", "cm", "m", "km", "in", "ft", "yd", "mi",
		"mg", "g", "kg", "t", "lb", "oz",
		"c", "f", "k",
		"m/s", "km/h", "mph", "kn",
	}
	for _, e := range entries {
		u := findUnit(e)
		if u == nil {
			t.Errorf("findUnit(%q) returned nil", e)
		}
	}
}

func TestConvertLength_mToCm(t *testing.T) {
	from := findUnit("m")
	to := findUnit("cm")
	if from == nil || to == nil {
		t.Fatal("could not find units")
	}
	inBase := from.toBase(2.5)
	got := to.fromBase(inBase)
	want := 250.0
	if math.Abs(got-want) > 0.001 {
		t.Errorf("convert 2.5m to cm = %.2f, want %.2f", got, want)
	}
}

func TestConvertLength_inToFt(t *testing.T) {
	from := findUnit("in")
	to := findUnit("ft")
	if from == nil || to == nil {
		t.Fatal("could not find units")
	}
	inBase := from.toBase(12)
	got := to.fromBase(inBase)
	want := 1.0
	if math.Abs(got-want) > 0.001 {
		t.Errorf("convert 12in to ft = %.2f, want %.2f", got, want)
	}
}

func TestConvertWeight_kgToLb(t *testing.T) {
	from := findUnit("kg")
	to := findUnit("lb")
	if from == nil || to == nil {
		t.Fatal("could not find units")
	}
	inBase := from.toBase(1)
	got := to.fromBase(inBase)
	want := 2.20462
	if math.Abs(got-want) > 0.01 {
		t.Errorf("convert 1kg to lb = %.4f, want %.4f", got, want)
	}
}

func TestConvertTemperature_cToF(t *testing.T) {
	from := findUnit("c")
	to := findUnit("f")
	if from == nil || to == nil {
		t.Fatal("could not find units")
	}
	inBase := from.toBase(100)
	got := to.fromBase(inBase)
	want := 212.0
	if math.Abs(got-want) > 0.01 {
		t.Errorf("convert 100C to F = %.2f, want %.2f", got, want)
	}
}

func TestConvertTemperature_fToC(t *testing.T) {
	from := findUnit("f")
	to := findUnit("c")
	if from == nil || to == nil {
		t.Fatal("could not find units")
	}
	inBase := from.toBase(32)
	got := to.fromBase(inBase)
	want := 0.0
	if math.Abs(got-want) > 0.01 {
		t.Errorf("convert 32F to C = %.2f, want %.2f", got, want)
	}
}

func TestConvertTemperature_cToK(t *testing.T) {
	from := findUnit("c")
	to := findUnit("k")
	if from == nil || to == nil {
		t.Fatal("could not find units")
	}
	inBase := from.toBase(0)
	got := to.fromBase(inBase)
	want := 273.15
	if math.Abs(got-want) > 0.01 {
		t.Errorf("convert 0C to K = %.2f, want %.2f", got, want)
	}
}

func TestConvertTemperature_kToC(t *testing.T) {
	from := findUnit("k")
	to := findUnit("c")
	if from == nil || to == nil {
		t.Fatal("could not find units")
	}
	inBase := from.toBase(273.15)
	got := to.fromBase(inBase)
	want := 0.0
	if math.Abs(got-want) > 0.01 {
		t.Errorf("convert 273.15K to C = %.2f, want %.2f", got, want)
	}
}

func TestConvertSpeed_kmhToMph(t *testing.T) {
	from := findUnit("km/h")
	to := findUnit("mph")
	if from == nil || to == nil {
		t.Fatal("could not find units")
	}
	inBase := from.toBase(100)
	got := to.fromBase(inBase)
	want := 62.1371
	if math.Abs(got-want) > 0.1 {
		t.Errorf("convert 100km/h to mph = %.4f, want %.4f", got, want)
	}
}

func TestConvertIdentity_sameUnit(t *testing.T) {
	u := findUnit("m")
	if u == nil {
		t.Fatal("findUnit('m') returned nil")
	}
	inBase := u.toBase(42)
	got := u.fromBase(inBase)
	if math.Abs(got-42) > 0.001 {
		t.Errorf("identity conversion of 42m = %.4f, want 42", got)
	}
}

func TestConvertRoundTrip(t *testing.T) {
	from := findUnit("mile")
	to := findUnit("km")
	if from == nil || to == nil {
		t.Fatal("could not find units")
	}
	original := 60.0
	inBase := from.toBase(original)
	converted := to.fromBase(inBase)
	backInBase := to.toBase(converted)
	back := from.fromBase(backInBase)
	if math.Abs(back-original) > 0.01 {
		t.Errorf("round trip 60 miles: got %.4f, want %.4f", back, original)
	}
}
