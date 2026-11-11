package thumbnails

import (
	"strings"
	"testing"
)

func Test_ytThumbURL(t *testing.T) {
	want := "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
	got := ytThumbURL("dQw4w9WgXcQ", "hqdefault")
	if got != want {
		t.Errorf("ytThumbURL() = %q, want %q", got, want)
	}
}

func Test_ytValidQualityIDs(t *testing.T) {
	got := ytValidQualityIDs()
	if got == "" {
		t.Fatal("ytValidQualityIDs() returned empty string")
	}
	parts := strings.Split(got, ", ")
	for _, q := range ytQualities {
		var found bool
		for _, p := range parts {
			if p == q.id {
				found = true
				break
			}
		}
		if !found {
			t.Errorf("expected quality ID %q not found in output %q", q.id, got)
		}
	}
}

func Test_ytQualities_Expected(t *testing.T) {
	if len(ytQualities) == 0 {
		t.Fatal("ytQualities is empty")
	}
	expected := map[string]string{
		"maxresdefault": "1280×720",
		"sddefault":     "640×480",
		"hqdefault":     "480×360",
		"mqdefault":     "320×180",
		"default":       "120×90",
		"0":             "480×360",
		"1":             "120×90",
		"2":             "120×90",
		"3":             "120×90",
	}
	for _, q := range ytQualities {
		res, ok := expected[q.id]
		if !ok {
			t.Errorf("unexpected quality id %q", q.id)
			continue
		}
		if q.resolution != res {
			t.Errorf("quality %q: expected resolution %q, got %q", q.id, res, q.resolution)
		}
	}
}
