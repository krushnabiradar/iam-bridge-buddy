import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, FileText, UserPlus } from 'lucide-react';
import EmployeeForm from './EmployeeForm';
import EmployeeDetails from './EmployeeDetails';
import DocumentUpload from './DocumentUpload';

const EmployeeManagement = () => {
  const { user } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);

  // Check permissions based on user role
  const canAddItems = user?.role === 'admin' || user?.role === 'hr';
  const canViewAllEmployees = user?.role === 'admin' || user?.role === 'hr';

  // Get employees data
  const employeesQuery = useQuery({
    queryKey: ['employees'],
    queryFn: () => api.iam.getEmployees(),
    enabled: !!user && ['admin', 'hr', 'manager'].includes(user.role || ''),
  });

  // Filter employees for managers to only show their team
  const filteredEmployees = employeesQuery.data?.employees.filter((employee: any) => {
    if (canViewAllEmployees) return true;
    return user?.role === 'manager' && 
           user?.departmentId && 
           employee.department?._id === user.departmentId;
  }) || [];

  // Handle employee deletion
  const handleDeleteEmployee = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.iam.deleteEmployee(id);
        toast.success('Employee deleted successfully');
        employeesQuery.refetch();
      } catch (error) {
        console.error('Delete employee error:', error);
        toast.error('Failed to delete employee');
      }
    }
  };

  if (employeesQuery.isLoading) {
    return <div className="flex justify-center p-8">Loading employees...</div>;
  }

  if (employeesQuery.error) {
    return <div className="text-red-500 p-8">Error loading employees data</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Employee Management</CardTitle>
            <CardDescription>Add, edit, and manage employee profiles</CardDescription>
          </div>
          {canAddItems && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus size={16} />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new employee.
                  </DialogDescription>
                </DialogHeader>
                <EmployeeForm 
                  onSuccess={() => {
                    setIsAddDialogOpen(false);
                    employeesQuery.refetch();
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((employee: any) => (
                <TableRow key={employee._id}>
                  <TableCell>{employee.employeeId}</TableCell>
                  <TableCell>{employee.userId?.name}</TableCell>
                  <TableCell>{employee.department?.name || 'Not assigned'}</TableCell>
                  <TableCell>{employee.position?.title || 'Not assigned'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      employee.status === 'active' ? 'bg-green-100 text-green-800' :
                      employee.status === 'onLeave' ? 'bg-yellow-100 text-yellow-800' :
                      employee.status === 'terminated' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {employee.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setIsDetailsDialogOpen(true);
                        }}
                      >
                        <FileText size={16} />
                      </Button>
                      
                      {(canAddItems || (user?.role === 'manager' && user?.departmentId === employee.department?._id)) && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil size={16} />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setIsDocumentDialogOpen(true);
                            }}
                          >
                            <Plus size={16} />
                          </Button>
                        </>
                      )}
                      
                      {canAddItems && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteEmployee(employee._id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Employee Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <EmployeeDetails 
              employee={selectedEmployee} 
              onClose={() => setIsDetailsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <EmployeeForm 
              employee={selectedEmployee}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                employeesQuery.refetch();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Document Upload Dialog */}
      <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload documents for the employee.
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <DocumentUpload 
              employeeId={selectedEmployee._id}
              onSuccess={() => {
                setIsDocumentDialogOpen(false);
                employeesQuery.refetch();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EmployeeManagement;
