package internal

import "testing"

func TestFetchCrossref(t *testing.T) {
	data, err := FetchCrossref("10.1038/nature12373")
	if err != nil {
		t.Skipf("skipping network-dependent test: %v", err)
	}
	if data.Status != "ok" {
		t.Errorf("expected status %q, got %q", "ok", data.Status)
	}
	if len(data.Message.Authors) == 0 {
		t.Error("expected at least one author")
	}
}

func TestFetchCrossref_InvalidDOI(t *testing.T) {
	_, err := FetchCrossref("not-a-valid-doi-12345")
	if err == nil {
		t.Error("expected error for invalid DOI")
	}
}
