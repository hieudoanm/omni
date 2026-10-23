package recall

import (
	"testing"
)

func TestMaxDigits(t *testing.T) {
	if maxDigits <= 0 {
		t.Errorf("maxDigits = %d, want > 0", maxDigits)
	}
}
