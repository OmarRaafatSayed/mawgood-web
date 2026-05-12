/**
 * WhatsApp Bot Service Loader
 */

import { asFunction } from "awilix"
import WhatsAppBotService from "../services/whatsapp-bot"

export default async function whatsappBotLoader({ container }) {
  container.register({
    whatsappBotService: asFunction((cradle) => new WhatsAppBotService(cradle)).singleton()
  })
}
