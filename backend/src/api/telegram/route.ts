/**
 * Telegram Bot Webhook
 * استقبال رسائل Telegram ومعالجتها
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  
  try {
    const update = req.body
    
    logger.info(`Telegram update: ${JSON.stringify(update)}`)
    
    // Get Telegram service
    const telegramService = req.scope.resolve("telegramBotService")
    
    // Process update
    await telegramService.handleUpdate(update)
    
    res.status(200).json({ ok: true })
  } catch (error) {
    logger.error(`Telegram webhook error: ${error.message}`)
    res.status(200).json({ ok: true }) // Always return 200 to Telegram
  }
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  res.status(200).send("Telegram Bot is running")
}
