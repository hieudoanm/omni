pub mod create;
pub mod pre_checkout;
pub mod shipping;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct InvoiceArgs {
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    /// Create an invoice link
    Create(create::Args),
    /// Answer a pre-checkout query
    #[command(name = "pre-checkout")]
    PreCheckout(pre_checkout::Args),
    /// Answer a shipping query
    Shipping(shipping::Args),
}

pub fn run(args: &InvoiceArgs) -> Result<()> {
    match &args.command {
        Command::Create(a) => create::run(a),
        Command::PreCheckout(a) => pre_checkout::run(a),
        Command::Shipping(a) => shipping::run(a),
    }
}
