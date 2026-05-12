/**
 * Telegram Bot Service
 * معالجة رسائل Telegram وإنشاء المنتجات
 */

import { Logger } from "@medusajs/framework/types"
import { createProductsWorkflow, createInventoryLevelsWorkflow } from "@medusajs/medusa/core-flows"
import { ProductStatus } from "@medusajs/framework/utils"
import axios from "axios"
import * as fs from "fs"
import * as path from "path"

interface ProductData {
  code: string
  title: string
  price: number
  colors: string[]
  sizes: string[]
  category: string
}

// Store conversation state per user
const conversationState = new Map<string, {
  step: 'idle' | 'awaiting_product_info' | 'awaiting_images'
  productData?: ProductData
  images?: string[]
}>()

export default class TelegramBotService {
  protected logger_: Logger
  protected container_: any
  protected botToken_: string
  protected apiUrl_: string

  constructor(container: any) {
    this.container_ = container
    this.logger_ = container.logger
    this.botToken_ = process.env.TELEGRAM_BOT_TOKEN || ''
    this.apiUrl_ = `https://api.telegram.org/bot${this.botToken_}`
  }

  async handleUpdate(update: any) {
    try {
      // Handle message
      if (update.message) {
        const message = update.message
        const chatId = message.chat.id
        const userId = message.from.id
        
        // Handle photos
        if (message.photo && message.photo.length > 0) {
          await this.handlePhotos(chatId, userId, message.photo)
          return
        }
        
        // Handle text
        if (message.text) {
          await this.handleText(chatId, userId, message.text)
          return
        }
      }
    } catch (error) {
      this.logger_.error(`Error handling update: ${error.message}`)
    }
  }

  async handleText(chatId: number, userId: number, text: string) {
    const state = conversationState.get(userId.toString()) || { step: 'idle' }
    
    const command = text.trim().toLowerCase()
    
    if (command === '/start') {
      await this.sendWelcome(chatId)
    } else if (command === '/new_product' || command === 'منتج جديد') {
      await this.startNewProduct(chatId, userId)
    } else if (command === '/help' || command === 'مساعدة') {
      await this.sendHelp(chatId)
    } else if (state.step === 'awaiting_product_info') {
      await this.parseProductInfo(chatId, userId, text)
    } else if (state.step === 'awaiting_images') {
      if (command === 'بدون صور' || command === 'skip') {
        await this.createProduct(chatId, userId, state.productData!, [])
        conversationState.delete(userId.toString())
      } else {
        await this.sendMessage(chatId, '📸 ابعت الصور دلوقتي (حتى 10 صور في رسالة واحدة)')
      }
    } else {
      await this.sendWelcome(chatId)
    }
  }

  async startNewProduct(chatId: number, userId: number) {
    conversationState.set(userId.toString(), { step: 'awaiting_product_info' })
    
    await this.sendMessage(chatId, `
🎉 *أهلاً! هضيف منتج جديد*

ابعت المعلومات دي (كل واحد في سطر):

1️⃣ *الكود*
2️⃣ *اسم المنتج*
3️⃣ *السعر* (بالجنيه)
4️⃣ *الألوان* (افصل بـ ●)
5️⃣ *المقاسات* (كل واحد في سطر)
6️⃣ *الصنف*

*مثال:*
\`\`\`
30999
تيشرت تجربة
150
اسود●ابيض●احمر
S
M
L
XL
تيشرتات
\`\`\`
    `, true)
  }

  async parseProductInfo(chatId: number, userId: number, text: string) {
    const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l)
    
    if (lines.length < 4) {
      await this.sendMessage(chatId, '❌ معلومات ناقصة! ابعت على الأقل: الكود، الاسم، السعر، والصنف')
      return
    }
    
    const code = lines[0]
    const title = lines[1]
    const price = parseFloat(lines[2])
    
    if (isNaN(price) || price <= 0) {
      await this.sendMessage(chatId, '❌ السعر مش صحيح! لازم يكون رقم أكبر من صفر')
      return
    }
    
