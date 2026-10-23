use super::print_json;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct PrimeArgs {
    /// Number to check or limit
    #[arg(long, short = 'n', default_value_t = 0)]
    pub number: i64,
    /// List all primes up to N
    #[arg(long, short = 'l')]
    pub list: bool,
}

fn is_prime(n: i64) -> bool {
    if n < 2 {
        return false;
    }
    if n == 2 || n == 3 {
        return true;
    }
    if n % 2 == 0 || n % 3 == 0 {
        return false;
    }
    let limit = (n as f64).sqrt() as i64;
    let mut i = 5i64;
    while i <= limit {
        if n % i == 0 || n % (i + 2) == 0 {
            return false;
        }
        i += 6;
    }
    true
}

fn sieve(limit: i64) -> Vec<i64> {
    if limit < 2 {
        return Vec::new();
    }
    let mut composite = vec![false; (limit + 1) as usize];
    let mut i = 2i64;
    while i * i <= limit {
        if !composite[i as usize] {
            let mut j = i * i;
            while j <= limit {
                composite[j as usize] = true;
                j += i;
            }
        }
        i += 1;
    }
    (2..=limit).filter(|&i| !composite[i as usize]).collect()
}

pub fn run(args: &PrimeArgs, json: bool) -> Result<()> {
    let n = args.number;
    if n < 2 {
        return Err(anyhow!("number must be >= 2"));
    }
    if args.list {
        let primes = sieve(n);
        if json {
            return print_json(&json!({
                "limit": n, "count": primes.len(), "primes": primes,
            }));
        }
        for p in primes {
            println!("{p}");
        }
        return Ok(());
    }
    let prime = is_prime(n);
    if json {
        return print_json(&json!({"number": n, "is_prime": prime}));
    }
    if prime {
        println!("{n} is prime");
    } else {
        println!("{n} is not prime");
    }
    Ok(())
}
