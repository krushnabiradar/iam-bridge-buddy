import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Create the form schema
const employeeFormSchema = z.object({
  userId: z.string().optional(),
  employeeId: z.string().min(1, "Employee ID is required"),
  department: z.string().optional(),
  position: z.string().optional(),
  manager: z.string().optional(),
  dateOfBirth: z.date().optional(),
  dateOfJoining: z.date(),
  contactInformation: z.object({
    phone: z.string().optional(),
    alternateEmail: z.string().email().optional().or(z.literal('')),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    }),
  }),
  emergencyContact: z.object({
    name: z.string().optional(),
    relationship: z.string().optional(),
    phone: z.string().optional(),
  }),
  status: z.enum(['active', 'onLeave', 'terminated', 'retired']).default('active'),
  bankDetails: z.object({
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
    bankName: z.string().optional(),
    ifscCode: z.string().optional(),
  }),
  leaveBalance: z.object({
    sick: z.number().min(0).default(10),
    casual: z.number().min(0).default(10),
    annual: z.number().min(0).default(15),
  }),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface EmployeeFormProps {
  employee?: any;
  onSuccess: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [users, setUsers] = useState<any[]>([]);
  const isEditMode = !!employee;

  // Get departments, positions, and employees for dropdowns
  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.iam.getDepartments(),
  });

  const positionsQuery = useQuery({
    queryKey: ['positions'],
    queryFn: () => api.iam.getPositions(),
  });

  const employeesQuery = useQuery({
    queryKey: ['employees'],
    queryFn: () => api.iam.getEmployees(),
  });

  // Fetch users only needed for adding new employees
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // In a real app, we would have an API endpoint to get users without employees
        // For now, we'll just mock this with a simple timeout
        setTimeout(() => {
          setUsers([
            { _id: '1', name: 'John Doe', email: 'john@example.com' },
            { _id: '2', name: 'Jane Smith', email: 'jane@example.com' },
            { _id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
          ]);
        }, 500);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      }
    };

    if (!isEditMode) {
      fetchUsers();
    }
  }, [isEditMode]);

  // Initialize form with default values or employee data
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: isEditMode
      ? {
          employeeId: employee.employeeId,
          department: employee.department?._id,
          position: employee.position?._id,
          manager: employee.manager?._id,
          dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth) : undefined,
          dateOfJoining: employee.dateOfJoining ? new Date(employee.dateOfJoining) : new Date(),
          status: employee.status || 'active',
          contactInformation: {
            phone: employee.contactInformation?.phone || '',
            alternateEmail: employee.contactInformation?.alternateEmail || '',
            address: {
              street: employee.contactInformation?.address?.street || '',
              city: employee.contactInformation?.address?.city || '',
              state: employee.contactInformation?.address?.state || '',
              zipCode: employee.contactInformation?.address?.zipCode || '',
              country: employee.contactInformation?.address?.country || '',
            },
          },
          emergencyContact: {
            name: employee.emergencyContact?.name || '',
            relationship: employee.emergencyContact?.relationship || '',
            phone: employee.emergencyContact?.phone || '',
          },
          bankDetails: {
            accountName: employee.bankDetails?.accountName || '',
            accountNumber: employee.bankDetails?.accountNumber || '',
            bankName: employee.bankDetails?.bankName || '',
            ifscCode: employee.bankDetails?.ifscCode || '',
          },
          leaveBalance: {
            sick: employee.leaveBalance?.sick || 10,
            casual: employee.leaveBalance?.casual || 10,
            annual: employee.leaveBalance?.annual || 15,
          }
        }
      : {
          employeeId: '',
          dateOfJoining: new Date(),
          status: 'active',
          contactInformation: {
            phone: '',
            alternateEmail: '',
            address: {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: '',
            },
          },
          emergencyContact: {
            name: '',
            relationship: '',
            phone: '',
          },
          bankDetails: {
            accountName: '',
            accountNumber: '',
            bankName: '',
            ifscCode: '',
          },
          leaveBalance: {
            sick: 10,
            casual: 10,
            annual: 15,
          }
        },
  });

  // Form submission handler
  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      if (isEditMode) {
        await api.iam.updateEmployee(employee._id, data);
        toast.success('Employee updated successfully');
      } else {
        await api.iam.createEmployee(data);
        toast.success('Employee created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Employee form submission error:', error);
      toast.error(isEditMode ? 'Failed to update employee' : 'Failed to create employee');
    }
  };

  if (departmentsQuery.isLoading || positionsQuery.isLoading || (!isEditMode && users.length === 0)) {
    return <div className="flex justify-center p-4">Loading form data...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="contact">Contact Details</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="space-y-4">
            {!isEditMode && (
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee ID</FormLabel>
                  <FormControl>
                    <Input placeholder="EMP001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dateOfJoining"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Joining</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="onLeave">On Leave</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          <TabsContent value="contact" className="space-y-4">
            <FormField
              control={form.control}
              name="contactInformation.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contactInformation.alternateEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alternate Email</FormLabel>
                  <FormControl>
                    <Input placeholder="alternate@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Card>
              <CardContent className="pt-4 space-y-4">
                <h3 className="font-medium">Address</h3>
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="contactInformation.address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactInformation.address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contactInformation.address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="NY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactInformation.address.zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input placeholder="10001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contactInformation.address.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="USA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4 space-y-4">
                <h3 className="font-medium">Emergency Contact</h3>
                <FormField
                  control={form.control}
                  name="emergencyContact.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergencyContact.relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship</FormLabel>
                        <FormControl>
                          <Input placeholder="Spouse" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="emergencyContact.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 987-6543" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="employment" className="space-y-4">
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departmentsQuery.data?.departments.map((dept: any) => (
                        <SelectItem key={dept._id} value={dept._id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {positionsQuery.data?.positions.map((pos: any) => (
                        <SelectItem key={pos._id} value={pos._id}>
                          {pos.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="manager"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reporting Manager</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employeesQuery.data?.employees
                        .filter((emp: any) => emp._id !== employee?._id)
                        .map((emp: any) => (
                          <SelectItem key={emp._id} value={emp._id}>
                            {emp.userId?.name} ({emp.employeeId})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Card>
              <CardContent className="pt-4 space-y-4">
                <h3 className="font-medium">Leave Balance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="leaveBalance.sick"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sick Leave</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="leaveBalance.casual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Casual Leave</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="leaveBalance.annual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Leave</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardContent className="pt-4 space-y-4">
                <h3 className="font-medium">Bank Details</h3>
                <FormField
                  control={form.control}
                  name="bankDetails.accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Holder Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bankDetails.accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="XXXXXXXXXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bankDetails.bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Bank of America" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bankDetails.ifscCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IFSC/SWIFT Code</FormLabel>
                        <FormControl>
                          <Input placeholder="ABCD0123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditMode ? 'Update Employee' : 'Create Employee'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EmployeeForm;
