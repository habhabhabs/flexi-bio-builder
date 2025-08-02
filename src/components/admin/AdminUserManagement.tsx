import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminUser, AvailableAuthUser } from '@/types/database';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Shield, ShieldCheck, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function AdminUserManagement() {
  const { adminUser, isSuperAdmin, createAdminUser, getAvailableAuthUsers } = useAdminAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'editor'>('admin');

  const { data: adminUsers, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AdminUser[];
    },
    enabled: !!adminUser,
  });

  const { data: availableUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['available-auth-users'],
    queryFn: async () => {
      const { data, error } = await getAvailableAuthUsers();
      if (error) throw error;
      return data as AvailableAuthUser[];
    },
    enabled: !!adminUser && isCreateDialogOpen,
  });

  const createUserMutation = useMutation({
    mutationFn: async ({ userId, email, role }: { userId: string; email: string; role: 'admin' | 'editor' }) => {
      const { data, error } = await createAdminUser(userId, email, role);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['available-auth-users'] });
      toast.success('Admin user created successfully!');
      setIsCreateDialogOpen(false);
      setSelectedUserId('');
      setSelectedUserEmail('');
      setNewUserRole('admin');
    },
    onError: (error: any) => {
      toast.error('Failed to create admin user: ' + error.message);
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('admin_users')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(`Admin user ${variables.is_active ? 'activated' : 'deactivated'} successfully!`);
    },
    onError: (error: any) => {
      toast.error('Failed to update admin user: ' + error.message);
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedUserEmail) {
      toast.error('Please select a user from the dropdown');
      return;
    }
    createUserMutation.mutate({ 
      userId: selectedUserId, 
      email: selectedUserEmail, 
      role: newUserRole 
    });
  };

  const handleUserSelection = (userId: string, email: string) => {
    setSelectedUserId(userId);
    setSelectedUserEmail(email);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'admin':
        return 'default';
      case 'editor':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <ShieldCheck className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      default:
        return <Edit className="w-4 h-4" />;
    }
  };

  if (!adminUser) {
    return (
      <Alert>
        <AlertDescription>You must be logged in to access user management.</AlertDescription>
      </Alert>
    );
  }

  if (!['super_admin', 'admin'].includes(adminUser.role)) {
    return (
      <Alert>
        <AlertDescription>You don't have permission to access user management.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Admin User Management
            </CardTitle>
            <CardDescription>
              Manage admin users and their permissions
            </CardDescription>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Admin User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Admin User</DialogTitle>
                <DialogDescription>
                  Grant admin access to an existing user. Users must have already signed up before they can be granted admin access.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="user-select">Select Existing User</Label>
                  {isLoadingUsers ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : (
                    <Select 
                      value={selectedUserId} 
                      onValueChange={(userId) => {
                        const user = availableUsers?.find(u => u.id === userId);
                        if (user) handleUserSelection(userId, user.email);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user to grant admin access" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers?.filter(user => !user.is_admin).map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex flex-col">
                              <span>{user.email}</span>
                              <span className="text-xs text-muted-foreground">
                                Joined: {new Date(user.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                        {availableUsers?.filter(user => !user.is_admin).length === 0 && (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No available users found. Users must sign up first.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  {selectedUserEmail && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedUserEmail}
                    </p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUserRole} onValueChange={(value: 'admin' | 'editor') => setNewUserRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false);
                    setSelectedUserId('');
                    setSelectedUserEmail('');
                    setNewUserRole('admin');
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createUserMutation.isPending || !selectedUserId}>
                    {createUserMutation.isPending ? 'Granting Access...' : 'Grant Admin Access'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading admin users...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 w-fit">
                        {getRoleIcon(user.role)}
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.last_login 
                        ? new Date(user.last_login).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {isSuperAdmin && user.id !== adminUser.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUserStatusMutation.mutate({
                            id: user.id,
                            is_active: !user.is_active
                          })}
                          disabled={toggleUserStatusMutation.isPending}
                        >
                          {user.is_active ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                
                {!adminUsers?.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No admin users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p><strong>Important:</strong> Users must first create an account through Supabase authentication before they can be granted admin access.</p>
          
          <div className="mt-4">
            <p><strong>Role Permissions:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Super Admin:</strong> Full access including user management</li>
              <li><strong>Admin:</strong> Can manage content and create new admin users</li>
              <li><strong>Editor:</strong> Can manage content only</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}