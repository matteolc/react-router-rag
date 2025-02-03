import { Button } from '~/components/ui/button';
import { Download } from 'lucide-react';
import type { Row } from '@tanstack/react-table';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '~/components/ui/alert-dialog';

interface DataTableRowActionsProps<TData extends { 
  id: string;
  metadata: unknown;
  name?: string;
}> {
  row: Row<TData>;
}

export function DataTableRowActions<TData extends { 
  id: string;
  metadata: unknown;
  name?: string;
}>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [errorOpen, setErrorOpen] = useState(false);

  const handleDownload = async () => {
    try {
      // Verify the URL exists before creating the link
      const response = await fetch((row.original.metadata as { url: string }).url);
      if (!response.ok) throw new Error('File not found');

      // Proceed with download
      const link = document.createElement('a');
      link.href = (row.original.metadata as { url: string }).url;
      link.download = row.original.name || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      setErrorOpen(true);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        className="ml-auto flex h-8 w-8 p-0"
        onClick={handleDownload}
        title="Download"
      >
        <Download className="h-4 w-4" />
        <span className="sr-only">Download</span>
      </Button>
      
      <AlertDialog open={errorOpen} onOpenChange={setErrorOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Download Failed</AlertDialogTitle>
            <AlertDialogDescription>
              The file could not be found or downloaded. Please check the URL and try again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
