
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useAuthorization } from '@/context/AuthorizationContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  AlertCircle, 
  Check, 
  Edit, 
  Filter, 
  Plus, 
  Search, 
  Shield, 
  Trash, 
  X 
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RolesResponse, PermissionsResponse, RoleType, PermissionType } from '@/types/api.types';

// Form schema
const roleFormSchema = z.object({
  name: z.string().min(2, {
    message: "Role name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  permissions: z.array(z.string()).optional(),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

const RoleManagement = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { hasRole } = useAuthorization();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingPermission, setIsAddingPermission] = useState(false);
  const [newPermission, setNewPermission] = useState('');
  const [permissionResource, setPermissionResource] = useState('');
  const [permissionAction, setPermissionAction] = useState('read');

  // Default form values
  const defaultValues: Partial<RoleFormValues> = {
    name: '',
    description: '',
    isDefault: false,
    permissions: [],
  };

  // Initialize form
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues,
  });

  // Redirect if not authenticated or not admin
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    if (!hasRole('admin')) {
      navigate('/dashboard');
      toast.error('You do not have permission to access this page');
      return;
    }
  }, [isAuthenticated, hasRole, navigate]);

  // Fetch roles
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery<RolesResponse>({
    queryKey: ['roles'],
    queryFn: async () => api.iam.getAllRoles(),
  });

  // Fetch permissions
  const { data: permissionsData, isLoading: isLoadingPermissions } = useQuery<PermissionsResponse>({
    queryKey: ['permissions'],
    queryFn: async () => api.iam.getAllPermissions(),
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: (data: RoleFormValues) => api.iam.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role created successfully');
      form.reset();
      setIsCreating(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to create role: ${error.message}`);
    }
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: (data: { id: string, role: RoleFormValues }) => 
      api.iam.updateRole(data.id, data.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role updated successfully');
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to update role: ${error.message}`);
    }
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => api.iam.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete role: ${error.message}`);
    }
  });

  // Create permission mutation
  const createPermissionMutation = useMutation({
    mutationFn: (data: any) => api.iam.createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permission created successfully');
      setIsAddingPermission(false);
      setNewPermission('');
      setPermissionResource('');
      setPermissionAction('read');
    },
    onError: (error: any) => {
      toast.error(`Failed to create permission: ${error.message}`);
    }
  });

  // Filter roles by search term
  const filteredRoles = rolesData?.roles?.filter((role: RoleType) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      role.name.toLowerCase().includes(searchLower) ||
      (role.description && role.description.toLowerCase().includes(searchLower))
    );
  });

  // Handler functions
  const onSubmit = (data: RoleFormValues) => {
    createRoleMutation.mutate(data);
  };

  const handleUpdateRole = (data: RoleFormValues) => {
    if (selectedRole) {
      updateRoleMutation.mutate({ id: selectedRole._id, role: data });
    }
  };

  const handleDeleteRole = (id: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      deleteRoleMutation.mutate(id);
    }
  };

  const setupRoleEdit = (role: RoleType) => {
    setSelectedRole(role);
    form.reset({
      name: role.name,
      description: role.description || '',
      isDefault: role.isDefault || false,
      permissions: role.permissions || [],
    });
    setIsEditing(true);
  };

  const handleCreatePermission = () => {
    if (!newPermission || !permissionResource) {
      toast.error('Permission name and resource are required');
      return;
    }

    const permissionData = {
      name: newPermission,
      description: `Permission to ${permissionAction} ${permissionResource}`,
      resource: permissionResource,
      action: permissionAction
    };

    createPermissionMutation.mutate(permissionData);
  };

  const addPermissionToRole = (permission: string) => {
    const currentPermissions = form.getValues('permissions') || [];
    if (!currentPermissions.includes(permission)) {
      form.setValue('permissions', [...currentPermissions, permission]);
    }
  };

  const removePermissionFromRole = (permission: string) => {
    const currentPermissions = form.getValues('permissions') || [];
    form.setValue('permissions', currentPermissions.filter(p => p !== permission));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <NavBar />
      <div className="container mx-auto pt-20 pb-10 px-4">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Role Management</CardTitle>
                <CardDescription>Manage roles and permissions</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search roles..."
                    className="pl-8 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={() => {
                  form.reset(defaultValues);
                  setIsCreating(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingRoles ? (
              <div className="flex justify-center p-8">
                <div className="flex flex-col items-center space-y-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Loading roles...</p>
                </div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Default</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles?.map((role: RoleType) => (
                      <TableRow key={role._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                            {role.name}
                          </div>
                        </TableCell>
                        <TableCell>{role.description || '-'}</TableCell>
                        <TableCell>
                          {role.isDefault ? (
                            <Badge variant="outline" className="bg-primary/10 text-primary">Default</Badge>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-md">
                            {role.permissions?.length > 0 ? (
                              role.permissions.map((permission: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {permission}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground">No permissions</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setupRoleEdit(role)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteRole(role._id)}
                              className="text-destructive hover:text-destructive/90"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredRoles?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <AlertCircle className="h-8 w-8 mb-2" />
                            <p>No roles found</p>
                            {searchTerm && (
                              <p className="text-sm">Try a different search term</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Create Role Dialog */}
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>
                    Add a new role with specific permissions
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Editor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the role and its purpose" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isDefault"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Default Role</FormLabel>
                            <FormDescription>
                              Automatically assign this role to new users
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Permissions</Label>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          type="button"
                          onClick={() => setIsAddingPermission(true)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          New Permission
                        </Button>
                      </div>
                      
                      <div className="border rounded-md p-4 max-h-40 overflow-y-auto">
                        {form.watch('permissions')?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {form.watch('permissions')?.map((permission, index) => (
                              <Badge key={index} variant="secondary" className="pr-1">
                                {permission}
                                <button
                                  type="button"
                                  onClick={() => removePermissionFromRole(permission)}
                                  className="ml-1 rounded-full p-0.5 hover:bg-muted"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground py-4">
                            No permissions added
                          </div>
                        )}
                      </div>
                      
                      <div className="border rounded-md">
                        <div className="p-3 border-b bg-muted/40">
                          <h4 className="font-medium text-sm">Available Permissions</h4>
                        </div>
                        <div className="p-2 max-h-40 overflow-y-auto">
                          {isLoadingPermissions ? (
                            <div className="flex justify-center py-4">
                              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary"></div>
                            </div>
                          ) : permissionsData?.permissions?.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                              {permissionsData.permissions.map((permission: PermissionType) => (
                                <Button
                                  key={permission._id}
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="justify-start text-xs"
                                  disabled={form.watch('permissions')?.includes(permission.name)}
                                  onClick={() => addPermissionToRole(permission.name)}
                                >
                                  {form.watch('permissions')?.includes(permission.name) ? (
                                    <Check className="h-3 w-3 mr-1 text-green-600" />
                                  ) : (
                                    <Plus className="h-3 w-3 mr-1" />
                                  )}
                                  {permission.name}
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground py-4">
                              No permissions available
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCreating(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Create Role</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {/* Edit Role Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Edit Role</DialogTitle>
                  <DialogDescription>
                    Update role details and permissions
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleUpdateRole)} className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Editor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the role and its purpose" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isDefault"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Default Role</FormLabel>
                            <FormDescription>
                              Automatically assign this role to new users
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Permissions</Label>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          type="button"
                          onClick={() => setIsAddingPermission(true)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          New Permission
                        </Button>
                      </div>
                      
                      <div className="border rounded-md p-4 max-h-40 overflow-y-auto">
                        {form.watch('permissions')?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {form.watch('permissions')?.map((permission, index) => (
                              <Badge key={index} variant="secondary" className="pr-1">
                                {permission}
                                <button
                                  type="button"
                                  onClick={() => removePermissionFromRole(permission)}
                                  className="ml-1 rounded-full p-0.5 hover:bg-muted"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground py-4">
                            No permissions added
                          </div>
                        )}
                      </div>
                      
                      <div className="border rounded-md">
                        <div className="p-3 border-b bg-muted/40">
                          <h4 className="font-medium text-sm">Available Permissions</h4>
                        </div>
                        <div className="p-2 max-h-40 overflow-y-auto">
                          {isLoadingPermissions ? (
                            <div className="flex justify-center py-4">
                              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary"></div>
                            </div>
                          ) : permissionsData?.permissions?.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                              {permissionsData.permissions.map((permission: PermissionType) => (
                                <Button
                                  key={permission._id}
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="justify-start text-xs"
                                  disabled={form.watch('permissions')?.includes(permission.name)}
                                  onClick={() => addPermissionToRole(permission.name)}
                                >
                                  {form.watch('permissions')?.includes(permission.name) ? (
                                    <Check className="h-3 w-3 mr-1 text-green-600" />
                                  ) : (
                                    <Plus className="h-3 w-3 mr-1" />
                                  )}
                                  {permission.name}
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground py-4">
                              No permissions available
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Update Role</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {/* Add Permission Dialog */}
            <Dialog open={isAddingPermission} onOpenChange={setIsAddingPermission}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Permission</DialogTitle>
                  <DialogDescription>
                    Add a new permission that can be assigned to roles
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="permission-name">Permission Name</Label>
                    <Input
                      id="permission-name"
                      placeholder="e.g. view_dashboard"
                      value={newPermission}
                      onChange={(e) => setNewPermission(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="resource">Resource</Label>
                    <Input
                      id="resource"
                      placeholder="e.g. dashboard"
                      value={permissionResource}
                      onChange={(e) => setPermissionResource(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="action">Action</Label>
                    <Select
                      value={permissionAction}
                      onValueChange={setPermissionAction}
                    >
                      <SelectTrigger id="action">
                        <SelectValue placeholder="Select an action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="create">Create</SelectItem>
                        <SelectItem value="read">Read</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                        <SelectItem value="delete">Delete</SelectItem>
                        <SelectItem value="manage">Manage (All)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddingPermission(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePermission}>
                    Create Permission
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleManagement;
