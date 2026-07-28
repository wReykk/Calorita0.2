import { useEffect, useState, type FormEvent } from 'react'
import apiClient from '../assets/api/client'

type Product = {
    id: number
    name: string
    calories?: number | null
    protein?: number | null
    fat?: number | null
    carbs?: number | null
    description?: string | null
}

type ProductFormState = {
    name: string
    calories: string
    protein: string
    fat: string
    carbs: string
}

type EditState = {
    productId: number | null
    values: ProductFormState
}

const emptyForm = {
    name: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
}

function Products() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [form, setForm] = useState<ProductFormState>(emptyForm)
    const [editState, setEditState] = useState<EditState>({ productId: null, values: emptyForm })

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await apiClient.get('/products')
                setProducts(response.data || [])
            } catch {
                setError('Failed to load products.')
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')

        try {
            const payload = {
                name: form.name,
                calories: Number(form.calories),
                protein: Number(form.protein),
                fat: Number(form.fat),
                carbs: Number(form.carbs),
            }

            const response = await apiClient.post('/products', payload)
            setProducts((prev) => [response.data, ...prev])
            setForm(emptyForm)
        } catch {
            setError('Failed to create product.')
        }
    }

    const handleDelete = async (productId: number) => {
        try {
            await apiClient.delete(`/products/${productId}`)
            setProducts((prev) => prev.filter((product) => product.id !== productId))
        } catch {
            setError('Failed to delete product.')
        }
    }

    const startEdit = (product: Product) => {
        setEditState({
            productId: product.id,
            values: {
                name: product.name,
                calories: String(product.calories ?? ''),
                protein: String(product.protein ?? ''),
                fat: String(product.fat ?? ''),
                carbs: String(product.carbs ?? ''),
            },
        })
    }

    const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')

        if (!editState.productId) {
            return
        }

        try {
            const payload = {
                name: editState.values.name,
                calories: Number(editState.values.calories),
                protein: Number(editState.values.protein),
                fat: Number(editState.values.fat),
                carbs: Number(editState.values.carbs),
            }

            const response = await apiClient.put(`/products/${editState.productId}`, payload)
            setProducts((prev) => prev.map((product) => (product.id === editState.productId ? response.data : product)))
            setEditState({ productId: null, values: emptyForm })
        } catch {
            setError('Failed to update product.')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Your Products</h1>
                    <p className="text-sm text-slate-600">Add a product and manage your nutrition list.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
                        <input
                            value={form.name}
                            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Calories</label>
                        <input
                            type="number"
                            min="0"
                            value={form.calories}
                            onChange={(event) => setForm((prev) => ({ ...prev, calories: event.target.value }))}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Protein</label>
                        <input
                            type="number"
                            min="0"
                            value={form.protein}
                            onChange={(event) => setForm((prev) => ({ ...prev, protein: event.target.value }))}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Fat</label>
                        <input
                            type="number"
                            min="0"
                            value={form.fat}
                            onChange={(event) => setForm((prev) => ({ ...prev, fat: event.target.value }))}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Carbs</label>
                        <input
                            type="number"
                            min="0"
                            value={form.carbs}
                            onChange={(event) => setForm((prev) => ({ ...prev, carbs: event.target.value }))}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700"
                >
                    Add product
                </button>
            </form>

            {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            ) : null}

            {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
                    Loading products...
                </div>
            ) : products.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
                    No products found.
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => (
                        <article key={product.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="h-40 bg-slate-100" />
                            <div className="space-y-3 p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <h2 className="text-lg font-semibold text-slate-900">{product.name}</h2>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => startEdit(product)}
                                            className="rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="rounded-full border border-red-200 px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {editState.productId === product.id ? (
                                    <form onSubmit={handleEditSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                        <div className="grid gap-2">
                                            <input
                                                value={editState.values.name}
                                                onChange={(event) => setEditState((prev) => ({ ...prev, values: { ...prev.values, name: event.target.value } }))}
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                                required
                                            />
                                            <div className="grid gap-2 sm:grid-cols-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={editState.values.calories}
                                                    onChange={(event) => setEditState((prev) => ({ ...prev, values: { ...prev.values, calories: event.target.value } }))}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                                    placeholder="Calories"
                                                    required
                                                />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={editState.values.protein}
                                                    onChange={(event) => setEditState((prev) => ({ ...prev, values: { ...prev.values, protein: event.target.value } }))}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                                    placeholder="Protein"
                                                    required
                                                />
                                            </div>
                                            <div className="grid gap-2 sm:grid-cols-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={editState.values.fat}
                                                    onChange={(event) => setEditState((prev) => ({ ...prev, values: { ...prev.values, fat: event.target.value } }))}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                                    placeholder="Fat"
                                                    required
                                                />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={editState.values.carbs}
                                                    onChange={(event) => setEditState((prev) => ({ ...prev, values: { ...prev.values, carbs: event.target.value } }))}
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                                    placeholder="Carbs"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                                            >
                                                Save
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditState({ productId: null, values: emptyForm })}
                                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : null}

                                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                                    <div className="rounded-lg bg-slate-50 p-2">
                                        <p className="text-xs uppercase tracking-wide text-slate-400">Calories</p>
                                        <p className="font-medium text-slate-900">{product.calories ?? 0}</p>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-2">
                                        <p className="text-xs uppercase tracking-wide text-slate-400">Protein</p>
                                        <p className="font-medium text-slate-900">{product.protein ?? 0}g</p>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-2">
                                        <p className="text-xs uppercase tracking-wide text-slate-400">Fat</p>
                                        <p className="font-medium text-slate-900">{product.fat ?? 0}g</p>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-2">
                                        <p className="text-xs uppercase tracking-wide text-slate-400">Carbs</p>
                                        <p className="font-medium text-slate-900">{product.carbs ?? 0}g</p>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Products
