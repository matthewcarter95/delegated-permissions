import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Product, formatPrice } from '../stripe-config'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Alert, AlertDescription } from './ui/Alert'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async () => {
    if (!user) {
      setError('Please sign in to make a purchase')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('Please sign in to make a purchase')
        return
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: product.priceId,
          mode: product.mode,
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/products`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Failed to start checkout process')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-3xl font-bold text-green-600">
          {formatPrice(product.price, product.currency)}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {product.mode === 'subscription' ? 'per month' : 'one-time payment'}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        {error && (
          <Alert variant="destructive" className="w-full">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button 
          onClick={handlePurchase}
          disabled={loading || !user}
          className="w-full"
        >
          {loading ? 'Processing...' : `Purchase ${formatPrice(product.price, product.currency)}`}
        </Button>
        {!user && (
          <p className="text-sm text-gray-500 text-center">
            Please sign in to make a purchase
          </p>
        )}
      </CardFooter>
    </Card>
  )
}