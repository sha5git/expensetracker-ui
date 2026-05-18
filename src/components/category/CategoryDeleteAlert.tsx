import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { categoryService, type Category } from '@/api/categoryService';

interface CategoryDeleteAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: Category | null;
}

export const CategoryDeleteAlert: React.FC<CategoryDeleteAlertProps> = ({
  isOpen,
  onClose,
  onSuccess,
  category,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent modal closing before async action completes
    
    if (!category) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      await categoryService.deleteCategory(category.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      // Backend might throw a constraint error if expenses are linked
      setError(err?.response?.data?.message || 'Unable to delete category. It might be linked to existing expenses.');
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isDeleting) {
      onClose();
      setError(null);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              This action will permanently delete the category{' '}
              <span className="font-semibold text-foreground">{category?.name}</span>.
            </p>
            {error && (
              <p className="font-medium text-destructive mt-2">
                {error}
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
