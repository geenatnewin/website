'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { insertGig, insertExpense } from './db'
import { computeSessionToken, LEDGER_COOKIE } from './token'
import { categoryConfig } from './categories'
import { getClientIP, checkLockout, recordFailedAttempt, recordSuccessfulLogin } from './security'

export async function login(formData) {
  const ip = getClientIP(headers())

  const lockout = await checkLockout(ip)
  if (lockout.locked) {
    redirect('/ledger/login?locked=1')
  }

  const password = formData.get('password')
  if (password !== process.env.LEDGER_PASSWORD) {
    const result = await recordFailedAttempt(ip)
    if (result.lockedOut) {
      redirect('/ledger/login?locked=1')
    }
    redirect(`/ledger/login?error=1&remaining=${result.remaining}`)
  }

  await recordSuccessfulLogin(ip)
  const token = await computeSessionToken()
  cookies().set(LEDGER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 90,
    path: '/',
  })
  redirect('/ledger')
}

export async function logout() {
  cookies().delete(LEDGER_COOKIE)
  redirect('/ledger/login')
}

export async function addGig(formData) {
  await insertGig({
    gigDate: formData.get('gigDate'),
    client: formData.get('client'),
    gigType: formData.get('gigType'),
    gigTypeOther: formData.get('gigTypeOther'),
    grossPayment: formData.get('grossPayment'),
    paymentMethod: formData.get('paymentMethod'),
    datePaid: formData.get('datePaid'),
    status: formData.get('status'),
    mileage: formData.get('mileage'),
    notes: formData.get('notes'),
  })
  revalidatePath('/ledger')
  revalidatePath('/ledger/report')
}

export async function addExpense(formData) {
  const gigIdRaw = formData.get('gigId')
  const category = formData.get('category')
  const config = categoryConfig(category)

  const meta = {}
  if (config?.extraField) {
    const value = formData.get(config.extraField.name)
    if (value) meta[config.extraField.name] = value
  }

  await insertExpense({
    gigId: gigIdRaw ? Number(gigIdRaw) : null,
    expenseDate: formData.get('expenseDate'),
    category,
    description: formData.get('description'),
    amount: formData.get('amount'),
    vendor: formData.get('vendor'),
    meta,
  })
  revalidatePath('/ledger')
  revalidatePath('/ledger/report')
}
