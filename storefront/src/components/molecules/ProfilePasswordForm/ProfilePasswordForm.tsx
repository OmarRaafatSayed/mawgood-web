"use client"

import { Button, Card } from "@/components/atoms"
import { LabeledInput } from "@/components/cells"
import { zodResolver } from "@hookform/resolvers/zod"
import { FieldError, FieldValues, FormProvider, useForm, useFormContext, UseFormReturn } from "react-hook-form"
import { ProfilePasswordFormData, profilePasswordSchema } from "./schema"
import { useState } from "react"
import { updateCustomerPassword } from "@/lib/data/customer"
import { Heading, toast } from "@medusajs/ui"
import LocalizedClientLink from "../LocalizedLink/LocalizedLink"
import { PasswordValidator } from "@/components/cells/PasswordValidator/PasswordValidator"
import { useTranslations } from "next-intl"

export const ProfilePasswordForm = ({ token }: { token?: string }) => {
  const form = useForm<ProfilePasswordFormData>({
    resolver: zodResolver(profilePasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  })
  return <FormProvider {...form}><Form form={form} token={token} /></FormProvider>
}

const Form = ({ form, token }: { form: UseFormReturn<ProfilePasswordFormData>; token?: string }) => {
  const [success, setSuccess] = useState(false)
  const [confirmPasswordError, setConfirmPasswordError] = useState<FieldError | undefined>(undefined)
  const [newPasswordError, setNewPasswordError] = useState({ isValid: false, lower: false, upper: false, "8chars": false, symbolOrDigit: false })
  const t = useTranslations('user')
  const tAuth = useTranslations('auth')
  const tErrors = useTranslations('errors')
  const tSuccess = useTranslations('success')

  const { register, handleSubmit, formState: { errors } } = useFormContext()

  const updatePassword = async (data: FieldValues) => {
    if (form.getValues("confirmPassword") !== form.getValues("newPassword")) {
      setConfirmPasswordError({ message: tErrors('passwordsDoNotMatch'), type: "custom" } as FieldError)
      return
    }
    setConfirmPasswordError(undefined)
    if (newPasswordError.isValid) {
      try {
        const res = await updateCustomerPassword(data.newPassword, token!)
        if (res.success) setSuccess(true)
        else toast.error(res.error || tErrors('somethingWentWrong'))
      } catch (err) { return }
    }
  }

  return success ? (
    <div className="p-4">
      <Heading level="h1" className="uppercase heading-md text-primary text-center">{tSuccess('passwordChanged')}</Heading>
      <p className="text-center my-8">{t('changePassword')}</p>
      <LocalizedClientLink href="/login">
        <Button className="uppercase py-3 px-6 !font-semibold w-full" size="large">{tAuth('signIn')}</Button>
      </LocalizedClientLink>
    </div>
  ) : (
    <form className="flex flex-col gap-4 px-4" onSubmit={handleSubmit(updatePassword)}>
      <Heading level="h1" className="uppercase heading-md text-primary">{t('changePassword')}</Heading>
      <p className="text-secondary label-md">{t('securitySettings')}</p>
      <LabeledInput label={t('newPassword')} type="password" error={errors.newPassword as FieldError} {...register("newPassword")} />
      <PasswordValidator password={form.watch("newPassword")} setError={setNewPasswordError} />
      <LabeledInput label={t('confirmNewPassword')} type="password" error={(confirmPasswordError || errors.confirmPassword) as FieldError} {...register("confirmPassword")} />
      <Button className="w-full my-4 uppercase">{t('changePassword')}</Button>
    </form>
  )
}
