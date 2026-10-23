package transcript

import (
	"strings"
	"testing"
)

func TestSelectTrack_PrefersManual(t *testing.T) {
	tracks := []CaptionTrack{
		{LanguageCode: "en", Kind: "asr"},
		{LanguageCode: "en", Kind: "manual"},
	}
	sel := selectTrack(tracks, "en")
	if sel == nil {
		t.Fatal("selectTrack returned nil")
	}
	if sel.Kind != "manual" {
		t.Errorf("expected manual, got %s", sel.Kind)
	}
}

func TestSelectTrack_FallsBackToASR(t *testing.T) {
	tracks := []CaptionTrack{
		{LanguageCode: "en", Kind: "asr"},
	}
	sel := selectTrack(tracks, "en")
	if sel == nil {
		t.Fatal("selectTrack returned nil")
	}
	if sel.Kind != "asr" {
		t.Errorf("expected asr, got %s", sel.Kind)
	}
}

func TestSelectTrack_NoMatch(t *testing.T) {
	tracks := []CaptionTrack{
		{LanguageCode: "es", Kind: "manual"},
	}
	sel := selectTrack(tracks, "en")
	if sel != nil {
		t.Errorf("expected nil for no match, got %+v", sel)
	}
}

func TestSelectTrack_EmptyTracks(t *testing.T) {
	sel := selectTrack(nil, "en")
	if sel != nil {
		t.Errorf("expected nil for empty tracks, got %+v", sel)
	}
}

func TestAvailableLangs(t *testing.T) {
	tracks := []CaptionTrack{
		{LanguageCode: "en"},
		{LanguageCode: "es"},
		{LanguageCode: "en"},
	}
	langs := availableLangs(tracks)
	if !strings.Contains(langs, "en") || !strings.Contains(langs, "es") {
		t.Errorf("availableLangs = %q, want both 'en' and 'es'", langs)
	}
}

func TestAvailableLangs_Empty(t *testing.T) {
	langs := availableLangs(nil)
	if langs != "" {
		t.Errorf("expected empty string, got %q", langs)
	}
}

func TestParseCaptionTracks(t *testing.T) {
	jsonData := `{
		"captions": {
			"playerCaptionsTracklistRenderer": {
				"captionTracks": [
					{
						"baseUrl": "https://example.com/caption?lang=en",
						"languageCode": "en",
						"kind": "manual",
						"isTranslatable": true
					}
				]
			}
		}
	}`

	tracks, err := parseCaptionTracks(strings.NewReader(jsonData))
	if err != nil {
		t.Fatal(err)
	}
	if len(tracks) != 1 {
		t.Fatalf("expected 1 track, got %d", len(tracks))
	}
	if tracks[0].LanguageCode != "en" {
		t.Errorf("LanguageCode = %q, want 'en'", tracks[0].LanguageCode)
	}
}

func TestParseCaptionTracks_UnescapeBaseURL(t *testing.T) {
	jsonData := `{
		"captions": {
			"playerCaptionsTracklistRenderer": {
				"captionTracks": [
					{
						"baseUrl": "https://example.com/caption?fmt=srv3&amp;lang=en",
						"languageCode": "en",
						"kind": "manual",
						"isTranslatable": true
					}
				]
			}
		}
	}`

	tracks, err := parseCaptionTracks(strings.NewReader(jsonData))
	if err != nil {
		t.Fatal(err)
	}
	if len(tracks) != 1 {
		t.Fatalf("expected 1 track, got %d", len(tracks))
	}
	if !strings.Contains(tracks[0].BaseURL, "&lang=") {
		t.Errorf("BaseURL should be unescaped: %q", tracks[0].BaseURL)
	}
	if strings.Contains(tracks[0].BaseURL, "&amp;") {
		t.Errorf("BaseURL should not contain &amp;: %q", tracks[0].BaseURL)
	}
}

func TestParseCaptionTracks_NoCaptions(t *testing.T) {
	jsonData := `{"captions": {}}`
	_, err := parseCaptionTracks(strings.NewReader(jsonData))
	if err != nil {
		t.Fatal(err)
	}
}
