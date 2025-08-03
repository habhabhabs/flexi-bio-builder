import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, ImageIcon, Link } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ImageUploadProps {
  currentImage?: string | null;
  onImageChange: (imageUrl: string) => void;
  label?: string;
  className?: string;
}

export function ImageUpload({ 
  currentImage, 
  onImageChange, 
  label = "Image",
  className = ""
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState(currentImage || '');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    onImageChange(url);
  };

  const validateImageUrl = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      
      // Timeout after 5 seconds
      setTimeout(() => resolve(false), 5000);
    });
  };

  const handleUrlSubmit = async () => {
    if (!imageUrl.trim()) {
      onImageChange('');
      return;
    }

    try {
      // Basic URL validation
      new URL(imageUrl);
      
      setIsUploading(true);
      const isValid = await validateImageUrl(imageUrl);
      
      if (isValid) {
        onImageChange(imageUrl);
        toast.success('Image URL validated successfully!');
      } else {
        toast.error('Invalid image URL or image failed to load');
      }
    } catch (error) {
      toast.error('Please enter a valid URL');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64 for preview (in a real app, you'd upload to a service)
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageUrl(result);
        onImageChange(result);
        setIsUploading(false);
        toast.success('Image uploaded successfully!');
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload image');
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setImageUrl('');
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Image removed');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label className="text-sm font-medium">{label}</Label>
      
      {/* Current Image Preview */}
      {imageUrl && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border"
                  onError={() => {
                    toast.error('Image failed to load');
                    setImageUrl('');
                  }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={clearImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Current Image</p>
                <p className="text-xs text-muted-foreground truncate">
                  {imageUrl.startsWith('data:') ? 'Uploaded file' : imageUrl}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Methods */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            type="button"
            variant={uploadMethod === 'url' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMethod('url')}
          >
            <Link className="w-4 h-4 mr-2" />
            URL
          </Button>
          <Button
            type="button"
            variant={uploadMethod === 'upload' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMethod('upload')}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>

        {uploadMethod === 'url' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleUrlSubmit}
                disabled={isUploading}
                size="sm"
              >
                {isUploading ? 'Validating...' : 'Set'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a direct link to an image (jpg, png, gif, webp)
            </p>
          </div>
        )}

        {uploadMethod === 'upload' && (
          <div className="space-y-2">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Choose File'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max size: 5MB. Supported: JPG, PNG, GIF, WebP
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Alert>
        <AlertDescription className="text-xs">
          <strong>Note:</strong> For production use, consider using image hosting services like Cloudinary, AWS S3, or Imgur for better performance and reliability.
        </AlertDescription>
      </Alert>
    </div>
  );
}