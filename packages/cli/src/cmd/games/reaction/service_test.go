package reaction

import (
	"testing"
)

func TestRoundsConstant(t *testing.T) {
	if rounds <= 0 {
		t.Errorf("rounds = %d, want > 0", rounds)
	}
}
