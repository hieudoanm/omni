package internal

import (
	"archive/zip"
	"encoding/xml"
	"fmt"
	"io"
	"strings"
)

type XLSXSheet struct {
	Name string
	Rows [][]string
}

type xlsxSharedStrings struct {
	Items []xlsxSI `xml:"si"`
}

type xlsxSI struct {
	Text string  `xml:"t"`
	R    []xlsxR `xml:"r"`
}

type xlsxR struct {
	Text string `xml:"t"`
}

type xlsxWorkbook struct {
	Sheets []xlsxSheetMeta `xml:"sheets>sheet"`
}

type xlsxSheetMeta struct {
	Name string `xml:"name,attr"`
}

type xlsxWorksheet struct {
	SheetData xlsxSheetData `xml:"sheetData"`
}

type xlsxSheetData struct {
	Rows []xlsxRow `xml:"row"`
}

type xlsxRow struct {
	Cells []xlsxCell `xml:"c"`
}

type xlsxCell struct {
	Reference string `xml:"r,attr"`
	Type      string `xml:"t,attr"`
	Value     string `xml:"v"`
}

func readZipEntry(zr *zip.ReadCloser, name string) ([]byte, error) {
	for _, f := range zr.File {
		if f.Name == name {
			rc, err := f.Open()
			if err != nil {
				return nil, err
			}
			defer rc.Close()
			return io.ReadAll(rc)
		}
	}
	return nil, fmt.Errorf("entry not found: %s", name)
}

func parseXLSXSharedStrings(data []byte) (map[int]string, error) {
	var ss xlsxSharedStrings
	if err := xml.Unmarshal(data, &ss); err != nil {
		return nil, err
	}
	result := make(map[int]string)
	for i, item := range ss.Items {
		var sb strings.Builder
		if item.Text != "" {
			sb.WriteString(item.Text)
		}
		for _, r := range item.R {
			sb.WriteString(r.Text)
		}
		result[i] = sb.String()
	}
	return result, nil
}

func ParseXLSX(path string) ([]XLSXSheet, error) {
	zr, err := zip.OpenReader(path)
	if err != nil {
		return nil, fmt.Errorf("failed to open xlsx: %w", err)
	}
	defer zr.Close()

	wbData, err := readZipEntry(zr, "xl/workbook.xml")
	if err != nil {
		return nil, err
	}

	var wb xlsxWorkbook
	if err := xml.Unmarshal(wbData, &wb); err != nil {
		return nil, fmt.Errorf("failed to parse workbook: %w", err)
	}

	ssData, _ := readZipEntry(zr, "xl/sharedStrings.xml")

	var sharedStrings map[int]string
	if ssData != nil {
		sharedStrings, err = parseXLSXSharedStrings(ssData)
		if err != nil {
			return nil, fmt.Errorf("failed to parse shared strings: %w", err)
		}
	}

	var sheets []XLSXSheet
	for i, meta := range wb.Sheets {
		sheetPath := fmt.Sprintf("xl/worksheets/sheet%d.xml", i+1)
		wsData, err := readZipEntry(zr, sheetPath)
		if err != nil {
			return nil, err
		}

		var ws xlsxWorksheet
		if err := xml.Unmarshal(wsData, &ws); err != nil {
			return nil, fmt.Errorf("failed to parse sheet %d: %w", i+1, err)
		}

		sheet := XLSXSheet{Name: meta.Name}
		for _, row := range ws.SheetData.Rows {
			var rowData []string
			for _, cell := range row.Cells {
				val := cell.Value
				if cell.Type == "s" && sharedStrings != nil {
					var idx int
					fmt.Sscanf(val, "%d", &idx)
					if s, ok := sharedStrings[idx]; ok {
						val = s
					}
				}
				rowData = append(rowData, val)
			}
			sheet.Rows = append(sheet.Rows, rowData)
		}

		sheets = append(sheets, sheet)
	}

	return sheets, nil
}
