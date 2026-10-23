use super::rules;
use crate::casino::internal::{new_shuffled_deck, Card};
use anyhow::Result;
use clap::Args;
use serde::Serialize;

#[derive(Args)]
pub struct StrategyArgs {
    /// Number of simulations
    #[arg(long, short = 'n', default_value_t = 100000)]
    pub simulations: usize,
}

fn baccarat_sim_hand(mut d: Vec<Card>) -> (i32, i32) {
    let mut player = vec![d[0], d[1]];
    let mut banker = vec![d[2], d[3]];
    d = d.split_off(4);

    let pv = rules::hand_sum(&player);
    let bv = rules::hand_sum(&banker);

    if pv >= 8 || bv >= 8 {
        return (pv, bv);
    }

    if rules::should_draw(&player) {
        player.push(d[0]);
        d = d.split_off(1);
        let p_val = rules::card_value(player[2]);
        if rules::draw_for_third(&banker, p_val) {
            banker.push(d[0]);
        }
    } else if rules::should_draw(&banker) {
        banker.push(d[0]);
    }

    (rules::hand_sum(&player), rules::hand_sum(&banker))
}

#[derive(Serialize)]
struct Side {
    wins: usize,
    pct: f64,
    payout: &'static str,
    house_edge: f64,
}

#[derive(Serialize)]
struct StrategyJson {
    simulations: usize,
    player: Side,
    banker: Side,
    tie: Side,
}

pub fn run(args: &StrategyArgs, json: bool) -> Result<()> {
    let (mut p_wins, mut b_wins, mut ties) = (0usize, 0usize, 0usize);
    for _ in 0..args.simulations {
        let deck = new_shuffled_deck();
        let (pv, bv) = baccarat_sim_hand(deck);
        if pv > bv {
            p_wins += 1;
        } else if bv > pv {
            b_wins += 1;
        } else {
            ties += 1;
        }
    }

    let total = args.simulations as f64;
    let p_pct = p_wins as f64 / total * 100.0;
    let b_pct = b_wins as f64 / total * 100.0;
    let t_pct = ties as f64 / total * 100.0;

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&StrategyJson {
                simulations: args.simulations,
                player: Side {
                    wins: p_wins,
                    pct: p_pct,
                    payout: "1:1",
                    house_edge: 2.0 * p_pct + t_pct - 100.0,
                },
                banker: Side {
                    wins: b_wins,
                    pct: b_pct,
                    payout: "0.95:1",
                    house_edge: 1.95 * b_pct + t_pct - 100.0,
                },
                tie: Side {
                    wins: ties,
                    pct: t_pct,
                    payout: "8:1",
                    house_edge: 9.0 * t_pct - 100.0,
                },
            })?
        );
    } else {
        println!("  Baccarat Strategy Analysis");
        println!("  {}", "-".repeat(38));
        let out = |label: &str, pct: f64, payout: &str, edge: f64| {
            println!("  {label:<10} {pct:6.2}%   {payout:<6}   {edge:+.2}%");
        };
        out("Player", p_pct, "1:1", 2.0 * p_pct + t_pct - 100.0);
        out("Banker", b_pct, "0.95:1", 1.95 * b_pct + t_pct - 100.0);
        out("Tie", t_pct, "8:1", 9.0 * t_pct - 100.0);
        println!("  {}", "-".repeat(38));
        println!("  Simulations: {}", args.simulations);
        println!();
        println!("  Optimal strategy: bet Banker (lowest house edge)");
        println!("  Avoid Tie bet (high house edge ~14%)");
        println!("  Banker bets pay 1:1 minus 5% commission");
    }
    Ok(())
}
