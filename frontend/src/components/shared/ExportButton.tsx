import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { downloadCsv } from '@/lib/utils';

interface ExportButtonProps { onExport: () => Promise<string>; filename: string; }

export function ExportButton({ onExport, filename }: ExportButtonProps) {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    try {
      setLoading(true);
      const csv = await onExport();
      downloadCsv(csv, filename);
      success('Export downloaded successfully');
    } catch {
      error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={handle} loading={loading}>
      Export CSV
    </Button>
  );
}
