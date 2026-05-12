/**
 * WhatsApp Bot Service
 * معالجة رسائل WhatsApp وإنشاء المنتجات
 */

import { Logger } from "@medusajs/framework/types"
import { createProductsWorkflow, createInventoryLevelsWorkflow } from "@medusajs/medusa/core-flows"
import { ProductStatus } from "@medusajs/framework/utils"
import axios from "axios"
import * as fs from "fs"
import * as path from "path"

interface WhatsAppMessage {
  from: string
  body: string
  mediaUrls: string[]
}

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

export default class WhatsAppBotService {
  protected logger_: Logger
  protected container_: any

  constructor(container: any) {
    this.container_ = container
    this.logger_ = container.logger
  }

  async handleMessage(message: WhatsAppMessage) {
    const { from, body, mediaUrls } = message
    
    // Get or create conversation state
    let state = conversationState.get(from) || { step: 'idle' }
    
    try {
      // Check if user is sending images
      if (mediaUrls.length > 0) {
        await this.handleImages(from, mediaUrls, state)
        return
      }
      
      // Handle text commands
      const command = body.trim().toLowerCase()
      
      if (command === 'منتج جديد' || command === 'منتج' || command === 'new product') {
        await this.startNewProduct(from)
      } else if (state.step === 'awaiting_product_info') {
        await this.parseProductInfo(from, body)
      } else if (command === 'مساعدة' || command === 'help') {
        await this.sendHelp(from)
      } else {
        await this.sendWelcome(from)
      }
    } catch (error) {
      this.logger_.error(`Error handling message: ${error.message}`)
      await this.sendMessage(from, `❌ حصل خطأ: ${error.message}`)
    }
  }

  async startNewProduct(from: string) {
    conversationState.set(from, { step: 'awaiting_product_info' })
    
    await this.sendMessage(from, `
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
30175
طقم شورت أولادي
220
اسود●بيج●بني
12
14
16
ملابس أطفال
\`\`\`
    `)
  }

  async parseProductInfo(from: string, body: string) {
    const lines = body.trim().split('\n').map(l => l.trim()).filter(l => l)
    
    if (lines.length < 4) {
      await this.sendMessage(from, '❌ معلومات ناقصة! ابعت على الأقل: الكود، الاسم، السعر، والصنف')
      return
    }
    
    const code = lines[0]
    const title = lines[1]
    const price = parseFloat(lines[2])
    
    if (isNaN(price) || price <= 0) {
      await this.sendMessage(from, '❌ السعر مش صحيح! لازم يكون رقم أكبر من صفر')
      return
    }
    
    // Parse colors (line with ●)
    let colors: string[] = []
    let sizes: string[] = []
    let category = 'Uncategorized'
    
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i]
      
      if (line.includes('●')) {
        // Colors line
        colors = line.split('●').map(c => c.trim()).filter(c => c)
      } else if (!isNaN(parseFloat(line)) || line.match(/^(S|M|L|XL|XXL|\d+)$/i)) {
        // Size line
        sizes.push(line)
      } else {
        // Category (last text line)
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
    
    conversationState.set(from, {
      step: 'awaiting_images',
      productData
    })
    
    await this.sendMessage(from, `
✅ *تمام! استلمت المعلومات:*

📦 *المنتج:* ${title}
💰 *السعر:* ${price} جنيه
🎨 *الألوان:* ${colors.join(', ')}
📏 *المقاسات:* ${sizes.join(', ')}
📂 *الصنف:* ${category}

🔢 *عدد الـ Variants:* ${colors.length * sizes.length}

📸 *دلوقتي ابعت الصور* (حتى 10 صور)
أو ابعت *"بدون صور"* عشان تكمل بدون صور
    `)
  }

  async handleImages(from: string, mediaUrls: string[], state: any) {
    if (state.step !== 'awaiting_images') {
      await this.sendMessage(from, '❌ ابعت "منتج جديد" الأول')
      return
    }
    
    if (!state.productData) {
      await this.sendMessage(from, '❌ مافيش بيانات منتج! ابدأ من جديد بـ "منتج جديد"')
      return
    }
    
    await this.sendMessage(from, `⏳ جاري تحميل ${mediaUrls.length} صورة...`)
    
    // Download images
    const images = await this.downloadImages(mediaUrls, state.productData.code)
    
    // Create product
    await this.createProduct(from, state.productData, images)
    
    // Reset state
    conversationState.delete(from)
  }

