package transcript

import (
	"reflect"
	"testing"
)

func TestParseTimedText(t *testing.T) {
	xmlData := []byte(`
<timedtext>
  <body>
    <p t="1000" d="2000">Hello world</p>
    <p t="4000" d="1500">How are &lt;you&gt;?</p>
  </body>
</timedtext>`)

	expected := []Line{
		{Start: 1.0, Duration: 2.0, Text: "Hello world"},
		{Start: 4.0, Duration: 1.5, Text: "How are <you>?"},
	}

	lines, err := parseTimedText(xmlData)
	if err != nil {
		t.Fatalf("parseTimedText failed: %v", err)
	}

	if !reflect.DeepEqual(lines, expected) {
		t.Errorf("Result mismatch.\nGot: %+v\nExpected: %+v", lines, expected)
	}
}

func TestParseTimedText_Whitespace(t *testing.T) {
	xmlData := []byte(`
<timedtext>
  <body>
    <p t="0" d="1000">  Multiple    spaces   and 
newlines  </p>
  </body>
</timedtext>`)

	lines, _ := parseTimedText(xmlData)
	if lines[0].Text != "Multiple spaces and newlines" {
		t.Errorf("Whitespace handling failed: %q", lines[0].Text)
	}
}
