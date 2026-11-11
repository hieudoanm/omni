package ping

import (
	"encoding/json"
	"fmt"
	"net"
	"strconv"
	"time"
)

var (
	pingJSON       bool
	netDialTimeout = net.DialTimeout
)

func pingRun(host string, port int, count int, timeout time.Duration) error {
	var successes, failures int
	var total time.Duration

	if count < 1 {
		count = 4
	}

	type result struct {
		Seq     int    `json:"seq"`
		Success bool   `json:"success"`
		Latency string `json:"latency,omitempty"`
		Error   string `json:"error,omitempty"`
	}
	var results []result

	for i := 0; i < count; i++ {
		addr := net.JoinHostPort(host, strconv.Itoa(port))
		start := time.Now()
		conn, err := netDialTimeout("tcp", addr, timeout)
		elapsed := time.Since(start)

		if err != nil {
			failures++
			r := result{Seq: i + 1, Success: false, Error: err.Error()}
			if pingJSON {
				results = append(results, r)
			} else {
				fmt.Printf("PING %s (port %d) — seq=%d time=%s error=%s\n",
					host, port, i+1, elapsed.Round(time.Millisecond), err)
			}
		} else {
			conn.Close()
			successes++
			total += elapsed
			r := result{Seq: i + 1, Success: true, Latency: elapsed.Round(time.Millisecond).String()}
			if pingJSON {
				results = append(results, r)
			} else {
				fmt.Printf("PING %s (port %d) — seq=%d time=%s\n",
					host, port, i+1, elapsed.Round(time.Millisecond))
			}
		}
	}

	if pingJSON {
		avg := time.Duration(0)
		if successes > 0 {
			avg = total / time.Duration(successes)
		}
		out, err := json.MarshalIndent(map[string]interface{}{
			"host":      host,
			"port":      port,
			"sent":      count,
			"successes": successes,
			"failures":  failures,
			"avg_ms":    avg.Round(time.Millisecond).String(),
			"results":   results,
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
	} else {
		fmt.Printf("\n--- %s ping statistics ---\n", host)
		fmt.Printf("%d sent, %d received, %.0f%% loss\n",
			count, successes, float64(failures)/float64(count)*100)
		if successes > 0 {
			avg := total / time.Duration(successes)
			fmt.Printf("avg time: %s\n", avg.Round(time.Millisecond))
		}
	}
	return nil
}
