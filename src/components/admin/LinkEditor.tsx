import { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Plus, GripVertical } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function LinkEditor() {
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState<Link | null>(null);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: links, isLoading } = useQuery({
    queryKey: ['admin-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('position', { ascending: true });
      
      if (error) throw error;
      return data as Link[];
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: async (newLink: Partial<Link>) => {
      const maxPosition = Math.max(...(links?.map(l => l.position) || [0]));
      const { data, error } = await supabase
        .from('links')
        .insert({
          ...newLink,
          position: maxPosition + 1,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-links'] });
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('Link created successfully!');
      setIsDialogOpen(false);
      setEditingLink(null);
    },
    onError: (error) => {
      toast.error('Failed to create link: ' + error.message);
    },
  });

  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Link> }) => {
      const { data, error } = await supabase
        .from('links')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-links'] });
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('Link updated successfully!');
      setIsDialogOpen(false);
      setEditingLink(null);
    },
    onError: (error) => {
      toast.error('Failed to update link: ' + error.message);
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-links'] });
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('Link deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete link: ' + error.message);
    },
  });

  const reorderLinksMutation = useMutation({
    mutationFn: async (reorderedLinks: Link[]) => {
      // Update positions for all links
      const updates = reorderedLinks.map((link, index) => ({
        id: link.id,
        position: index + 1,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('links')
          .update({ position: update.position })
          .eq('id', update.id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-links'] });
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast.success('Links reordered successfully!');
    },
    onError: (error) => {
      toast.error('Failed to reorder links: ' + error.message);
    },
  });

  const handleSave = (formData: FormData) => {
    const linkData = {
      title: formData.get('title') as string,
      url: formData.get('url') as string || null,
      description: formData.get('description') as string || null,
      icon_value: formData.get('icon_value') as string,
      is_active: formData.get('is_active') === 'on',
    };

    if (editingLink) {
      updateLinkMutation.mutate({ id: editingLink.id, updates: linkData });
    } else {
      createLinkMutation.mutate(linkData);
    }
  };

  const openEditDialog = (link?: Link) => {
    setEditingLink(link || null);
    setIsDialogOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, link: Link) => {
    setDraggedItem(link);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, linkId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOver(linkId);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDrop = (e: React.DragEvent, targetLink: Link) => {
    e.preventDefault();
    setDraggedOver(null);

    if (!draggedItem || draggedItem.id === targetLink.id) {
      setDraggedItem(null);
      return;
    }

    if (!links) return;

    const draggedIndex = links.findIndex(link => link.id === draggedItem.id);
    const targetIndex = links.findIndex(link => link.id === targetLink.id);

    const reorderedLinks = [...links];
    const [removed] = reorderedLinks.splice(draggedIndex, 1);
    reorderedLinks.splice(targetIndex, 0, removed);

    reorderLinksMutation.mutate(reorderedLinks);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedOver(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manage Links</CardTitle>
            <CardDescription>
              Add, edit, and reorder your links by dragging and dropping
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openEditDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form action={handleSave}>
                <DialogHeader>
                  <DialogTitle>
                    {editingLink ? 'Edit Link' : 'Add New Link'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingLink ? 'Update your link details' : 'Create a new link for your profile'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      defaultValue={editingLink?.title || ''}
                      placeholder="e.g., Instagram"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      name="url"
                      type="url"
                      defaultValue={editingLink?.url || ''}
                      placeholder="https://instagram.com/yourusername"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={editingLink?.description || ''}
                      placeholder="A brief description of this link"
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="icon_value">Icon</Label>
                    <Select name="icon_value" defaultValue={editingLink?.icon_value || 'ExternalLink'}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an icon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mail">Email</SelectItem>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="Twitter">Twitter</SelectItem>
                        <SelectItem value="Linkedin">LinkedIn</SelectItem>
                        <SelectItem value="Github">GitHub</SelectItem>
                        <SelectItem value="Youtube">YouTube</SelectItem>
                        <SelectItem value="Facebook">Facebook</SelectItem>
                        <SelectItem value="Smartphone">Mobile App</SelectItem>
                        <SelectItem value="Globe">Website</SelectItem>
                        <SelectItem value="ExternalLink">External Link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      name="is_active"
                      defaultChecked={editingLink?.is_active !== false}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={createLinkMutation.isPending || updateLinkMutation.isPending}>
                    {createLinkMutation.isPending || updateLinkMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {links?.map((link) => (
            <div
              key={link.id}
              draggable
              onDragStart={(e) => handleDragStart(e, link)}
              onDragOver={(e) => handleDragOver(e, link.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, link)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-move ${
                draggedOver === link.id ? 'border-primary bg-primary/5' : ''
              } ${draggedItem?.id === link.id ? 'opacity-50' : ''}`}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium truncate">{link.title}</h4>
                  {!link.is_active && (
                    <span className="px-2 py-1 text-xs bg-muted rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {link.url || 'No URL set'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {link.click_count} clicks
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditDialog(link);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this link?')) {
                      deleteLinkMutation.mutate(link.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          
          {!links?.length && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No links yet. Create your first link!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}