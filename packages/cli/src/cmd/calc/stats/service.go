package stats

import (
	"encoding/json"
	"fmt"
	"math"
	"sort"
	"strconv"
)

func runStats(values []string, jsonOutput bool) error {
	nums := make([]float64, len(values))
	for i, s := range values {
		v, err := strconv.ParseFloat(s, 64)
		if err != nil {
			return fmt.Errorf("invalid number %q: %w", s, err)
		}
		nums[i] = v
	}

	sort.Float64s(nums)
	n := len(nums)
	var sum float64
	for _, v := range nums {
		sum += v
	}
	mean := sum / float64(n)
	var varianceSum float64
	for _, v := range nums {
		d := v - mean
		varianceSum += d * d
	}
	stddev := math.Sqrt(varianceSum / float64(n))
	median := nums[n/2]
	if n%2 == 0 {
		median = (nums[n/2-1] + nums[n/2]) / 2
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"count":  n,
			"min":    nums[0],
			"max":    nums[n-1],
			"sum":    sum,
			"mean":   mean,
			"median": median,
			"stddev": stddev,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Printf("count:  %d\n", n)
		fmt.Printf("min:    %g\n", nums[0])
		fmt.Printf("max:    %g\n", nums[n-1])
		fmt.Printf("sum:    %g\n", sum)
		fmt.Printf("mean:   %g\n", mean)
		fmt.Printf("median: %g\n", median)
		fmt.Printf("stddev: %g\n", stddev)
	}
	return nil
}
