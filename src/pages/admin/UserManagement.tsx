
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
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  AlertCircle, 
  Check, 
  Filter, 
  Plus, 
  Search, 
  Shield, 
  UserCog, 
  X 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { UsersResponse, RolesResponse, UserType, RoleType } from '@/types/api.types';

const UserManagement = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { hasRole } = useAuthorization();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);

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

  const { data: usersData, isLoading: isLoadingUsers } = useQuery<UsersResponse>({
    queryKey: ['users'],
    queryFn: async () => api.iam.getUsersWithRoles(),
  });

  const { data: rolesData, isLoading: isLoadingRoles } = useQuery<RolesResponse>({
    queryKey: ['roles'],
    queryFn: async () => api.iam.getAllRoles(),
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string, isActive: boolean }) => 
      api.iam.updateUserStatus(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update user status: ${error.message}`);
    }
  });

  const assignRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string, roleId: string }) => 
      api.iam.assignRoleToUser(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role assigned successfully');
      setShowRoleDialog(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to assign role: ${error.message}`);
    }
  });

  const removeRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string, roleId: string }) => 
      api.iam.removeRoleFromUser(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role removed successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to remove role: ${error.message}`);
    }
  });

  const filteredUsers = usersData?.users?.filter((user: UserType) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  function getInitials(name: string) {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  function handleStatusToggle(userId: string, currentStatus: boolean) {
    updateUserStatusMutation.mutate({ userId, isActive: !currentStatus });
  }

  function handleAssignRole(roleId: string) {
    if (selectedUser) {
      assignRoleMutation.mutate({ userId: selectedUser._id, roleId });
    }
  }

  function handleRemoveRole(userId: string, roleId: string) {
    removeRoleMutation.mutate({ userId, roleId });
  }

  function openRoleDialog(user: UserType) {
    setSelectedUser(user);
    setShowRoleDialog(true);
  }

  function userHasRole(user: UserType, roleName: string) {
    return user.roles?.some((role: RoleType) => role.name === roleName);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <NavBar />
      <div className="container mx-auto pt-20 pb-10 px-4">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">User Management</CardTitle>
                <CardDescription>Manage users and their roles</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="flex justify-center p-8">
                <div className="flex flex-col items-center space-y-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Loading users...</p>
                </div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers?.map((user: UserType) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={user.isActive}
                              onCheckedChange={() => handleStatusToggle(user._id, user.isActive)}
                            />
                            <span className={user.isActive ? "text-green-600" : "text-red-600"}>
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles?.map((role: RoleType) => (
                              <Badge key={role._id} variant="outline" className="flex items-center gap-1">
                                {role.name}
                                <button
                                  onClick={() => handleRemoveRole(user._id, role._id)}
                                  className="ml-1 rounded-full p-0.5 hover:bg-muted"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-xs"
                              onClick={() => openRoleDialog(user)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Assign
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <UserCog className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <AlertCircle className="h-8 w-8 mb-2" />
                            <p>No users found</p>
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

            <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Role to User</DialogTitle>
                  <DialogDescription>
                    Select a role to assign to {selectedUser?.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  {isLoadingRoles ? (
                    <div className="flex justify-center p-4">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {rolesData?.roles?.map((role: RoleType) => {
                        const hasRole = selectedUser?.roles?.some((r: RoleType) => r._id === role._id);
                        
                        return (
                          <div key={role._id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                            <div className="flex items-center">
                              <Shield className="h-5 w-5 mr-2 text-muted-foreground" />
                              <div>
                                <h4 className="font-medium">{role.name}</h4>
                                <p className="text-sm text-muted-foreground">{role.description}</p>
                              </div>
                            </div>
                            <Button
                              variant={hasRole ? "ghost" : "secondary"}
                              size="sm"
                              disabled={hasRole}
                              onClick={() => handleAssignRole(role._id)}
                            >
                              {hasRole ? (
                                <Check className="h-4 w-4 mr-1 text-green-600" />
                              ) : (
                                <Plus className="h-4 w-4 mr-1" />
                              )}
                              {hasRole ? "Assigned" : "Assign"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;
