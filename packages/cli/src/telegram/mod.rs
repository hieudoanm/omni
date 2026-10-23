pub mod bot;
pub mod callback;
pub mod chat;
pub mod contact;
pub mod dice;
pub mod forum;
pub mod game;
pub mod gift;
pub mod inline;
pub mod internal;
pub mod invoice;
pub mod location;
pub mod message;
pub mod poll;
pub mod sticker;
pub mod venue;
pub mod webhook;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct TelegramArgs {
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    /// Bot management
    Bot(bot::BotArgs),
    /// Answer callback queries
    Callback(callback::CallbackArgs),
    /// Manage Telegram chats
    Chat(chat::ChatArgs),
    /// Send contacts
    Contact(contact::ContactArgs),
    /// Send a dice
    Dice(dice::Args),
    /// Manage forum topics
    Forum(forum::ForumArgs),
    /// Send and manage games
    Game(game::GameArgs),
    /// Send gifts
    Gift(gift::GiftArgs),
    /// Answer inline queries
    Inline(inline::InlineArgs),
    /// Create and manage invoices
    Invoice(invoice::InvoiceArgs),
    /// Send locations
    Location(location::LocationArgs),
    /// Send Telegram messages
    Message(message::MessageArgs),
    /// Send polls
    Poll(poll::PollArgs),
    /// Send stickers
    Sticker(sticker::StickerArgs),
    /// Send venues
    Venue(venue::VenueArgs),
    /// Manage Telegram webhooks
    Webhook(webhook::WebhookArgs),
}

pub fn run(args: &TelegramArgs) -> Result<()> {
    match &args.command {
        Command::Bot(a) => bot::run(a),
        Command::Callback(a) => callback::run(a),
        Command::Chat(a) => chat::run(a),
        Command::Contact(a) => contact::run(a),
        Command::Dice(a) => dice::run(a),
        Command::Forum(a) => forum::run(a),
        Command::Game(a) => game::run(a),
        Command::Gift(a) => gift::run(a),
        Command::Inline(a) => inline::run(a),
        Command::Invoice(a) => invoice::run(a),
        Command::Location(a) => location::run(a),
        Command::Message(a) => message::run(a),
        Command::Poll(a) => poll::run(a),
        Command::Sticker(a) => sticker::run(a),
        Command::Venue(a) => venue::run(a),
        Command::Webhook(a) => webhook::run(a),
    }
}
