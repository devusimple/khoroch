export interface Transaction {
    id: number
    type: "income" | "expense" | "transfer"
    amount: number
    wallet_id: number
    to_wallet_id?: number
    category_id?: number
    date: number
    note?: string
    attachment: string | null
    created_at: number
    updated_at: number
}

export interface Wallet {
    id: number
    name: string
    initial_amount: number
    current_amount: number
    created_at: number
    updated_at: number
}