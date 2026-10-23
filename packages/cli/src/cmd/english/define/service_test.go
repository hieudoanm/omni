package define

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"os"
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

func mockFetch(body []byte, err error) fetchFunc {
	return func(url string, opts requests.Options) ([]byte, error) {
		return body, err
	}
}

func TestWordJSONUnmarshal(t *testing.T) {
	input := `{
		"word": "hello",
		"results": [
			{
				"definition": "used as a greeting",
				"partOfSpeech": "interjection",
				"synonyms": ["hi", "hey"],
				"anonyms": ["goodbye"],
				"usageOf": ["greeting"],
				"typeOf": ["greeting"]
			}
		]
	}`
	var w Word
	if err := json.Unmarshal([]byte(input), &w); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}
	if w.Word != "hello" {
		t.Errorf("Word = %q, want %q", w.Word, "hello")
	}
	if len(w.Results) != 1 {
		t.Fatalf("expected 1 result, got %d", len(w.Results))
	}
	r := w.Results[0]
	if r.Definition != "used as a greeting" {
		t.Errorf("Definition = %q", r.Definition)
	}
	if r.PartOfSpeech != "interjection" {
		t.Errorf("PartOfSpeech = %q", r.PartOfSpeech)
	}
	if len(r.Synonyms) != 2 || r.Synonyms[0] != "hi" {
		t.Errorf("Synonyms = %v", r.Synonyms)
	}
	if len(r.Anonyms) != 1 || r.Anonyms[0] != "goodbye" {
		t.Errorf("Anonyms = %v", r.Anonyms)
	}
}

func TestLookupWord_Success(t *testing.T) {
	body := `{"word":"hello","results":[{"definition":"used as a greeting","partOfSpeech":"interjection"}]}`
	fetch := mockFetch([]byte(body), nil)
	data, err := lookupWord("hello", fetch)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if data.Word != "hello" {
		t.Errorf("Word = %q, want %q", data.Word, "hello")
	}
	if len(data.Results) != 1 {
		t.Fatalf("expected 1 result, got %d", len(data.Results))
	}
}

func TestLookupWord_FetchError(t *testing.T) {
	fetch := mockFetch(nil, errors.New("network error"))
	_, err := lookupWord("hello", fetch)
	if err == nil {
		t.Fatal("expected error")
	}
	if !strings.Contains(err.Error(), "fetch error") {
		t.Errorf("error = %q, want 'fetch error'", err)
	}
	if !strings.Contains(err.Error(), "network error") {
		t.Errorf("error = %q, want wrapped 'network error'", err)
	}
}

func TestLookupWord_BadJSON(t *testing.T) {
	fetch := mockFetch([]byte(`{bad json}`), nil)
	_, err := lookupWord("hello", fetch)
	if err == nil {
		t.Fatal("expected error")
	}
	if !strings.Contains(err.Error(), "json error") {
		t.Errorf("error = %q, want 'json error'", err)
	}
}

func TestFormatDefinition_Text(t *testing.T) {
	data := &Word{
		Word: "hello",
		Results: []Result{
			{
				Definition:   "used as a greeting",
				PartOfSpeech: "interjection",
				Synonyms:     []string{"hi", "hey"},
				Anonyms:      []string{"goodbye"},
			},
		},
	}
	out := formatDefinition(data, false)
	if !strings.Contains(out, "WORD: hello") {
		t.Errorf("output missing WORD, got:\n%s", out)
	}
	if !strings.Contains(out, "1) interjection") {
		t.Errorf("output missing part of speech, got:\n%s", out)
	}
	if !strings.Contains(out, "Definition: used as a greeting") {
		t.Errorf("output missing definition, got:\n%s", out)
	}
	if !strings.Contains(out, "Synonyms: hi, hey") {
		t.Errorf("output missing synonyms, got:\n%s", out)
	}
	if !strings.Contains(out, "Antonyms: goodbye") {
		t.Errorf("output missing antonyms, got:\n%s", out)
	}
}

func TestFormatDefinition_TextNoSynonyms(t *testing.T) {
	data := &Word{
		Word: "test",
		Results: []Result{
			{
				Definition:   "a procedure",
				PartOfSpeech: "noun",
				Synonyms:     nil,
				Anonyms:      nil,
			},
		},
	}
	out := formatDefinition(data, false)
	if !strings.Contains(out, "WORD: test") {
		t.Errorf("output missing WORD, got:\n%s", out)
	}
	if strings.Contains(out, "Synonyms:") {
		t.Errorf("output should not contain Synonyms, got:\n%s", out)
	}
	if strings.Contains(out, "Antonyms:") {
		t.Errorf("output should not contain Antonyms, got:\n%s", out)
	}
}

func TestFormatDefinition_TextMultipleResults(t *testing.T) {
	data := &Word{
		Word: "lead",
		Results: []Result{
			{
				Definition:   "to guide",
				PartOfSpeech: "verb",
				Synonyms:     []string{"guide", "direct"},
			},
			{
				Definition:   "a soft metal",
				PartOfSpeech: "noun",
				Synonyms:     []string{"metal"},
			},
		},
	}
	out := formatDefinition(data, false)
	if !strings.Contains(out, "1) verb") {
		t.Errorf("output missing first result, got:\n%s", out)
	}
	if !strings.Contains(out, "2) noun") {
		t.Errorf("output missing second result, got:\n%s", out)
	}
	if !strings.Contains(out, "Definition: to guide") {
		t.Errorf("output missing first definition, got:\n%s", out)
	}
	if !strings.Contains(out, "Definition: a soft metal") {
		t.Errorf("output missing second definition, got:\n%s", out)
	}
}

func TestFormatDefinition_JSON(t *testing.T) {
	data := &Word{
		Word: "hello",
		Results: []Result{
			{
				Definition:   "used as a greeting",
				PartOfSpeech: "interjection",
				Synonyms:     []string{"hi"},
			},
		},
	}
	out := formatDefinition(data, true)
	var parsed Word
	if err := json.Unmarshal([]byte(out), &parsed); err != nil {
		t.Fatalf("formatDefinition produced invalid JSON: %v\noutput: %s", err, out)
	}
	if parsed.Word != "hello" {
		t.Errorf("Word = %q, want %q", parsed.Word, "hello")
	}
	if len(parsed.Results) != 1 {
		t.Errorf("expected 1 result, got %d", len(parsed.Results))
	}
}

func captureOutput(fn func()) string {
	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w
	fn()
	w.Close()
	var buf bytes.Buffer
	io.Copy(&buf, r)
	os.Stdout = old
	return strings.TrimRight(buf.String(), "\n")
}
