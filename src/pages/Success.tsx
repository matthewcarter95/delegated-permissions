import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Alert, AlertDescription } from '../components/ui/Alert'

export function Success() {
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const sessionIdParam = urlParams.get('session_id')
    setSessionId(sessionIdParam)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl text-green-600">
              Payment Successful!
            </CardTitle>
            <CardDescription>
              Thank you for your purchase. Your payment has been processed successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {sessionId && (
              <Alert>
                <AlertDescription>
                  <strong>Session ID:</strong> {sessionId}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-3">
              <p className="text-gray-600">
                You will receive a confirmation email shortly with your purchase details.
              </p>
              <p className="text-gray-600">
                If you have any questions, please don't hesitate to contact our support team.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/products'}
              >
                Browse More Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}