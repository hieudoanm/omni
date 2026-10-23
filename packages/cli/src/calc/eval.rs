use super::print_json;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct EvalArgs {
    /// Mathematical expression to evaluate
    #[arg(long, short = 'e', default_value = "")]
    pub expression: String,
}

struct Evaluator<'a> {
    s: &'a [u8],
    pos: usize,
    tok: String,
    val: f64,
}

impl<'a> Evaluator<'a> {
    fn new(input: &'a str) -> Self {
        let mut e = Evaluator {
            s: input.as_bytes(),
            pos: 0,
            tok: String::new(),
            val: 0.0,
        };
        e.lex();
        e
    }

    fn lex(&mut self) {
        while self.pos < self.s.len() && self.s[self.pos] == b' ' {
            self.pos += 1;
        }
        if self.pos >= self.s.len() {
            self.tok = "EOF".into();
            return;
        }
        let c = self.s[self.pos];
        if c.is_ascii_digit() || c == b'.' {
            let start = self.pos;
            while self.pos < self.s.len()
                && (self.s[self.pos].is_ascii_digit() || self.s[self.pos] == b'.')
            {
                self.pos += 1;
            }
            self.tok = "NUM".into();
            self.val = std::str::from_utf8(&self.s[start..self.pos])
                .unwrap_or("0")
                .parse()
                .unwrap_or(0.0);
            return;
        }
        if c.is_ascii_alphabetic() || c == b'_' {
            let start = self.pos;
            while self.pos < self.s.len() {
                let ch = self.s[self.pos];
                if ch.is_ascii_alphanumeric() || ch == b'_' {
                    self.pos += 1;
                } else {
                    break;
                }
            }
            self.tok = std::str::from_utf8(&self.s[start..self.pos])
                .unwrap_or("")
                .to_string();
            return;
        }
        // Go lexer works on bytes; single-byte tokens only.
        self.tok = (c as char).to_string();
        self.pos += 1;
    }

    fn eval(&mut self) -> Result<f64> {
        let v = self.parse_expr()?;
        if self.tok != "EOF" {
            return Err(anyhow!(
                "unexpected token {:?} at position {}",
                self.tok,
                self.pos
            ));
        }
        Ok(v)
    }

    fn parse_expr(&mut self) -> Result<f64> {
        let mut v = self.parse_term()?;
        while self.tok == "+" || self.tok == "-" {
            let op = self.tok.clone();
            self.lex();
            let rhs = self.parse_term()?;
            if op == "+" {
                v += rhs;
            } else {
                v -= rhs;
            }
        }
        Ok(v)
    }

    fn parse_term(&mut self) -> Result<f64> {
        let mut v = self.parse_power()?;
        while self.tok == "*" || self.tok == "/" {
            let op = self.tok.clone();
            self.lex();
            let rhs = self.parse_power()?;
            if op == "*" {
                v *= rhs;
            } else {
                if rhs == 0.0 {
                    return Err(anyhow!("division by zero"));
                }
                v /= rhs;
            }
        }
        Ok(v)
    }

    fn parse_power(&mut self) -> Result<f64> {
        let mut v = self.parse_unary()?;
        if self.tok == "^" {
            self.lex();
            let rhs = self.parse_power()?;
            v = v.powf(rhs);
        }
        Ok(v)
    }

    fn parse_unary(&mut self) -> Result<f64> {
        if self.tok == "-" {
            self.lex();
            return Ok(-self.parse_unary()?);
        }
        if self.tok == "+" {
            self.lex();
            return self.parse_unary();
        }
        self.parse_primary()
    }

    fn parse_primary(&mut self) -> Result<f64> {
        match self.tok.as_str() {
            "NUM" => {
                let v = self.val;
                self.lex();
                Ok(v)
            }
            "pi" | "π" => {
                self.lex();
                Ok(std::f64::consts::PI)
            }
            "e" => {
                self.lex();
                Ok(std::f64::consts::E)
            }
            "(" => {
                self.lex();
                let v = self.parse_expr()?;
                if self.tok != ")" {
                    return Err(anyhow!("expected ')' got {:?}", self.tok));
                }
                self.lex();
                Ok(v)
            }
            name => {
                let name = name.to_string();
                self.lex();
                if self.tok != "(" {
                    return Err(anyhow!("expected '(' after {name}"));
                }
                self.lex();
                let arg = self.parse_expr()?;
                if self.tok != ")" {
                    return Err(anyhow!("expected ')' after {name} argument"));
                }
                self.lex();
                apply_fn(&name, arg)
            }
        }
    }
}

fn apply_fn(name: &str, x: f64) -> Result<f64> {
    Ok(match name.to_lowercase().as_str() {
        "sqrt" => x.sqrt(),
        "sin" => x.sin(),
        "cos" => x.cos(),
        "tan" => x.tan(),
        "abs" => x.abs(),
        "floor" => x.floor(),
        "ceil" => x.ceil(),
        "round" => x.round(),
        "log" => x.ln(),
        "log10" => x.log10(),
        "exp" => x.exp(),
        other => return Err(anyhow!("unknown function {other:?}")),
    })
}

pub fn run(args: &EvalArgs, json: bool) -> Result<()> {
    let mut e = Evaluator::new(&args.expression);
    let v = e.eval().map_err(|e| anyhow!("eval: {e}"))?;
    if json {
        return print_json(&json!({"expression": args.expression, "result": v}));
    }
    println!("{v}");
    Ok(())
}
