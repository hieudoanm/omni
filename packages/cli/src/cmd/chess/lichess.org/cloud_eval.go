package lichess

import (
	"encoding/json"
	"net/url"
)

type CloudEvalPV struct {
	Moves string `json:"moves"`
	Cp    *int   `json:"cp,omitempty"`
	Mate  *int   `json:"mate,omitempty"`
}

type CloudEvalResponse struct {
	FEN    string        `json:"fen"`
	Depth  int           `json:"depth"`
	KNodes int           `json:"knodes"`
	PVs    []CloudEvalPV `json:"pvs"`
}

func CloudEvalAPI(fen string, multiPv int, variant string) (*CloudEvalResponse, error) {
	params := url.Values{}
	params.Set("fen", fen)
	params.Set("multiPv", itoa(multiPv))
	params.Set("variant", variant)

	body, err := DoGet("/cloud-eval", params)
	if err != nil {
		return nil, err
	}

	var data CloudEvalResponse
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}
	return &data, nil
}

func CloudEvalCP(fen string, variant string) (int, error) {
	data, err := CloudEvalAPI(fen, 1, variant)
	if err != nil {
		return 0, err
	}
	if len(data.PVs) == 0 {
		return 0, nil
	}
	pv := data.PVs[0]
	if pv.Mate != nil {
		if *pv.Mate > 0 {
			return 10000, nil
		}
		return -10000, nil
	}
	if pv.Cp != nil {
		return *pv.Cp, nil
	}
	return 0, nil
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	s := ""
	neg := false
	if n < 0 {
		neg = true
		n = -n
	}
	for n > 0 {
		s = string(rune('0'+n%10)) + s
		n /= 10
	}
	if neg {
		s = "-" + s
	}
	return s
}
