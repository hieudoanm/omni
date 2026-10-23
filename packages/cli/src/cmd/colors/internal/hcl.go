package internal

import (
	"fmt"
	"math"
)

type HCL struct {
	H float64
	C float64
	L float64
}

func (c HCL) IsValid() bool {
	return c.H >= 0 && c.H <= 360 &&
		c.L >= 0 && c.L <= 100 &&
		c.C >= 0
}

func (c HCL) ToLab() (l, a, b float64) {
	hRad := c.H * (math.Pi / 180)
	a = c.C * math.Cos(hRad)
	b = c.C * math.Sin(hRad)
	l = c.L
	return
}

func labToXYZ(l, a, b float64) (X, Y, Z float64) {
	refX, refY, refZ := 0.95047, 1.00000, 1.08883
	fY := (l + 16) / 116
	fX := a/500 + fY
	fZ := fY - b/200
	cube := func(t float64) float64 { return t * t * t }
	finv := func(t float64) float64 {
		if t*t*t > 0.008856 {
			return cube(t)
		}
		return (t - 16.0/116) / 7.787
	}
	X = refX * finv(fX)
	Y = refY * finv(fY)
	Z = refZ * finv(fZ)
	return
}

func xyzToLinearRGB(X, Y, Z float64) (R, G, B float64) {
	R = 3.2404542*X - 1.5371385*Y - 0.4985314*Z
	G = -0.9692660*X + 1.8760108*Y + 0.0415560*Z
	B = 0.0556434*X - 0.2040259*Y + 1.0572252*Z
	return
}

func linearToRGB(R, G, B float64) (r, g, b int) {
	toSRGB := func(u float64) float64 {
		if u <= 0 {
			return 0
		}
		if u >= 1 {
			return 1
		}
		if u <= 0.0031308 {
			return 12.92 * u
		}
		return 1.055*math.Pow(u, 1/2.4) - 0.055
	}
	r = int(math.Round(toSRGB(R) * 255))
	g = int(math.Round(toSRGB(G) * 255))
	b = int(math.Round(toSRGB(B) * 255))
	return
}

func (c HCL) ToRGB() (int, int, int, error) {
	if !c.IsValid() {
		return 0, 0, 0, fmt.Errorf("invalid HCL")
	}
	l, a, b := c.ToLab()
	X, Y, Z := labToXYZ(l, a, b)
	R, G, B := xyzToLinearRGB(X, Y, Z)
	r, g, bInt := linearToRGB(R, G, B)
	return r, g, bInt, nil
}

func (c HCL) ToHex() (string, error) {
	r, g, b, err := c.ToRGB()
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("#%02X%02X%02X", r, g, b), nil
}

func (c HCL) ToHSL() (h, s, l float64, err error) {
	r, g, b, err := c.ToRGB()
	if err != nil {
		return 0, 0, 0, err
	}
	hslH, hslS, hslL, err := RGB{R: r, G: g, B: b}.ToHSL()
	if err != nil {
		return 0, 0, 0, err
	}
	return hslH, hslS, hslL, nil
}

func (c HCL) ToCMYK() (cVal, m, y, k float64, err error) {
	r, g, b, err := c.ToRGB()
	if err != nil {
		return 0, 0, 0, 0, err
	}
	cVal, m, y, k, err = RGB{R: r, G: g, B: b}.ToCMYK()
	if err != nil {
		return 0, 0, 0, 0, err
	}
	return cVal, m, y, k, nil
}

func (c HCL) ToOKLCH() (L, C, H float64, err error) {
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
