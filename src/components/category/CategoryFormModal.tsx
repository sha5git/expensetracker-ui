import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ImageOff } from 'lucide-react';
import { categoryService, type Category, type CategoryDTO } from '@/api/categoryService';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryToEdit?: Category;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categoryToEdit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // Image handling states
  const [imageType, setImageType] = useState<'upload' | 'url'>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [deleteImage, setDeleteImage] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!categoryToEdit;

  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        setName(categoryToEdit.name);
        setDescription(categoryToEdit.description || '');
      } else {
        setName('');
        setDescription('');
      }
      // Reset image states
      setImageType('upload');
      setImageFile(null);
      setImageUrl('');
      setDeleteImage(false);
      setError(null);
    }
  }, [isOpen, categoryToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Build the DTO
    const dto: CategoryDTO = {
      name: name.trim(),
      description: description.trim(),
      deleteImage: deleteImage,
    };

    // If providing a new string URL
    if (imageType === 'url' && imageUrl.trim()) {
      dto.imageUrl = imageUrl.trim();
      dto.deleteImage = false; // Override delete if they provided a new URL
    }

    // Determine if we have a file to upload
    const fileToUpload = imageType === 'upload' && imageFile ? imageFile : undefined;
    if (fileToUpload) {
      dto.deleteImage = false; // Override delete if they provided a new file
    }

    try {
      if (isEditing) {
        await categoryService.updateCategory(categoryToEdit.id, dto, fileToUpload);
      } else {
        await categoryService.createCategory(dto, fileToUpload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  const resolveImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `/api${url}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'Add Category'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details or image of your category.'
              : 'Create a new spending category. Click save when you\'re done.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              placeholder="e.g., Groceries"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g., Daily food items"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Existing Image Preview (Only when Editing and not deleted) */}
          {isEditing && categoryToEdit?.imageUrl && !deleteImage ? (
            <div className="space-y-2 pt-2 border-t mt-4">
              <Label>Current Image</Label>
              <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-md border">
                <div className="h-14 w-14 rounded-md overflow-hidden border bg-background flex items-center justify-center shrink-0">
                  <img 
                    src={resolveImageUrl(categoryToEdit.imageUrl)!} 
                    alt="Current" 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => setDeleteImage(true)}
                    disabled={isLoading}
                  >
                    Remove Image
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Image Upload / URL Input (When creating, or replacing/deleted) */
            <div className="space-y-3 pt-2 border-t mt-4">
              <Label>Image (Optional)</Label>
              <Tabs 
                value={imageType} 
                onValueChange={(v) => setImageType(v as 'upload' | 'url')}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-3">
                  <TabsTrigger value="upload" disabled={isLoading}>Upload File</TabsTrigger>
                  <TabsTrigger value="url" disabled={isLoading}>Image URL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-2 mt-0">
                  <Input
                    id="imageFile"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    className="cursor-pointer file:text-primary file:font-medium file:cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">Upload a PNG or JPG file.</p>
                </TabsContent>
                
                <TabsContent value="url" className="space-y-2 mt-0">
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://example.com/icon.png"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">Paste a direct link to an image.</p>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