  async downloadImages(mediaUrls: string[], productCode: string): Promise<string[]> {
    const imagesDir = path.join(process.cwd(), 'static', 'product-images')
    
    // Create directory if not exists
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true })
    }
    
    const savedImages: string[] = []
    
    for (let i = 0; i < mediaUrls.length; i++) {
      try {
        const url = mediaUrls[i]
        
        // Download image with Twilio auth
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          auth: {
            username: process.env.TWILIO_ACCOUNT_SID || '',
            password: process.env.TWILIO_AUTH_TOKEN || ''
          }
        })
        
        // Determine file extension
        const contentType = response.headers['content-type']
        let ext = '.jpg'
        if (contentType?.includes('png')) ext = '.png'
        else if (contentType?.includes('jpeg')) ext = '.jpeg'
        
        // Save image
        const filename = `${productCode}-${i + 1}${ext}`
        const filepath = path.join(imagesDir, filename)
        
        fs.writeFileSync(filepath, response.data)
        
        savedImages.push(`/static/product-images/${filename}`)
        
        this.logger_.info(`Downloaded image: ${filename}`)
      } catch (error) {
        this.logger_.error(`Error downloading image ${i}: ${error.message}`)
      }
    }
    
    return savedImages
  }

  async createProduct(from: string, productData: ProductData, images: string[]) {
    try {
      await this.sendMessage(from, '⏳ جاري إنشاء المنتج...')
      
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
      await this.sendMessage(from, `
✅ *تم إضافة المنتج بنجاح!*

📦 *${productData.title}*
💰 ${productData.price} جنيه
🎨 ${productData.colors.length} ألوان × ${productData.sizes.length} مقاسات = *${variants.length} variants*
📸 ${images.length} صور

🔗 *شوف المنتج:*
https://admin.mawgood.cloud/products/${product.id}

عايز تضيف منتج تاني؟ ابعت *"منتج جديد"*
      `)
      
    } catch (error) {
      this.logger_.error(`Error creating product: ${error.message}`)
      await this.sendMessage(from, `❌ فشل إنشاء المنتج: ${error.message}`)
    }
  }

  async sendMessage(to: string, message: string) {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID
      const authToken = process.env.TWILIO_AUTH_TOKEN
      const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'
      
      if (!accountSid || !authToken) {
        this.logger_.warn('Twilio credentials not configured')
        return
      }
      
      await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        new URLSearchParams({
          From: fromNumber,
          To: to,
          Body: message
        }),
        {
          auth: {
            username: accountSid,
            password: authToken
          }
        }
      )
      
      this.logger_.info(`Sent WhatsApp message to ${to}`)
    } catch (error) {
      this.logger_.error(`Error sending WhatsApp message: ${error.message}`)
    }
  }

  async sendWelcome(from: string) {
    await this.sendMessage(from, `
👋 *أهلاً بيك في Mawgood Bot!*

أنا هنا عشان أساعدك ترفع المنتجات بسهولة 🚀

*الأوامر المتاحة:*
• *منتج جديد* - إضافة منتج
• *مساعدة* - عرض المساعدة

ابعت *"منتج جديد"* عشان نبدأ!
    `)
  }

  async sendHelp(from: string) {
    await this.sendMessage(from, `
📚 *المساعدة*

*إضافة منتج:*
1. ابعت "منتج جديد"
2. ابعت معلومات المنتج (كود، اسم، سعر، ألوان، مقاسات، صنف)
3. ابعت الصور
4. تم! 🎉

*مثال:*
\`\`\`
30175
طقم شورت أولادي
220
اسود●بيج●بني
12
14
16
ملابس أطفال
\`\`\`

*ملاحظات:*
• افصل الألوان بـ ●
• كل مقاس في سطر
• ممكن ترفع حتى 10 صور

محتاج مساعدة؟ كلمنا على 01103490837
    `)
  }
}
