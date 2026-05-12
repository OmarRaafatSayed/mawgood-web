/**
 * Telegram Bot Service Loader
 */

import { asFunction } from "awilix"
import TelegramBotService from "../services/telegram-bot"

export default async function telegramBotLoader({ container }) {
  container.register({
    telegramBotService: asFunction((cradle) => new TelegramBotService(cradle)).singleton()
  })
}
