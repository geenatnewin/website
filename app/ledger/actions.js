'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { insertGig, updateGig, deleteGig, insertExpense, updateExpense, deleteExpense } from './db'
import { computeSessionToken, LEDGER_COOKIE } from './token'
import { categoryConfig } from './categories'
import { getClientIP, checkLockout, recordFailedAttempt, recordSuccessfulLogin } from './security'

export async function login(formData) {
  const ip = getClientIP(headers())

  const lockout = await checkLockout(ip)
  if (lockout.locked) {
    redirect('/ledger/login?locked=1')
  }

  const username = formData.get('username')
  const password = formData.get('password')
  if (username !== process.env.LEDGER_USERNAME || password !== process.env.LEDGER_PASSWORD) {
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

export async function editGig(id, formData) {
  await updateGig(id, {
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

export async function removeGig(id) {
  await deleteGig(id)
  revalidatePath('/ledger')
  revalidatePath('/ledger/report')
}

function addMonthsISO(dateStr, months) {
  if (!dateStr) return null
  const d = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) return null
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

function extraFieldsMeta(category, formData) {
  const config = categoryConfig(category)
  const meta = {}
  if (config?.extraFields) {
    for (const field of config.extraFields) {
      const value = formData.get(field.name)
      if (value) meta[field.name] = value
    }
  }
  // Insurance: an annual policy's end date is always 12 months after its start — don't
  // make the user enter it, just derive it (the field isn't even shown in the form).
  if (category === 'insurance' && meta.billingFrequency === 'Annual' && meta.effectiveStart) {
    meta.effectiveEnd = addMonthsISO(meta.effectiveStart, 12)
  }
  return meta
}

function expenseFieldsFromFormData(formData) {
  const gigIdRaw = formData.get('gigId')
  const category = formData.get('category')
  const meta = extraFieldsMeta(category, formData)
  // Insurance has no standalone date field — the policy's effective start date doubles as the expense date.
  const expenseDate = category === 'insurance' ? meta.effectiveStart : formData.get('expenseDate')

  return {
    gigId: gigIdRaw ? Number(gigIdRaw) : null,
    expenseDate,
    category,
    description: formData.get('description'),
    amount: formData.get('amount'),
    vendor: formData.get('vendor'),
    meta,
  }
}

export async function addExpense(formData) {
  const category = formData.get('category')
  const gigIdRaw = formData.get('gigId')
  const gigId = gigIdRaw ? Number(gigIdRaw) : null
  const expenseDate = formData.get('expenseDate')
  const description = formData.get('description')

  const mealAmounts = formData.getAll('mealAmount')
  const supplyAmounts = formData.getAll('supplyAmount')

  if (category === 'meals' && mealAmounts.some(Boolean)) {
    const meta = extraFieldsMeta(category, formData)
    const mealVendors = formData.getAll('mealVendor')

    for (let i = 0; i < mealAmounts.length; i++) {
      if (!mealAmounts[i]) continue
      await insertExpense({
        gigId,
        expenseDate,
        category,
        description,
        amount: mealAmounts[i],
        vendor: mealVendors[i] || null,
        meta,
      })
    }
  } else if (category === 'supplies' && supplyAmounts.some(Boolean)) {
    const vendor = formData.get('vendor')
    const supplyItems = formData.getAll('supplyItem')
    const supplyCapitalFlags = formData.getAll('supplyCapitalAsset')

    for (let i = 0; i < supplyAmounts.length; i++) {
      if (!supplyAmounts[i]) continue
      const meta = {}
      if (supplyItems[i]) meta.item = supplyItems[i]
      if (supplyCapitalFlags[i] === 'true') meta.capitalAsset = 'true'
      await insertExpense({
        gigId,
        expenseDate,
        category,
        description,
        amount: supplyAmounts[i],
        vendor,
        meta,
      })
    }
  } else {
    await insertExpense(expenseFieldsFromFormData(formData))
  }
  revalidatePath('/ledger')
  revalidatePath('/ledger/report')
}

export async function editExpense(id, formData) {
  await updateExpense(id, expenseFieldsFromFormData(formData))
  revalidatePath('/ledger')
  revalidatePath('/ledger/report')
}

export async function removeExpense(id) {
  await deleteExpense(id)
  revalidatePath('/ledger')
  revalidatePath('/ledger/report')
}
