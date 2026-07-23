import { useEffect, useState } from 'react'
import './App.css'

interface Product {
  id: string
  name: string
  calories: number
  protein: number
  fat: number
  carbs: number
}

type ProductFormData = Omit<Product, 'id'>

const API_URL = 'http://localhost:3000/api/products'

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState<boolean>(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  })

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(API_URL)
      if (!response.ok) {
        throw new Error(`Failed to fetch products (${response.status})`)
      }
      const data = await response.json()
      setProducts(data)
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const resetForm = () => {
    setFormData({
      name: '',
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    })
    setEditingProduct(null)
  }

  const toggleForm = () => {
    if (showForm) {
      resetForm()
    }
    setShowForm(!showForm)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      if (editingProduct) {
        const response = await fetch(`${API_URL}/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (!response.ok) {
          throw new Error(`Failed to update product (${response.status})`)
        }
      } else {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (!response.ok) {
          throw new Error(`Failed to create product (${response.status})`)
        }
      }
      resetForm()
      setShowForm(false)
      fetchProducts()
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving product.')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      calories: product.calories,
      protein: product.protein,
      fat: product.fat,
      carbs: product.carbs,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }
    setError(null)
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error(`Failed to delete product (${response.status})`)
      }
      fetchProducts()
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting product.')
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Calorie Tracker</h1>

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginBottom: '15px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={toggleForm}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {showForm ? 'Cancel' : 'Add New Product'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            border: '1px solid #ccc',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            backgroundColor: '#f9fafb',
            color: '#111827',
          }}
        >
          <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Calories:</label>
              <input
                type="number"
                name="calories"
                value={formData.calories}
                onChange={handleInputChange}
                step="any"
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Protein (g):</label>
              <input
                type="number"
                name="protein"
                value={formData.protein}
                onChange={handleInputChange}
                step="any"
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Fat (g):</label>
              <input
                type="number"
                name="fat"
                value={formData.fat}
                onChange={handleInputChange}
                step="any"
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Carbs (g):</label>
              <input
                type="number"
                name="carbs"
                value={formData.carbs}
                onChange={handleInputChange}
                step="any"
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              backgroundColor: '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {editingProduct ? 'Update Product' : 'Save Product'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', color: '#111827', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '10px' }}>Name</th>
              <th style={{ padding: '10px' }}>Calories</th>
              <th style={{ padding: '10px' }}>Protein (g)</th>
              <th style={{ padding: '10px' }}>Fat (g)</th>
              <th style={{ padding: '10px' }}>Carbs (g)</th>
              <th style={{ padding: '10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '10px', textAlign: 'center' }}>
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '10px' }}>{product.name}</td>
                  <td style={{ padding: '10px' }}>{product.calories}</td>
                  <td style={{ padding: '10px' }}>{product.protein}</td>
                  <td style={{ padding: '10px' }}>{product.fat}</td>
                  <td style={{ padding: '10px' }}>{product.carbs}</td>
                  <td style={{ padding: '10px' }}>
                    <button
                      onClick={() => handleEdit(product)}
                      style={{
                        marginRight: '8px',
                        padding: '4px 8px',
                        backgroundColor: '#eab308',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App
