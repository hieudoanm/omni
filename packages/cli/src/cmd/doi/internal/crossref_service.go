package internal

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

func FetchCrossref(id string) (CrossRefData, error) {
	url := fmt.Sprintf("https://api.crossref.org/works/%s", id)
	response, err := requests.Get(url, requests.Options{})
	if err != nil {
		return CrossRefData{}, fmt.Errorf("fetch error: %w", err)
	}
	var data CrossRefData
	if err := json.Unmarshal(response, &data); err != nil {
		return CrossRefData{}, fmt.Errorf("parse error: %w", err)
	}
	return data, nil
}
