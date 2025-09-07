import React from 'react'
import { useSubscription } from '../hooks/useSubscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { Alert, AlertDescription } from './ui/Alert'

export function SubscriptionStatus() {
  const { subscription, loading, isActive, isPastDue, isCanceled, getActiveProductName } = useSubscription()

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>No active subscription</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const productName = getActiveProductName()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Status</CardTitle>
        <CardDescription>
          {productName && `Current plan: ${productName}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isActive && (
          <Alert variant="success">
            <AlertDescription>
              Your subscription is active and in good standing.
            </AlertDescription>
          </Alert>
        )}
        
        {isPastDue && (
          <Alert variant="destructive">
            <AlertDescription>
              Your subscription is past due. Please update your payment method.
            </AlertDescription>
          </Alert>
        )}
        
        {isCanceled && (
          <Alert variant="default">
            <AlertDescription>
              Your subscription has been canceled.
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <div>Status: <span className="font-medium">{subscription.subscription_status}</span></div>
          {subscription.current_period_end && (
            <div>
              Next billing: <span className="font-medium">
                {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
              </span>
            </div>
          )}
          {subscription.payment_method_brand && subscription.payment_method_last4 && (
            <div>
              Payment method: <span className="font-medium">
                {subscription.payment_method_brand} ending in {subscription.payment_method_last4}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}