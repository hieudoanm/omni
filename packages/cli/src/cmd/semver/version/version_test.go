package version

import (
	"testing"
)

func TestParse(t *testing.T) {
	v, err := Parse("1.2.3")
	if err != nil {
		t.Fatal(err)
	}
	if v.Major != 1 || v.Minor != 2 || v.Patch != 3 {
		t.Errorf("parsed 1.2.3 = %+v", v)
	}
}

func TestParseWithPrefix(t *testing.T) {
	v, err := Parse("v2.0.0")
	if err != nil {
		t.Fatal(err)
	}
	if v.Major != 2 {
		t.Errorf("v2.0.0 major = %d", v.Major)
	}
}

func TestParseInvalid(t *testing.T) {
	_, err := Parse("1.2")
	if err == nil {
		t.Error("expected error for '1.2'")
	}
}

func TestParseWithPrerelease(t *testing.T) {
	v, err := Parse("1.2.3-beta.1")
	if err != nil {
		t.Fatal(err)
	}
	if v.Prerelease != "beta.1" {
		t.Errorf("prerelease = %q, want %q", v.Prerelease, "beta.1")
	}
	if v.Major != 1 || v.Minor != 2 || v.Patch != 3 {
		t.Errorf("v = %+v", v)
	}
}

func TestParseInvalidMajor(t *testing.T) {
	_, err := Parse("abc.2.3")
	if err == nil {
		t.Error("expected error for invalid major")
	}
}

func TestParseInvalidMinor(t *testing.T) {
	_, err := Parse("1.abc.3")
	if err == nil {
		t.Error("expected error for invalid minor")
	}
}

func TestParseInvalidPatch(t *testing.T) {
	_, err := Parse("1.2.abc")
	if err == nil {
		t.Error("expected error for invalid patch")
	}
}

func TestParseEmpty(t *testing.T) {
	_, err := Parse("")
	if err == nil {
		t.Error("expected error for empty string")
	}
}

func TestParseOnlyMajor(t *testing.T) {
	_, err := Parse("1")
	if err == nil {
		t.Error("expected error for '1'")
	}
}

func TestCompare(t *testing.T) {
	a := Version{1, 0, 0, ""}
	b := Version{2, 0, 0, ""}
	if a.Compare(b) >= 0 {
		t.Error("1.0.0 should be < 2.0.0")
	}
	if b.Compare(a) <= 0 {
		t.Error("2.0.0 should be > 1.0.0")
	}
	if a.Compare(a) != 0 {
		t.Error("1.0.0 should == 1.0.0")
	}
}

func TestBumpMajor(t *testing.T) {
	v := Version{1, 2, 3, "alpha"}
	got := v.Bump("major")
	want := Version{2, 0, 0, ""}
	if got != want {
		t.Errorf("Bump(major) = %+v, want %+v", got, want)
	}
}

func TestBumpMinor(t *testing.T) {
	v := Version{1, 2, 3, ""}
	got := v.Bump("minor")
	want := Version{1, 3, 0, ""}
	if got != want {
		t.Errorf("Bump(minor) = %+v, want %+v", got, want)
	}
}

func TestBumpPatch(t *testing.T) {
	v := Version{1, 2, 3, ""}
	got := v.Bump("patch")
	want := Version{1, 2, 4, ""}
	if got != want {
		t.Errorf("Bump(patch) = %+v, want %+v", got, want)
	}
}

func TestBumpUnknown(t *testing.T) {
	v := Version{1, 2, 3, ""}
	got := v.Bump("unknown")
	if got != v {
		t.Errorf("Bump(unknown) = %+v, want %+v", got, v)
	}
}

func TestCheckRange(t *testing.T) {
	base := Version{1, 5, 0, ""}
	tests := []struct {
		name      string
		rangeExpr string
		want      bool
		wantErr   bool
	}{
		{">", "> 1.0.0", true, false},
		{"> negative", "> 2.0.0", false, false},
		{">=", ">= 1.5.0", true, false},
		{">= higher", ">= 2.0.0", false, false},
		{"<", "< 2.0.0", true, false},
		{"< lower", "< 1.0.0", false, false},
		{"<=", "<= 1.5.0", true, false},
		{"<= lower", "<= 1.0.0", false, false},
		{"=", "= 1.5.0", true, false},
		{"= wrong", "= 2.0.0", false, false},
		{"==", "== 1.5.0", true, false},
		{"compound match", ">= 1.0.0 < 2.0.0", true, false},
		{"compound no match", ">= 2.0.0 < 3.0.0", false, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := CheckRange(base, tt.rangeExpr)
			if (err != nil) != tt.wantErr {
				t.Errorf("CheckRange(%q) error = %v, wantErr %v", tt.rangeExpr, err, tt.wantErr)
			}
			if got != tt.want {
				t.Errorf("CheckRange(%q) = %v, want %v", tt.rangeExpr, got, tt.want)
			}
		})
	}
}

func TestCheckRangeEmpty(t *testing.T) {
	_, err := CheckRange(Version{}, "")
	if err == nil {
		t.Error("expected error for empty range")
	}
}

func TestCheckRangeIncomplete(t *testing.T) {
	_, err := CheckRange(Version{}, ">=")
	if err == nil {
		t.Error("expected error for incomplete range")
	}
}

func TestCheckRangeInvalidVersion(t *testing.T) {
	_, err := CheckRange(Version{}, "> abc")
	if err == nil {
		t.Error("expected error for invalid version in range")
	}
}

func TestCheckRangeUnknownOperator(t *testing.T) {
	_, err := CheckRange(Version{}, "~ 1.0.0")
	if err == nil {
		t.Error("expected error for unknown operator")
	}
}

func TestCheckRangePrerelease(t *testing.T) {
	v := Version{1, 0, 0, "alpha"}
	got, err := CheckRange(v, "> 1.0.0")
	if err != nil {
		t.Fatal(err)
	}
	if got {
		t.Error("1.0.0-alpha should not be > 1.0.0")
	}
}
