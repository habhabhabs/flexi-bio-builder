import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminButton() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <Link to="/admin">
        <Button variant="admin" size="sm" className="backdrop-blur-sm">
          <Settings className="w-4 h-4" />
          Admin
        </Button>
      </Link>
    </div>
  );
}