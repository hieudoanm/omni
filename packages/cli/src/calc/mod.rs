use anyhow::Result;
use chrono::{Datelike, Duration, NaiveDate, Weekday};
use clap::{Args as ClapArgs, Subcommand};
use serde_json::Value;

// ---------- shared math helpers (cli.go/src/cmd/calc/internal) ----------

pub fn gcd(mut a: i64, mut b: i64) -> i64 {
    a = a.abs();
    b = b.abs();
    while b != 0 {
        let t = a % b;
        a = b;
        b = t;
    }
    a
}

pub fn calc_payment(principal: f64, annual_rate: f64, years: f64) -> f64 {
    if annual_rate == 0.0 {
        return principal / (years * 12.0);
    }
    let r = annual_rate / 100.0 / 12.0;
    let n = years * 12.0;
    principal * r * (1.0 + r).powf(n) / ((1.0 + r).powf(n) - 1.0)
}

pub fn days_in_month(y: i32, m: i32) -> i64 {
    let (ny, nm) = if m == 12 { (y + 1, 1) } else { (y, m + 1) };
    NaiveDate::from_ymd_opt(ny, nm as u32, 1)
        .and_then(|d| d.pred_opt())
        .map(|d| d.day() as i64)
        .unwrap_or(31)
}

/// Go time.Time.AddDate equivalent for a single component: the caller invokes
/// this once per component (days, then months, then years) like the Go code.
/// Day overflow rolls into following months, matching Go's normalization.
pub fn add_date_component(date: NaiveDate, years: i64, months: i64, days: i64) -> NaiveDate {
    let base = date + Duration::days(days);
    let mut total = base.year() as i64 * 12 + base.month() as i64 - 1 + years * 12 + months;
    let mut y = total.div_euclid(12) as i32;
    let mut m = total.rem_euclid(12) as u32 + 1;
    let mut d = base.day() as i64;
    loop {
        let dim = days_in_month(y, m as i32);
        if d <= dim {
            break;
        }
        d -= dim;
        total += 1;
        y = total.div_euclid(12) as i32;
        m = total.rem_euclid(12) as u32 + 1;
    }
    NaiveDate::from_ymd_opt(y, m, d as u32).unwrap_or(base)
}

pub fn weekday_name(d: NaiveDate) -> &'static str {
    match d.weekday() {
        Weekday::Mon => "Monday",
        Weekday::Tue => "Tuesday",
        Weekday::Wed => "Wednesday",
        Weekday::Thu => "Thursday",
        Weekday::Fri => "Friday",
        Weekday::Sat => "Saturday",
        Weekday::Sun => "Sunday",
    }
}

pub fn print_json(v: &Value) -> Result<()> {
    println!("{}", serde_json::to_string_pretty(v)?);
    Ok(())
}

// ---------- unit conversion table (calc/unit/conversion.go) ----------

#[derive(Clone, Copy, PartialEq)]
pub enum UnitKind {
    /// base = v*x (to_mul) or v/x; result = base*x or base/x.
    Linear {
        to_mul: bool,
        x: f64,
        from_mul: bool,
    },
    TempC,
    TempF,
    TempK,
}

#[derive(Clone, Copy)]
pub struct Unit {
    pub cat: &'static str,
    pub aliases: &'static [&'static str],
    pub kind: UnitKind,
}

macro_rules! lin {
    ($cat:literal, [$($a:literal),+], $tm:expr, $x:expr, $fm:expr) => {
        Unit { cat: $cat, aliases: &[$($a),+], kind: UnitKind::Linear { to_mul: $tm, x: $x, from_mul: $fm } }
    };
}

