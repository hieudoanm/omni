use super::internal::{random_hex, Hex};
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct RandomArgs {
    /// number of random colors
    #[arg(long, short = 'm', default_value_t = 1)]
    pub max: i32,
}

pub fn run(args: &RandomArgs, json: bool) -> Result<()> {
    if json {
        let mut colors = Vec::new();
        for _ in 0..args.max {
            let h = random_hex();
            if let Ok((r, g, b)) = Hex(h.clone()).to_rgb() {
                colors.push(serde_json::json!({
                    "hex": h,
                    "rgb": {"r": r, "g": g, "b": b},
                }));
            }
        }
        println!("{}", serde_json::to_string_pretty(&colors)?);
    } else {
        for _ in 0..args.max {
            let h = random_hex();
            match Hex(h.clone()).to_rgb() {
                Ok((r, g, b)) => println!("{h} - rgb({r}, {g}, {b})"),
                Err(e) => println!("Error converting HEX to RGB: {e}"),
            }
        }
    }
    Ok(())
}
