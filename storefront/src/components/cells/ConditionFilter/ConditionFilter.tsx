"use client"

import { useTranslations } from "next-intl"
import { Accordion, FilterCheckboxOption } from "@/components/molecules"
import useFilters from "@/hooks/useFilters"

const conditionKeys = [
  { key: "New", amount: 78 },
  { key: "New - With tags", amount: 40 },
  { key: "Used - Excellent", amount: 7 },
  { key: "Used - Good", amount: 16 },
  { key: "Used - Fair", amount: 0 },
]

export const ConditionFilter = () => {
  const { updateFilters, isFilterActive } = useFilters("condition")
  const t = useTranslations('filters')

  return (
    <Accordion heading={t('condition')} data-testid="filter-condition">
      <ul className="px-4" data-testid="filter-condition-options">
        {conditionKeys.map(({ key, amount }) => (
          <li key={key} className="mb-4">
            <FilterCheckboxOption
              checked={isFilterActive(key)}
              disabled={Boolean(!amount)}
              onCheck={updateFilters}
              label={key}
              amount={amount}
              data-testid={`filter-condition-checkbox-${key.toLowerCase().replace(/\s+/g, '-')}`}
            />
          </li>
        ))}
      </ul>
    </Accordion>
  )
}
