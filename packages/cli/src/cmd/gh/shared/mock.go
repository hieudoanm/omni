package shared

import "github.com/hieudoanm/omni/packages/cli/src/libs/requests"

type MockResult struct {
	Body []byte
	Err  error
}

func MockFetchSeq(results ...MockResult) FetchFunc {
	var calls int
	return func(url string, opts requests.Options) ([]byte, error) {
		if calls >= len(results) {
			return nil, nil
		}
		r := results[calls]
		calls++
		return r.Body, r.Err
	}
}
