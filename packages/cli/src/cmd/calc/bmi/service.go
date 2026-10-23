package bmi

import (
	"encoding/json"
	"fmt"
)

type bmiResult struct {
	Weight   float64 `json:"weight"`
	Height   float64 `json:"height"`
	BMI      float64 `json:"bmi"`
	Category string  `json:"category"`
}

func bmiCategory(bmi float64) string {
	switch {
	case bmi < 18.5:
		return "Underweight"
	case bmi < 25:
		return "Normal"
	case bmi < 30:
		return "Overweight"
	default:
		return "Obese"
	}
}

func runBMI(weight, height float64, jsonOutput bool) error {
	heightM := height / 100
	bmi := weight / (heightM * heightM)

	if jsonOutput {
		out, err := json.MarshalIndent(bmiResult{
			Weight:   weight,
			Height:   height,
			BMI:      bmi,
			Category: bmiCategory(bmi),
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
	} else {
		fmt.Println("=== BMI Calculator ===")
		fmt.Printf("Weight:        %12.1f kg\n", weight)
		fmt.Printf("Height:        %12.1f cm\n", height)
		fmt.Printf("BMI:           %12.1f\n", bmi)
		fmt.Printf("Category:      %12s\n", bmiCategory(bmi))
	}
	return nil
}
