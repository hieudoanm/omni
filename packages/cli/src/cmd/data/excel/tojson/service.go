package tojson

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/data/internal"
)

func runE(input string, pretty bool) error {
	sheets, err := internal.ParseXLSX(input)
	if err != nil {
		return fmt.Errorf("parse xlsx: %w", err)
	}

	type sheetOutput struct {
		Name string     `json:"name"`
		Rows [][]string `json:"rows"`
	}

	var output []sheetOutput
	for _, s := range sheets {
		output = append(output, sheetOutput{Name: s.Name, Rows: s.Rows})
	}

	var data []byte
	if pretty {
		data, err = json.MarshalIndent(output, "", "  ")
	} else {
		data, err = json.Marshal(output)
	}
	if err != nil {
		return fmt.Errorf("marshal json: %w", err)
	}

	fmt.Println(string(data))
	return nil
}