pub static UNIT_TABLE: &[Unit] = &[
    lin!(
        "length",
        ["mm", "millimeter", "millimetre"],
        false,
        1000.0,
        true
    ),
    lin!(
        "length",
        ["cm", "centimeter", "centimetre"],
        false,
        100.0,
        true
    ),
    lin!("length", ["m", "meter", "metre"], true, 1.0, true),
    lin!(
        "length",
        ["km", "kilometer", "kilometre"],
        true,
        1000.0,
        false
    ),
    lin!("length", ["in", "inch"], true, 0.0254, false),
    lin!("length", ["ft", "foot", "feet"], true, 0.3048, false),
    lin!("length", ["yd", "yard"], true, 0.9144, false),
    lin!("length", ["mi", "mile"], true, 1609.344, false),
    lin!("weight", ["mg", "milligram"], false, 1e6, true),
    lin!("weight", ["g", "gram"], false, 1000.0, true),
    lin!("weight", ["kg", "kilogram"], true, 1.0, true),
    lin!("weight", ["t", "tonne", "metric-ton"], true, 1000.0, false),
    lin!("weight", ["lb", "lbs", "pound"], true, 0.453592, false),
    lin!("weight", ["oz", "ounce"], true, 0.0283495, false),
    Unit {
        cat: "temperature",
        aliases: &["c", "celsius"],
        kind: UnitKind::TempC,
    },
    Unit {
        cat: "temperature",
        aliases: &["f", "fahrenheit"],
        kind: UnitKind::TempF,
    },
    Unit {
        cat: "temperature",
        aliases: &["k", "kelvin"],
        kind: UnitKind::TempK,
    },
    lin!("speed", ["m/s", "mps"], true, 1.0, true),
    lin!("speed", ["km/h", "kph"], false, 3.6, true),
    lin!("speed", ["mph"], true, 0.44704, false),
    lin!("speed", ["kn", "knot", "knots"], true, 0.514444, false),
];

impl UnitKind {
    pub fn to_base(self, v: f64) -> f64 {
        match self {
            UnitKind::Linear { to_mul, x, .. } => {
                if to_mul {
                    v * x
                } else {
                    v / x
                }
            }
            UnitKind::TempC => v,
            UnitKind::TempF => (v - 32.0) * 5.0 / 9.0,
            UnitKind::TempK => v - 273.15,
        }
    }

    pub fn base_to_unit(self, v: f64) -> f64 {
        match self {
            UnitKind::Linear { from_mul, x, .. } => {
                if from_mul {
                    v * x
                } else {
                    v / x
                }
            }
            UnitKind::TempC => v,
            UnitKind::TempF => v * 9.0 / 5.0 + 32.0,
            UnitKind::TempK => v + 273.15,
        }
    }
}

pub fn find_unit(name: &str) -> Option<&'static Unit> {
    let name = name.to_lowercase();
    UNIT_TABLE
        .iter()
        .find(|u| u.aliases.contains(&name.as_str()))
}

// ---------- Vietnam PIT tax (calc/tax/service.go) ----------

pub const PERSONAL_DEDUCTION: f64 = 11_000_000.0;
pub const DEPENDENT_DEDUCTION: f64 = 4_400_000.0;
pub const INSURANCE_CAP: f64 = 36_000_000.0;

pub const TAX_BRACKETS: &[(f64, f64)] = &[
    (5_000_000.0, 0.05),
    (5_000_000.0, 0.10),
    (8_000_000.0, 0.15),
    (14_000_000.0, 0.20),
    (20_000_000.0, 0.25),
    (28_000_000.0, 0.30),
    (1e18, 0.35),
];

pub fn insurance_rate_total() -> f64 {
    0.08 + 0.015 + 0.01
}

pub fn clamp_insurance_base(gross: f64, enabled: bool) -> f64 {
    if !enabled {
        return 0.0;
    }
    gross.min(INSURANCE_CAP)
}

pub fn calculate_tax(taxable: f64) -> (Vec<(f64, f64, f64)>, f64) {
    let mut out = Vec::new();
    let mut remain = taxable;
    let mut total = 0.0;
    for &(limit, rate) in TAX_BRACKETS {
        if remain <= 0.0 {
            break;
        }
        let apply = limit.min(remain);
        let tax = apply * rate;
        out.push((rate, apply, tax));
        total += tax;
        remain -= apply;
    }
    (out, total)
}

pub fn solve_gross_from_net(target_net: f64, dependents: i64, insurance: bool) -> f64 {
    let mut gross = target_net;
    for _ in 0..20 {
        let base = clamp_insurance_base(gross, insurance);
        let ins = base * insurance_rate_total();
        let deductions = PERSONAL_DEDUCTION + dependents as f64 * DEPENDENT_DEDUCTION + ins;
        let taxable = (gross - deductions).max(0.0);
        let (_, tax) = calculate_tax(taxable);
        let net = gross - ins - tax;
        gross += target_net - net;
    }
    gross
}

