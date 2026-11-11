package typerace

import (
	"testing"
)

func TestPassagesNotEmpty(t *testing.T) {
	if len(passages) == 0 {
		t.Fatal("passages slice is empty")
	}
	for i, p := range passages {
		if p == "" {
			t.Errorf("passages[%d] is empty", i)
		}
	}
}
