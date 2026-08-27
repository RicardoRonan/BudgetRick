import { createClient } from '@supabase/supabase-js'
import { localDb } from '../services/dataService.js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

let supabase = null
let useLocal = true

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY)
}

export async function initSupabase() {
  if (!isSupabaseConfigured()) {
    useLocal = true
    return { mode: 'local', supabase: null }
  }

  supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  const { data: { session } } = await supabase.auth.getSession()
  useLocal = !session

  return { mode: session ? 'supabase' : 'local', supabase }
}

export function setDataMode(local) {
  useLocal = local
}

export function useSupabase() {
  return {
    isLocal: useLocal,
    supabase,
    setDataMode,
  }
}

function fromRow(row) {
  if (!row) return row
  const { created_at, updated_at, user_id, ...rest } = row
  return {
    ...rest,
    created: created_at,
    updated: updated_at,
    user_id,
  }
}

function toRow(data, userId) {
  const { created, updated, id, ...rest } = data
  const row = { ...rest }
  if (userId) row.user_id = userId
  return row
}

const TABLE_ORDER = {
  categories: 'sort_order',
  transactions: 'date',
  recurring: 'name',
  goals: 'name',
}

function createSupabaseCollection(table) {
  return {
    async getFullList() {
      const orderCol = TABLE_ORDER[table]
      let query = supabase.from(table).select('*')
      if (orderCol) {
        query = table === 'transactions'
          ? query.order(orderCol, { ascending: false })
          : query.order(orderCol, { ascending: true })
      }
      const { data, error } = await query
      if (error) throw error
      return (data || []).map(fromRow)
    },

    async getOne(id) {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single()
      if (error) throw error
      return fromRow(data)
    },

    async create(data) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: row, error } = await supabase
        .from(table)
        .insert(toRow(data, user.id))
        .select()
        .single()

      if (error) throw error
      return fromRow(row)
    },

    async update(id, data) {
      const { created, updated, user_id, id: _id, ...patch } = data
      const { data: row, error } = await supabase
        .from(table)
        .update(patch)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return fromRow(row)
    },

    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error
    },
  }
}

export function getCollection(name) {
  if (useLocal || !supabase) {
    return localDb[name]
  }
  return createSupabaseCollection(name)
}

export { supabase }
