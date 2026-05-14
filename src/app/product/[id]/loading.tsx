export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-charcoal/40">Loading product...</p>
      </div>
    </div>
  );
}