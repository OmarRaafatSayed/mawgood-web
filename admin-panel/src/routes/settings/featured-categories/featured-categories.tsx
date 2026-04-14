import { useState, useEffect } from 'react'
import { Container, Heading, Text, Button, Input, Label, Select, Table } from '@medusajs/ui'
import { Plus, Trash2, Edit2, GripVertical, Save, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface FeaturedCategory {
  id: string
  section_id: string
  name: string
  handle: string
  icon?: string
  image?: string
  position: number
  is_active: boolean
}

interface FeaturedCategorySection {
  id: string
  title: string
  title_ar: string
  view_all_link: string
  is_active: boolean
  position: number
  categories: FeaturedCategory[]
}

const DEFAULT_SECTIONS: FeaturedCategorySection[] = [
  {
    id: 'new-arrivals',
    title: 'New Arrivals',
    title_ar: 'وصل حديثاً',
    view_all_link: '/categories/new-arrivals',
    is_active: true,
    position: 0,
    categories: []
  },
  {
    id: 'best-sellers',
    title: 'Best Sellers',
    title_ar: 'الأكثر مبيعاً',
    view_all_link: '/categories/best-sellers',
    is_active: true,
    position: 1,
    categories: []
  },
  {
    id: 'trending',
    title: 'Trending Now',
    title_ar: 'الرائج الآن',
    view_all_link: '/categories/trending',
    is_active: true,
    position: 2,
    categories: []
  },
  {
    id: 'special-offers',
    title: 'Special Offers',
    title_ar: 'عروض خاصة',
    view_all_link: '/categories/special-offers',
    is_active: true,
    position: 3,
    categories: []
  },
  {
    id: 'premium-brands',
    title: 'Premium Brands',
    title_ar: 'علامات فاخرة',
    view_all_link: '/categories/premium',
    is_active: true,
    position: 4,
    categories: []
  },
  {
    id: 'seasonal',
    title: 'Seasonal Picks',
    title_ar: 'مختارات الموسم',
    view_all_link: '/categories/seasonal',
    is_active: true,
    position: 5,
    categories: []
  },
]

const CATEGORY_ICONS = [
  '📱', '👗', '👔', '🏠', '💄', '⚽', '🧸', '📚', '🚗', '🛒',
  '🐾', '💊', '💍', '🌿', '🎮', '🏃', '👕', '👠', '🏡', '💋',
  '🔥', '🛋️', '💅', '🏀', '🎯', '🏷️', '🏘️', '🎁', '🎽', '🎪',
  '💎', '👑', '🏰', '✨', '🏆', '⭐', '🍂', '🧥', '🎄', '🌸', '⛷️', '🎃'
]

export function FeaturedCategories() {
  const { t, i18n } = useTranslation()
  const [sections, setSections] = useState<FeaturedCategorySection[]>(DEFAULT_SECTIONS)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<{sectionId: string, categoryId: string} | null>(null)

  const handleAddCategory = (sectionId: string) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        const newCategory: FeaturedCategory = {
          id: `cat-${Date.now()}`,
          section_id: sectionId,
          name: '',
          name_ar: '',
          handle: '',
          icon: '📦',
          position: section.categories.length,
          is_active: true
        }
        return {
          ...section,
          categories: [...section.categories, newCategory]
        }
      }
      return section
    }))
    setExpandedSection(sectionId)
  }

  const handleUpdateCategory = (sectionId: string, categoryId: string, updates: Partial<FeaturedCategory>) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          categories: section.categories.map(cat =>
            cat.id === categoryId ? { ...cat, ...updates } : cat
          )
        }
      }
      return section
    }))
  }

  const handleDeleteCategory = (sectionId: string, categoryId: string) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          categories: section.categories.filter(cat => cat.id !== categoryId)
        }
      }
      return section
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: API call to save featured categories
      // await adminClient.post('/admin/featured-categories', { sections })
      console.log('Saving featured categories:', sections)
      alert('تم الحفظ بنجاح! / Saved successfully!')
    } catch (error) {
      console.error('Error saving:', error)
      alert('حدث خطأ أثناء الحفظ / Error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Container className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h2" className="text-xl font-bold">
            {i18n.language === 'ar' ? 'إدارة الأقسام المميزة' : 'Manage Featured Categories'}
          </Heading>
          <Text className="text-gray-500 mt-1">
            {i18n.language === 'ar' 
              ? 'قم بتخصيص الأقسام التي تظهر في الصفحة الرئيسية' 
              : 'Customize the categories sections that appear on the homepage'}
          </Text>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setSections(DEFAULT_SECTIONS)}>
            <X size={18} />
            {i18n.language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            <Save size={18} />
            {i18n.language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {sections.map((section, sectionIndex) => (
          <div
            key={section.id}
            className="border rounded-lg bg-white shadow-sm overflow-hidden"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
              <div className="flex items-center gap-3">
                <GripVertical size={20} className="text-gray-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{section.title_ar}</span>
                    <span className="text-gray-400">|</span>
                    <span className="font-medium text-gray-600">{section.title}</span>
                  </div>
                  <Text size="sm" className="text-gray-500">
                    {i18n.language === 'ar' ? 'رابط عرض الكل:' : 'View All Link:'} {section.view_all_link}
                  </Text>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {section.categories.length} {i18n.language === 'ar' ? 'أقسام' : 'categories'}
                </span>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                >
                  {expandedSection === section.id 
                    ? (i18n.language === 'ar' ? 'إخفاء' : 'Hide') 
                    : (i18n.language === 'ar' ? 'عرض' : 'Show')}
                </Button>
                <Button size="small" onClick={() => handleAddCategory(section.id)}>
                  <Plus size={16} />
                  {i18n.language === 'ar' ? 'إضافة قسم' : 'Add Category'}
                </Button>
              </div>
            </div>

            {/* Section Categories */}
            {expandedSection === section.id && (
              <div className="p-4">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>{i18n.language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}</Table.HeaderCell>
                      <Table.HeaderCell>{i18n.language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}</Table.HeaderCell>
                      <Table.HeaderCell>{i18n.language === 'ar' ? 'المعرف' : 'Handle'}</Table.HeaderCell>
                      <Table.HeaderCell>{i18n.language === 'ar' ? 'الأيقونة' : 'Icon'}</Table.HeaderCell>
                      <Table.HeaderCell className="text-right">{i18n.language === 'ar' ? 'إجراءات' : 'Actions'}</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {section.categories.length === 0 ? (
                      <Table.Row>
                        <Table.Cell colSpan={5} className="text-center py-8 text-gray-500">
                          {i18n.language === 'ar' 
                            ? 'لا توجد أقسام مميزة في هذا القسم. انقر على "إضافة قسم" للبدء.' 
                            : 'No featured categories in this section. Click "Add Category" to get started.'}
                        </Table.Cell>
                      </Table.Row>
                    ) : (
                      section.categories.map((category) => (
                        <Table.Row key={category.id}>
                          <Table.Cell>
                            <Input
                              value={category.name_ar || ''}
                              onChange={(e) => handleUpdateCategory(section.id, category.id, { name_ar: e.target.value })}
                              placeholder={i18n.language === 'ar' ? 'أدخل الاسم بالعربية' : 'Enter Arabic name'}
                              className="w-48"
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <Input
                              value={category.name || ''}
                              onChange={(e) => handleUpdateCategory(section.id, category.id, { name: e.target.value })}
                              placeholder={i18n.language === 'ar' ? 'أدخل الاسم بالإنجليزية' : 'Enter English name'}
                              className="w-48"
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <Input
                              value={category.handle || ''}
                              onChange={(e) => handleUpdateCategory(section.id, category.id, { handle: e.target.value })}
                              placeholder="category-handle"
                              className="w-40"
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <Select
                              value={category.icon || '📦'}
                              onValueChange={(value) => handleUpdateCategory(section.id, category.id, { icon: value })}
                              className="w-24"
                            >
                              <Select.Trigger>
                                <Select.Value />
                              </Select.Trigger>
                              <Select.Content>
                                {CATEGORY_ICONS.map(icon => (
                                  <Select.Item key={icon} value={icon}>
                                    {icon}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select>
                          </Table.Cell>
                          <Table.Cell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="small"
                                variant="secondary"
                                onClick={() => handleDeleteCategory(section.id, category.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      ))
                    )}
                  </Table.Body>
                </Table>
              </div>
            )}
          </div>
        ))}
      </div>
    </Container>
  )
}