// ---------- module root ----------

#[derive(ClapArgs)]
#[command(
    about = "Financial and utility calculators",
    long_about = "A collection of calculator tools including tax calculation and compound interest."
)]
pub struct CalcArgs {
    #[command(subcommand)]
    pub command: Option<CalcCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum CalcCommand {
    /// Calculate age from birth date
    Age(age::AgeArgs),
    /// Convert between number bases (bin/oct/dec/hex)
    Base(base::BaseArgs),
    /// Calculate Body Mass Index
    Bmi(bmi::BmiArgs),
    /// Compound interest calculator
    Compound(compound::CompoundArgs),
    /// Convert between currencies using Frankfurter API
    #[command(name = "currency", alias = "cc", alias = "fx")]
    Currency(currency::CurrencyArgs),
    /// Date arithmetic and difference
    Date(date::DateArgs),
    /// Calculate discount and sale price
    Discount(discount::DiscountArgs),
    /// Evaluate a mathematical expression
    Eval(eval::EvalArgs),
    /// Compute factorial of a number (n!)
    Factorial(factorial::FactorialArgs),
    /// Greatest common divisor of two numbers
    Gcd(gcd::GcdArgs),
    /// Least common multiple of two numbers
    Lcm(lcm::LcmArgs),
    /// Loan amortization calculator
    Loan(loan::LoanArgs),
    /// Mortgage payment calculator
    Mortgage(mortgage::MortgageArgs),
    /// Calculate percentages
    Percent(percent::PercentArgs),
    /// Check if a number is prime, or generate primes up to N
    Prime(prime::PrimeArgs),
    /// Generate random numbers
    Random(random::RandomArgs),
    /// Statistical summary of numbers
    Stats(stats::StatsArgs),
    /// Calculate Vietnam personal income tax
    Tax(tax::TaxArgs),
    /// Calculate tip and split bill
    Tip(tip::TipArgs),
    /// Convert between units (length, weight, temp, speed)
    Unit(unit::UnitArgs),
}

pub mod age;
pub mod base;
pub mod bmi;
pub mod compound;
pub mod currency;
pub mod date;
pub mod discount;
pub mod eval;
pub mod factorial;
pub mod gcd;
pub mod lcm;
pub mod loan;
pub mod mortgage;
pub mod percent;
pub mod prime;
pub mod random;
pub mod stats;
pub mod tax;
pub mod tip;
pub mod unit;

pub fn run(args: &CalcArgs) -> Result<()> {
    let Some(command) = &args.command else {
        let mut cmd = <CalcArgs as ClapArgs>::augment_args(clap::Command::new("calc"));
        let _ = cmd.print_help();
        return Ok(());
    };
    let j = args.json;
    match command {
        CalcCommand::Age(a) => age::run(a, j),
        CalcCommand::Base(a) => base::run(a, j),
        CalcCommand::Bmi(a) => bmi::run(a, j),
        CalcCommand::Compound(a) => compound::run(a, j),
        CalcCommand::Currency(a) => currency::run(a, j),
        CalcCommand::Date(a) => date::run(a, j),
        CalcCommand::Discount(a) => discount::run(a, j),
        CalcCommand::Eval(a) => eval::run(a, j),
        CalcCommand::Factorial(a) => factorial::run(a, j),
        CalcCommand::Gcd(a) => gcd::run(a, j),
        CalcCommand::Lcm(a) => lcm::run(a, j),
        CalcCommand::Loan(a) => loan::run(a, j),
        CalcCommand::Mortgage(a) => mortgage::run(a, j),
        CalcCommand::Percent(a) => percent::run(a, j),
        CalcCommand::Prime(a) => prime::run(a, j),
        CalcCommand::Random(a) => random::run(a, j),
        CalcCommand::Stats(a) => stats::run(a, j),
        CalcCommand::Tax(a) => tax::run(a, j),
        CalcCommand::Tip(a) => tip::run(a, j),
        CalcCommand::Unit(a) => unit::run(a, j),
    }
}
