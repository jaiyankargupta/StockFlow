import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-6xl font-bold text-neutral-200 dark:text-neutral-800 mb-4">404</p>
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Page not found</h1>
      <p className="text-sm text-neutral-500 mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/"><Button icon={<Home className="w-3.5 h-3.5" />} variant="outline">Back to Dashboard</Button></Link>
    </div>
  );
}
