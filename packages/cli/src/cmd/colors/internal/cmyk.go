package internal

import (
	"fmt"
	"math"
)

type CMYK struct {
	C float64
	M float64
	Y float64
	K float64
}

func (c CMYK) IsValid() bool {
	return c.C >= 0 && c.C <= 100 &&
		c.M >= 0 && c.M <= 100 &&
		c.Y >= 0 && c.Y <= 100 &&
		c.K >= 0 && c.K <= 100
}

func (c CMYK) ToRGB() (r, g, b int, err error) {
	if !c.IsValid() {
		return 0, 0, 0, fmt.Errorf("invalid CMYK")
	}
	cC := c.C / 100
	m := c.M / 100
	y := c.Y / 100
	k := c.K / 100
	rF := 1 - math.Min(1, cC*(1-k)+k)
	gF := 1 - math.Min(1, m*(1-k)+k)
	bF := 1 - math.Min(1, y*(1-k)+k)
	r = int(math.Round(rF * 255))
	g = int(math.Round(gF * 255))
	b = int(math.Round(bF * 255))
	return r, g, b, nil
}

func (c CMYK) ToHex() (string, error) {
	r, g, b, err := c.ToRGB()
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("#%02X%02X%02X", r, g, b), nil
}

func (c CMYK) ToHSL() (h, s, l float64, err error) {
	r, g, b, err := c.ToRGB()
	if err != nil {
		return 0, 0, 0, err
	}
	h, s, l, err = RGB{R: r, G: g, B: b}.ToHSL()
	if err != nil {
		return 0, 0, 0, err
	}
	return h, s, l, nil
}

func (c CMYK) ToHCL() (h, cVal, l float64, err error) {
	r, g, b, err := c.ToRGB()
	if err != nil {
		return 0, 0, 0, err
	}
	h, cVal, l, err = RGB{R: r, G: g, B: b}.ToHCL()
	if err != nil {
		return 0, 0, 0, err
	}
	return h, cVal, l, nil
}

func (c CMYK) ToOKLCH() (L, C, H float64, err error) {
	r, g, b, err := c.ToRGB()
	if err != nil {
		return 0, 0, 0, err
	}
	L, C, H, err = RGB{R: r, G: g, B: b}.ToOKLCH()
	if err != nil {
		return 0, 0, 0, err
	}
	return L, C, H, nil
}
