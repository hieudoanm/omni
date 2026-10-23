package csv

import (
	"os"
	"path/filepath"
	"testing"
)

func Test_parseTables_single(t *testing.T) {
	html := `<html><body><table>
<tr><th>Name</th><th>Age</th></tr>
<tr><td>Alice</td><td>30</td></tr>
<tr><td>Bob</td><td>25</td></tr>
</table></body></html>`

	tables, err := parseTables(html)
	if err != nil {
		t.Fatal(err)
	}
	if len(tables) != 1 {
		t.Fatalf("expected 1 table, got %d", len(tables))
	}
	rows := tables[0]
	if len(rows) != 3 {
		t.Fatalf("expected 3 rows, got %d", len(rows))
	}
	if rows[0][0] != "Name" || rows[0][1] != "Age" {
		t.Errorf("unexpected header: %v", rows[0])
	}
	if rows[1][0] != "Alice" || rows[1][1] != "30" {
		t.Errorf("unexpected row 1: %v", rows[1])
	}
	if rows[2][0] != "Bob" || rows[2][1] != "25" {
		t.Errorf("unexpected row 2: %v", rows[2])
	}
}

func Test_parseTables_multiple(t *testing.T) {
	html := `<html><body>
<table><tr><td>A1</td></tr></table>
<table><tr><td>B1</td></tr></table>
</body></html>`

	tables, err := parseTables(html)
	if err != nil {
		t.Fatal(err)
	}
	if len(tables) != 2 {
		t.Fatalf("expected 2 tables, got %d", len(tables))
	}
}

func Test_parseTables_empty(t *testing.T) {
	tables, err := parseTables("<html><body><p>no tables here</p></body></html>")
	if err != nil {
		t.Fatal(err)
	}
	if len(tables) != 0 {
		t.Fatalf("expected 0 tables, got %d", len(tables))
	}
}

func Test_parseTables_noTables(t *testing.T) {
	tables, err := parseTables("<html></html>")
	if err != nil {
		t.Fatal(err)
	}
	if len(tables) != 0 {
		t.Fatalf("expected 0 tables, got %d", len(tables))
	}
}

func Test_tablesToCSVFiles_single(t *testing.T) {
	dir := t.TempDir()
	tables := [][][]string{
		{{"Name", "Age"}, {"Alice", "30"}},
	}

	paths, err := tablesToCSVFiles(tables, "https://example.com/page", dir)
	if err != nil {
		t.Fatal(err)
	}
	if len(paths) != 1 {
		t.Fatalf("expected 1 file, got %d", len(paths))
	}

	data, err := os.ReadFile(paths[0])
	if err != nil {
		t.Fatal(err)
	}
	expected := "Name,Age\nAlice,30\n"
	if string(data) != expected {
		t.Errorf("expected %q, got %q", expected, string(data))
	}
}

func Test_tablesToCSVFiles_multiple(t *testing.T) {
	dir := t.TempDir()
	tables := [][][]string{
		{{"A"}},
		{{"B"}},
	}

	paths, err := tablesToCSVFiles(tables, "https://example.com/data", dir)
	if err != nil {
		t.Fatal(err)
	}
	if len(paths) != 2 {
		t.Fatalf("expected 2 files, got %d", len(paths))
	}

	for i, p := range paths {
		if _, err := os.ReadFile(p); err != nil {
			t.Fatal(err)
		}
		if filepath.Base(p) != "example_com-table-"+string(rune('0'+i))+".csv" {
			t.Errorf("unexpected filename: %s", filepath.Base(p))
		}
	}
}

func Test_tablesToCSVFiles_empty(t *testing.T) {
	dir := t.TempDir()
	paths, err := tablesToCSVFiles([][][]string{}, "https://example.com", dir)
	if err != nil {
		t.Fatal(err)
	}
	if len(paths) != 0 {
		t.Fatalf("expected 0 files, got %d", len(paths))
	}
}

func Test_extractText(t *testing.T) {
	html := "<td>Hello <b>World</b></td>"
	doc, _ := parseTables("<table><tr>" + html + "</tr></table>")
	if len(doc) == 0 || len(doc[0]) == 0 || len(doc[0][0]) == 0 {
		t.Fatal("expected parsed cell")
	}
	if doc[0][0][0] != "Hello World" {
		t.Errorf("expected 'Hello World', got %q", doc[0][0][0])
	}
}

func Test_tablesToCSVFiles_skipEmptyTable(t *testing.T) {
	dir := t.TempDir()
	tables := [][][]string{
		{},
		{{"Name", "Age"}, {"Alice", "30"}},
	}
	paths, err := tablesToCSVFiles(tables, "https://example.com/page", dir)
	if err != nil {
		t.Fatal(err)
	}
	if len(paths) != 1 {
		t.Fatalf("expected 1 file (skipped empty table), got %d", len(paths))
	}
}
