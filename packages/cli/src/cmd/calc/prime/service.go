package prime

import (
	"encoding/json"
	"fmt"
	"math"
)

func isPrime(n int64) bool {
	if n < 2 {
		return false
	}
	if n == 2 || n == 3 {
		return true
	}
	if n%2 == 0 || n%3 == 0 {
		return false
	}
	limit := int64(math.Sqrt(float64(n)))
	for i := int64(5); i <= limit; i += 6 {
		if n%i == 0 || n%(i+2) == 0 {
			return false
		}
	}
	return true
}

func runPrime(number int, list bool, jsonOutput bool) error {
	var n int64 = int64(number)
	if n < 2 {
		return fmt.Errorf("number must be >= 2")
	}

	if list {
		primes := sieve(n)
		if jsonOutput {
			b, _ := json.MarshalIndent(map[string]interface{}{
				"limit":  n,
				"count":  len(primes),
				"primes": primes,
			}, "", "  ")
			fmt.Println(string(b))
		} else {
			for _, p := range primes {
				fmt.Println(p)
			}
		}
		return nil
	}

	isPrime := isPrime(n)
	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"number":   n,
			"is_prime": isPrime,
		}, "", "  ")
		fmt.Println(string(b))
	} else if isPrime {
		fmt.Printf("%d is prime\n", n)
	} else {
		fmt.Printf("%d is not prime\n", n)
	}
	return nil
}

func sieve(limit int64) []int64 {
	if limit < 2 {
		return nil
	}
	isComposite := make([]bool, limit+1)
	for i := int64(2); i*i <= limit; i++ {
		if !isComposite[i] {
			for j := i * i; j <= limit; j += i {
				isComposite[j] = true
			}
		}
	}
	var primes []int64
	for i := int64(2); i <= limit; i++ {
		if !isComposite[i] {
			primes = append(primes, i)
		}
	}
	return primes
}