    // Parse colors (line with ●)
    let colors: string[] = []
    let sizes: string[] = []
    let category = 'Uncategorized'
    
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i]
      
      if (line.includes('●')) {
        colors = line.split('●').map(c => c.trim()).filter(c => c)
      } else if (!isNaN(parseFloat(line)) || line.match(/^(S|M|L|XL|XXL|\d+)$/i)) {
        sizes.push(line)
      } else {
        category = line
      }
    }
    
    const productData: ProductData = {
      code,
      title,
      price,
      colors: colors.length > 0 ? colors : ['Default'],
      sizes: sizes.length > 0 ? sizes : ['One Size'],
      category
    }
    
    conversationState.set(userId.toString(), {
      step: 'awaiting_images',
      productData,
      images: []
    })
    
    await this.sendMessage(chatId, `
✅ *تمام! استلمت المعلومات:*

📦 *المنتج:* ${title}
💰 *السعر:* ${price} جنيه
🎨 *الألوان:* ${colors.join(', ')}
📏 *المقاسات:* ${sizes.join(', ')}
📂 *الصنف:* ${category}

🔢 *عدد الـ Variants:* ${colors.length * sizes.length}

📸 *دلوقتي ابعت الصور* (حتى 10 صور في رسالة واحدة)
أو ابعت *"بدون صور"* عشان تكمل بدون صور
    `, true)
  }

  async handlePhotos(chatId: number, userId: number, photos: any[]) {
    const state = conversationState.get(userId.toString())
    
    if (!state || state.step !== 'awaiting_images') {
      await this.sendMessage(chatId, '❌ ابعت /new_product الأول')
      return
    }
    
    if (!state.productData) {
      await this.sendMessage(chatId, '❌ مافيش بيانات منتج! ابدأ من جديد بـ /new_product')
      return
    }
    
    await this.sendMessage(chatId, `⏳ جاري تحميل ${photos.length} صورة...`)
    
    // Get largest photo (last one in array)
    const photo = photos[photos.length - 1]
    
    // Download photo
    const imageUrl = await this.downloadPhoto(photo.file_id, state.productData.code, state.images?.length || 0)
    
    if (imageUrl) {
      if (!state.images) state.images = []
      state.images.push(imageUrl)
      
      conversationState.set(userId.toString(), state)
      
      await this.sendMessage(chatId, `✅ تم تحميل الصورة ${state.images.length}\n\nابعت صور تانية أو ابعت "تم" عشان تخلص`)
    } else {
      await this.sendMessage(chatId, '❌ فشل تحميل الصورة')
    }
  }

  async downloadPhoto(fileId: string, productCode: string, index: number): Promise<string | null> {
    try {
      // Get file path
      const fileResponse = await axios.get(`${this.apiUrl_}/getFile?file_id=${fileId}`)
      const filePath = fileResponse.data.result.file_path
      
      // Download file
      const fileUrl = `https://api.telegram.org/file/bot${this.botToken_}/${filePath}`
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' })
      
      // Save file
      const imagesDir = path.join(process.cwd(), 'static', 'product-images')
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true })
      }
      
      const ext = path.extname(filePath) || '.jpg'
      const filename = `${productCode}-${index + 1}${ext}`
      const filepath = path.join(imagesDir, filename)
      
      fs.writeFileSync(filepath, response.data)
      
      this.logger_.info(`Downloaded photo: ${filename}`)
      
      return `/static/product-images/${filename}`
    } catch (error) {
      this.logger_.error(`Error downloading photo: ${error.message}`)
      return null
    }
  }

  async createProduct(chatId: number, userId: number, productData: ProductData, images: string[]) {
    try {
      await this.sendMessage(chatId, '⏳ جاري إنشاء المنتج...')
      
      const query = this.container_.resolve('query')
      
      // Get sales channel
      const { data: salesChannels } = await query.graph({
        entity: 'sales_channel',
        fields: ['id'],
        filters: {}
      })
      const salesChannelId = salesChannels[0]?.id
      
      // Get stock location
      const { data: stockLocations } = await query.graph({
        entity: 'stock_location',
        fields: ['id'],
        filters: {}
      })
      const stockLocationId = stockLocations[0]?.id
      
      // Get or create category
      const productModuleService = this.container_.resolve('product')
      const existingCats = await productModuleService.listProductCategories(
        { name: productData.category },
        { select: ['id', 'name'] }
      )
      
      let categoryId = existingCats[0]?.id
      
      if (!categoryId) {
        const newCat = await productModuleService.createProductCategories({
          name: productData.category,
          is_active: true,
          is_internal: false
        })
        categoryId = newCat.id
      }
      
      // Build variants
      const variants = []
      for (const color of productData.colors) {
        for (const size of productData.sizes) {
          variants.push({
            title: `${color} / ${size}`,
            sku: `${productData.code}-${color.substring(0, 3).toUpperCase()}-${size}`,
            options: {
              Color: color,
              Size: size
            },
            prices: [{
              amount: Math.round(productData.price * 100),
              currency_code: 'egp'
            }]
          })
        }
      }
      
      // Build options
      const options = []
      if (productData.colors.length > 1 || productData.colors[0] !== 'Default') {
        options.push({
          title: 'Color',
          values: productData.colors
        })
      }
      if (productData.sizes.length > 1 || productData.sizes[0] !== 'One Size') {
        options.push({
          title: 'Size',
          values: productData.sizes
        })
      }
      
      // Create product
      const productPayload = {
        title: productData.title,
        handle: `product-${productData.code}`,
        status: ProductStatus.PUBLISHED,
        description: productData.title,
        category_ids: categoryId ? [categoryId] : [],
        sales_channels: salesChannelId ? [{ id: salesChannelId }] : [],
        options: options.length > 0 ? options : undefined,
        variants,
        images: images.map(url => ({ url }))
      }
      
      const { result } = await createProductsWorkflow(this.container_).run({
        input: { products: [productPayload] }
      })
      
      const product = result[0]
      
      // Set inventory
      if (stockLocationId && product.variants) {
        const inventoryItems = []
        for (const variant of product.variants) {
          if (variant.inventory_items?.[0]?.inventory_item_id) {
            inventoryItems.push({
              inventory_item_id: variant.inventory_items[0].inventory_item_id,
              location_id: stockLocationId,
              stocked_quantity: 100
            })
          }
        }
        
        if (inventoryItems.length > 0) {
          await createInventoryLevelsWorkflow(this.container_).run({
            input: { inventory_levels: inventoryItems }
          })
        }
      }
      
      // Send success message
      await this.sendMessage(chatId, `
✅ *تم إضافة المنتج بنجاح!*

📦 *${productData.title}*
💰 ${productData.price} جنيه
🎨 ${productData.colors.length} ألوان × ${productData.sizes.length} مقاسات = *${variants.length} variants*
📸 ${images.length} صور

🔗 *شوف المنتج:*
https://admin.mawgood.cloud/products/${product.id}

عايز تضيف منتج تاني؟ ابعت */new\\_product*
      `, true)
      
    } catch (error) {
      this.logger_.error(`Error creating product: ${error.message}`)
      await this.sendMessage(chatId, `❌ فشل إنشاء المنتج: ${error.message}`)
    }
  }

  async sendMessage(chatId: number, text: string, markdown: boolean = false) {
    try {
      await axios.post(`${this.apiUrl_}/sendMessage`, {
        chat_id: chatId,
        text: text,
        parse_mode: markdown ? 'Markdown' : undefined
      })
    } catch (error) {
      this.logger_.error(`Error sending message: ${error.message}`)
    }
  }

  async sendWelcome(chatId: number) {
    await this.sendMessage(chatId, `
👋 *أهلاً بيك في Mawgood Bot!*

أنا هنا عشان أساعدك ترفع المنتجات بسهولة 🚀

*الأوامر المتاحة:*
• */new\\_product* - إضافة منتج جديد
• */help* - عرض المساعدة

ابعت */new\\_product* عشان نبدأ!
    `, true)
  }

  async sendHelp(chatId: number) {
    await this.sendMessage(chatId, `
📚 *المساعدة*

*إضافة منتج:*
1. ابعت /new\\_product
2. ابعت معلومات المنتج
3. ابعت الصور (حتى 10 صور)
4. تم! 🎉

*مثال:*
\`\`\`
30999
تيشرت تجربة
150
اسود●ابيض●احمر
S
M
L
XL
تيشرتات
\`\`\`

*ملاحظات:*
• افصل الألوان بـ ●
• كل مقاس في سطر
• ممكن ترفع حتى 10 صور في رسالة واحدة

محتاج مساعدة؟ كلمنا على 01103490837
    `, true)
  }
}
