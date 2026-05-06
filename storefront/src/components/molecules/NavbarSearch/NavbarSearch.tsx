"use client"

import { SearchIcon } from "@/icons"
import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"
import clsx from "clsx"
import { useTranslations } from "next-intl"

interface Props {
  className?: string
}

export const NavbarSearch = ({ className }: Props) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = useTranslations('common')

  const [search, setSearch] = useState(searchParams.get("query") || "")

  const handleSearch = () => {
    if (search.trim()) {
      router.push(`/categories?query=${encodeURIComponent(search.trim())}`)
    } else {
      router.push(`/categories`)
    }
  }

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleSearch()
  }

  return (
    <form 
      className={clsx("relative w-full max-w-2xl group", className)} 
      onSubmit={submitHandler}
    >
      <input
        type="search"
        placeholder={t('search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full h-11 pr-12 pl-4 rounded-full border-2 border-surface-200 focus:border-brand-400 focus:outline-none transition-all duration-200 text-primary bg-surface-50 group-hover:bg-white"
      />
      <button
        type="submit"
        aria-label={t('search')}
        className="absolute right-1 top-1 bottom-1 px-4 bg-brand-400 hover:bg-brand-500 text-white rounded-full transition-colors duration-200 flex items-center justify-center"
      >
        <SearchIcon color="white" size={20} />
      </button>
    </form>
  )
}
