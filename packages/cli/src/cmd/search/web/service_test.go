package web

import (
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/search/shared"
)

func TestParseDuckDuckGoResults(t *testing.T) {
	html := `<html>
<body>
<table>
<tr>
<td><a class="result-link" href="https://example.com">Example Title</a></td>
</tr>
<tr>
<td class="result-snippet">This is an example snippet</td>
</tr>
<tr>
<td><a class="result-link" href="https://golang.org">The Go Language</a></td>
</tr>
<tr>
<td class="result-snippet">Go is a programming language</td>
</tr>
</table>
</body>
</html>`

	results := parseDuckDuckGoResults(html, 5)
	if len(results) != 2 {
		t.Fatalf("got %d results, want 2", len(results))
	}

	if results[0].Title != "Example Title" {
		t.Errorf("title = %q, want %q", results[0].Title, "Example Title")
	}
	if results[0].URL != "https://example.com" {
		t.Errorf("url = %q, want %q", results[0].URL, "https://example.com")
	}
	if results[0].Snippet != "This is an example snippet" {
		t.Errorf("snippet = %q", results[0].Snippet)
	}

	if results[1].Title != "The Go Language" {
		t.Errorf("title = %q", results[1].Title)
	}
}

func TestParseDuckDuckGoResultsMax(t *testing.T) {
	html := `<a class="result-link" href="https://a.com">A</a><a class="result-link" href="https://b.com">B</a><a class="result-link" href="https://c.com">C</a>`
	results := parseDuckDuckGoResults(html, 2)
	if len(results) != 2 {
		t.Errorf("got %d results, want 2", len(results))
	}
}

func TestParseDuckDuckGoResultsRelativeURL(t *testing.T) {
	html := `<a class="result-link" href="//relative.com/path">Relative</a>`
	results := parseDuckDuckGoResults(html, 5)
	if len(results) == 0 {
		t.Fatal("expected results")
	}
	if results[0].URL != "https://relative.com/path" {
		t.Errorf("url = %q, want https://relative.com/path", results[0].URL)
	}
}

func TestParseDuckDuckGoResultsBareURL(t *testing.T) {
	html := `<a class="result-link" href="example.com/path">Title</a>`
	results := parseDuckDuckGoResults(html, 5)
	if len(results) == 0 {
		t.Fatal("expected results")
	}
	if results[0].URL != "https://example.com/path" {
		t.Errorf("url = %q, want https://example.com/path", results[0].URL)
	}
}

func TestParseDuckDuckGoResultsNoResults(t *testing.T) {
	results := parseDuckDuckGoResults("<html><body>No results found</body></html>", 5)
	if len(results) != 0 {
		t.Errorf("got %d results, want 0", len(results))
	}
}

func TestOutputWebResultsText(t *testing.T) {
	results := []webResult{
		{Title: "Example", URL: "https://example.com", Snippet: "An example site"},
	}
	output := shared.CaptureOutput(func() {
		if err := outputWebResults(results, "test query", false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "Example") {
		t.Errorf("expected title in output, got: %s", output)
	}
	if !strings.Contains(output, "https://example.com") {
		t.Errorf("expected URL in output, got: %s", output)
	}
	if !strings.Contains(output, "An example site") {
		t.Errorf("expected snippet in output, got: %s", output)
	}
	if !strings.Contains(output, "1 results from DuckDuckGo") {
		t.Errorf("expected count, got: %s", output)
	}
}

func TestOutputWebResultsJSON(t *testing.T) {
	results := []webResult{
		{Title: "Example", URL: "https://example.com", Snippet: "An example"},
	}
	output := shared.CaptureOutput(func() {
		if err := outputWebResults(results, "test query", true); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, `"query": "test query"`) {
		t.Errorf("expected query in JSON, got: %s", output)
	}
	if !strings.Contains(output, `"count": 1`) {
		t.Errorf("expected count 1, got: %s", output)
	}
}

func TestOutputWebResultsEmpty(t *testing.T) {
	output := shared.CaptureOutput(func() {
		if err := outputWebResults(nil, "test", false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "no results") {
		t.Errorf("expected 'no results', got: %s", output)
	}
}

func TestOutputWebResultsEmptySnippet(t *testing.T) {
	results := []webResult{
		{Title: "No Snippet", URL: "https://example.com"},
	}
	output := shared.CaptureOutput(func() {
		if err := outputWebResults(results, "test", false); err != nil {
			t.Fatal(err)
		}
	})
	if !strings.Contains(output, "No Snippet") {
		t.Errorf("expected title, got: %s", output)
	}
}
