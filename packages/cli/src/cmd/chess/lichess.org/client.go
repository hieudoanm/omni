package lichess

import (
	"net/url"
	"os"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

const BaseURL = "https://lichess.org/api"

func Token() string {
	return os.Getenv("LICHESS_API_TOKEN")
}

func DoGet(path string, params url.Values) ([]byte, error) {
	u := BaseURL + path
	opts := requests.Options{}
	if params != nil {
		opts.Query = make(map[string]string, len(params))
		for k, v := range params {
			opts.Query[k] = v[0]
		}
	}
	tok := Token()
	if tok != "" {
		opts.Header = make(map[string][]string)
		opts.Header["Authorization"] = []string{"Bearer " + tok}
	}
	return requests.Get(u, opts)
}
