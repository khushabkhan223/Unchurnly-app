export default function CardUpdateSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-sm text-center p-8">
        <h1 className="text-xl font-semibold text-foreground mb-3">
          Payment method updated
        </h1>
        <p className="text-muted-foreground">
          Your payment method has been updated successfully. Your subscription will be
          retried shortly.
        </p>
      </div>
    </div>
  )
}
