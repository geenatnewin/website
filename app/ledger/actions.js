'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { insertGig, insertExpense } from './db'
import { computeSessionToken, LEDGER_COOKIE } from './token'

export async function login(formData) {
  const password = formData.get('password')
  if (password !== process.env.LEDGER_PASSWORD) {
    redirect('/ledger/login?error=1')
  }
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
  await insertExpense({
    gigId: gigIdRaw ? Number(gigIdRaw) : null,
    expenseDate: formData.get('expenseDate'),
    category: formData.get('category'),
    description: formData.get('description'),
    amount: formData.get('amount'),
    vendor: formData.get('vendor'),
  })
  revalidatePath('/ledger')
  revalidatePath('/ledger/report')
}
