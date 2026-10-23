package internal

import (
	"bytes"
	"io"
	"os"
	"strings"
	"testing"
)

func TestPrintCitation(t *testing.T) {
	tests := []struct {
		name     string
		authors  []Author
		year     int
		expected string
	}{
		{
			name:     "One author",
			authors:  []Author{{Family: "Smith", Given: "John"}},
			year:     2020,
			expected: "(Smith, 2020)",
		},
		{
			name:     "Two authors",
			authors:  []Author{{Family: "Smith", Given: "John"}, {Family: "Doe", Given: "Jane"}},
			year:     2021,
			expected: "(Smith & Doe, 2021)",
		},
		{
			name:     "Three authors",
			authors:  []Author{{Family: "Smith", Given: "J"}, {Family: "Doe", Given: "J"}, {Family: "Brown", Given: "B"}},
			year:     2022,
			expected: "(Smith et al., 2022)",
		},
		{
			name:     "No authors",
			authors:  []Author{},
			year:     2023,
			expected: "(Unknown, 2023)",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			data := CrossRefData{
				Message: Message{
					Authors: tt.authors,
				},
			}
			data.Message.PublishedPrint.DateParts = [][]int{{tt.year}}

			old := os.Stdout
			r, w, _ := os.Pipe()
			os.Stdout = w

			PrintCitation(data)

			w.Close()
			os.Stdout = old
			var buf bytes.Buffer
			io.Copy(&buf, r)
			output := buf.String()

			if !strings.Contains(output, tt.expected) {
				t.Errorf("Expected citation %s, got %s", tt.expected, output)
			}
		})
	}
}

func TestPrintReference(t *testing.T) {
	data := CrossRefData{
		Message: Message{
			Authors:        []Author{{Family: "Smith", Given: "John"}, {Family: "Doe", Given: "Jane"}},
			Title:          []string{"My Great Paper"},
			ContainerTitle: []string{"Journal of AI"},
			Volume:         "10",
			Issue:          "2",
			Page:           "100-110",
		},
	}
	data.Message.PublishedPrint.DateParts = [][]int{{2020}}

	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	PrintReference(data)

	w.Close()
	os.Stdout = old
	var buf bytes.Buffer
	io.Copy(&buf, r)
	output := buf.String()

	expected := "Smith, J. & Doe, J. (2020). My Great Paper. Journal of AI, 10(2), 100-110."
	if !strings.Contains(output, expected) {
		t.Errorf("Expected reference %s, got %s", expected, output)
	}
}

func TestPrintReference_EdgeCases(t *testing.T) {
	tests := []struct {
		name     string
		data     CrossRefData
		expected string
	}{
		{
			name: "no year",
			data: CrossRefData{
				Message: Message{
					Authors: []Author{{Family: "Smith", Given: "John"}},
					Title:   []string{"Paper"},
				},
			},
			expected: "n.d.",
		},
		{
			name: "no authors",
			data: CrossRefData{
				Message: Message{
					Title:          []string{"Paper"},
					ContainerTitle: []string{"Journal"},
					Volume:         "1",
					Issue:          "2",
					Page:           "10-20",
					PublishedPrint: struct {
						DateParts [][]int `json:"date-parts"`
					}{DateParts: [][]int{{2020}}},
				},
			},
			expected: "(2020). Paper. Journal, 1(2), 10-20.",
		},
		{
			name: "no title or container",
			data: CrossRefData{
				Message: Message{
					Authors: []Author{{Family: "Smith", Given: "John"}},
					Volume:  "1",
					Page:    "5",
					PublishedPrint: struct {
						DateParts [][]int `json:"date-parts"`
					}{DateParts: [][]int{{2021}}},
				},
			},
			expected: "2021",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			old := os.Stdout
			r, w, _ := os.Pipe()
			os.Stdout = w

			PrintReference(tt.data)

			w.Close()
			os.Stdout = old
			var buf bytes.Buffer
			io.Copy(&buf, r)
			output := buf.String()

			if !strings.Contains(output, tt.expected) {
				t.Errorf("expected %q in output, got %q", tt.expected, output)
			}
		})
	}
}
