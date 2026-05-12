/**
 * WhatsApp Bot Webhook
 * استقبال رسائل WhatsApp ومعالجتها
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  
  try {
    // Get message from Twilio
    const { From, Body, MediaUrl0, MediaUrl1, MediaUrl2, MediaUrl3, MediaUrl4, MediaUrl5 } = req.body
    
    logger.info(`WhatsApp message from ${From}: ${Body}`)
    
    // Get WhatsApp service
    const whatsappService = req.scope.resolve("whatsappBotService")
    
    // Process message
    await whatsappService.handleMessage({
      from: From,
      body: Body,
      mediaUrls: [MediaUrl0, MediaUrl1, MediaUrl2, MediaUrl3, MediaUrl4, MediaUrl5].filter(Boolean)
    })
    
    res.status(200).send("OK")
  } catch (error) {
    logger.error(`WhatsApp webhook error: ${error.message}`)
    res.status(500).json({ error: error.message })
  }
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  // Webhook verification
  res.status(200).send("WhatsApp Bot is running")
}
