import React, { useState, useEffect } from 'react';
import { categoryService, type Category } from '@/api/categoryService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Tag, Loader2, ImageOff } from 'lucide-react';
import { CategoryFormModal } from '@/components/category/CategoryFormModal';
import { CategoryDeleteAlert } from '@/components/category/CategoryDeleteAlert';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | undefined>(undefined);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoryService.getCategories();
      setCategories(data.categories || []);
    } catch (err) {
      setError('Failed to fetch categories. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddClick = () => {
    setCategoryToEdit(undefined);
    setIsFormOpen(true);
  };

  const handleEditClick = (category: Category) => {
    setCategoryToEdit(category);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteOpen(true);
  };

  // Construct absolute URL if API returned a relative path, or display null
  // Assuming the backend is hosted on the proxy base for local dev
  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `/api${url}`; // Adjust if backend serves images directly from another root
  };

  return (
    <div className="flex-1 space-y-8 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expense Categories</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your spending categories here.
          </p>
        </div>
        <Button onClick={handleAddClick} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-card text-center p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Tag className="h-6 w-6" />
          </div>
          <p className="font-semibold text-lg text-foreground">No categories yet</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Create categories like "Groceries", "Rent", or "Entertainment" to organize your expenses.
          </p>
          <Button variant="outline" onClick={handleAddClick} className="mt-4">
            Create your first category
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((cat) => (
            <Card key={cat.id} className="group overflow-hidden transition-all hover:shadow-md hover:border-primary/40 relative">
              <CardContent className="p-0">
                <div className="flex items-start gap-4 p-5">
                  <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden border">
                    {cat.imageUrl ? (
                      <img
                        src={getImageUrl(cat.imageUrl)!}
                        alt={cat.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          // Fallback if image fails to load
                          (e.target as HTMLImageElement).src = ''; 
                          (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                        }}
                      />
                    ) : (
                      <ImageOff className="h-6 w-6 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2" title={cat.description}>
                      {cat.description || 'No description provided.'}
                    </p>
                  </div>
                </div>
                
                {/* Actions overlaid on hover for desktop, visible on mobile */}
                <div className="absolute top-2 right-2 flex gap-1 bg-background/80 backdrop-blur-sm rounded-md shadow-sm border opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 sm:opacity-0 opacity-100 p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => handleEditClick(cat)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteClick(cat)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchCategories}
        categoryToEdit={categoryToEdit}
      />
      
      <CategoryDeleteAlert
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={fetchCategories}
        category={categoryToDelete}
      />
    </div>
  );
};
