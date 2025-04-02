
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Permission {
  name: string;
  description?: string;
  resource?: string;
  action?: string;
}

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
}

interface RoleEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
  onSuccess: () => void;
}

const RoleEditDialog: React.FC<RoleEditDialogProps> = ({
  open,
  onOpenChange,
  role,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isDefault: false,
    permissions: [] as string[]
  });
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const isEditMode = !!role;

  // Fetch available permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      setIsFetching(true);
      try {
        const response = await api.iam.getAllPermissions();
        setAvailablePermissions(response.permissions);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        toast.error("Failed to load permissions");
      } finally {
        setIsFetching(false);
      }
    };

    if (open) {
      fetchPermissions();
    }
  }, [open]);

  // Set form data when role is provided
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
        isDefault: role.isDefault || false,
        permissions: role.permissions || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        isDefault: false,
        permissions: []
      });
    }
  }, [role, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handlePermissionToggle = (permissionName: string, checked: boolean) => {
    setFormData(prev => {
      if (checked) {
        return { ...prev, permissions: [...prev.permissions, permissionName] };
      } else {
        return { ...prev, permissions: prev.permissions.filter(p => p !== permissionName) };
      }
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    setIsLoading(true);
    try {
      if (isEditMode && role) {
        await api.iam.updateRole(role._id, formData);
        toast.success("Role updated successfully");
      } else {
        await api.iam.createRole(formData);
        toast.success("Role created successfully");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error(isEditMode ? "Failed to update role" : "Failed to create role");
    } finally {
      setIsLoading(false);
    }
  };

  // Group permissions by resource
  const groupedPermissions: Record<string, Permission[]> = {};
  availablePermissions.forEach(permission => {
    const resource = permission.resource || 'General';
    if (!groupedPermissions[resource]) {
      groupedPermissions[resource] = [];
    }
    groupedPermissions[resource].push(permission);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Role' : 'Create New Role'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Edit role details and permissions' 
              : 'Create a new role with specific permissions'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="Admin, Editor, etc."
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="col-span-3"
              placeholder="Role description..."
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right">
              <Label htmlFor="isDefault">Default Role</Label>
            </div>
            <div className="flex items-center space-x-2 col-span-3">
              <Checkbox
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => handleCheckboxChange('isDefault', !!checked)}
              />
              <Label htmlFor="isDefault" className="text-sm font-normal">
                Assign to new users automatically
              </Label>
            </div>
          </div>
          
          <Separator className="my-2" />
          
          <div className="grid grid-cols-4 gap-4">
            <div className="text-right pt-2">
              <Label>Permissions</Label>
            </div>
            
            {isFetching ? (
              <div className="col-span-3 flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : availablePermissions.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                No permissions available
              </div>
            ) : (
              <ScrollArea className="h-72 col-span-3 border rounded-md p-4">
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([resource, permissions]) => (
                    <div key={resource} className="space-y-2">
                      <h4 className="font-medium text-sm">{resource}</h4>
                      <div className="ml-2 space-y-1">
                        {permissions.map((permission) => (
                          <div key={permission.name} className="flex items-center space-x-2">
                            <Checkbox
                              id={`permission-${permission.name}`}
                              checked={formData.permissions.includes(permission.name)}
                              onCheckedChange={(checked) => 
                                handlePermissionToggle(permission.name, !!checked)
                              }
                            />
                            <Label 
                              htmlFor={`permission-${permission.name}`}
                              className="text-sm font-normal"
                            >
                              {permission.name}
                              {permission.description && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  {permission.description}
                                </span>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !formData.name.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              isEditMode ? 'Update Role' : 'Create Role'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoleEditDialog;
