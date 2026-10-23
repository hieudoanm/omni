package http

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

var (
	httpGet    = requests.Get
	httpPost   = requests.Post
	httpPut    = requests.Put
	httpDelete = requests.Delete
)

func httpRun(url, method, data, header string, httpJSON bool) error {
	method = strings.ToUpper(method)
	if method == "" {
		method = http.MethodGet
	}

	opts := requests.Options{}
	if data != "" {
		opts.Body = []byte(data)
	}
	if header != "" {
		headers := make(http.Header)
		for _, h := range strings.Split(header, ",") {
			h = strings.TrimSpace(h)
			if parts := strings.SplitN(h, ":", 2); len(parts) == 2 {
				headers.Set(strings.TrimSpace(parts[0]), strings.TrimSpace(parts[1]))
			}
		}
		opts.Header = headers
	}

	var body []byte
	var err error

	switch method {
	case http.MethodGet:
		body, err = httpGet(url, opts)
	case http.MethodPost:
		body, err = httpPost(url, opts)
	case http.MethodPut:
		body, err = httpPut(url, opts)
	case http.MethodDelete:
		body, err = httpDelete(url, opts)
	default:
		return fmt.Errorf("unsupported method: %s (use GET, POST, PUT, DELETE)", method)
	}
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}

	if httpJSON {
		var parsed interface{}
		if err := json.Unmarshal(body, &parsed); err == nil {
			b, _ := json.MarshalIndent(parsed, "", "  ")
			fmt.Println(string(b))
		} else {
			fmt.Println(string(body))
		}
	} else {
		fmt.Println(string(body))
	}
	return nil
}
