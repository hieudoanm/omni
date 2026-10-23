package internal

import "testing"

func TestLookup_Exists(t *testing.T) {
	hex, ok := Lookup("garnet sunrise")
	if !ok {
		t.Fatal("expected garnet sunrise to be found")
	}
	if hex != "#D3045D" {
		t.Errorf("got hex %q, want %q", hex, "#D3045D")
	}
}

func TestLookup_CaseInsensitive(t *testing.T) {
	hex, ok := Lookup("GARNET SUNRISE")
	if !ok {
		t.Fatal("expected GARNET SUNRISE to be found")
	}
	if hex != "#D3045D" {
		t.Errorf("got hex %q, want %q", hex, "#D3045D")
	}
}

func TestLookup_NotFound(t *testing.T) {
	_, ok := Lookup("nonexistent")
	if ok {
		t.Error("expected nonexistent color not to be found")
	}
}

func TestLookup_MultiWord(t *testing.T) {
	hex, ok := Lookup("garnet sunrise")
	if !ok {
		t.Fatal("expected garnet sunrise to be found")
	}
	if hex != "#D3045D" {
		t.Errorf("got hex %q, want %q", hex, "#D3045D")
	}
}

func TestLookup_SubColor(t *testing.T) {
	hex, ok := Lookup("garnet sunrise 3")
	if !ok {
		t.Fatal("expected garnet sunrise 3 to be found")
	}
	if hex != "#740C08" {
		t.Errorf("got hex %q, want %q", hex, "#740C08")
	}
}

func TestAll_NonEmpty(t *testing.T) {
	colors := All()
	if len(colors) < 700 {
		t.Errorf("expected at least 700 colors, got %d", len(colors))
	}
}

func TestFindExactName(t *testing.T) {
	if got := FindExactName("garnet sunrise"); got != "Garnet Sunrise" {
		t.Errorf("FindExactName = %q, want %q", got, "Garnet Sunrise")
	}
	if got := FindExactName("ROYAL GEMSTONE DUSK"); got != "Royal Gemstone Dusk" {
		t.Errorf("FindExactName = %q, want %q", got, "Royal Gemstone Dusk")
	}
	if got := FindExactName("nonexistent"); got != "nonexistent" {
		t.Errorf("FindExactName = %q, want %q", got, "nonexistent")
	}
}

func TestPalettes_NonEmpty(t *testing.T) {
	p := Palettes()
	if len(p) == 0 {
		t.Error("expected non-empty palettes")
	}
}

func TestPaletteNames_Count(t *testing.T) {
	names := PaletteNames()
	if len(names) < 140 {
		t.Errorf("expected at least 140 palettes, got %d", len(names))
	}
}

func TestFindPalettesByHex(t *testing.T) {
	pals := FindPalettesByHex("#D3045D")
	if len(pals) == 0 {
		t.Fatal("expected garnet sunrise to contain #D3045D")
	}
	if pals[0] != "Garnet Sunrise" {
		t.Errorf("got %q, want %q", pals[0], "Garnet Sunrise")
	}
}

func TestFindPalettesByHex_NoHash(t *testing.T) {
	pals := FindPalettesByHex("D3045D")
	if len(pals) == 0 {
		t.Fatal("expected garnet sunrise to contain D3045D")
	}
}
