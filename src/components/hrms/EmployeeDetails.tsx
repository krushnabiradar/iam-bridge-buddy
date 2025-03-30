
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Building, Briefcase, FileText, User, Phone, Mail, Home, CreditCard, Calendar } from 'lucide-react';

interface EmployeeDetailsProps {
  employee: any;
  onClose: () => void;
}

const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({ employee, onClose }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 p-2">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          {employee.userId?.avatar ? (
            <img 
              src={employee.userId.avatar} 
              alt={employee.userId?.name} 
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <User size={40} className="text-primary" />
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{employee.userId?.name || 'Employee'}</h2>
          <p className="text-sm text-muted-foreground">
            {employee.position?.title || 'No Position'} {employee.department?.name ? `at ${employee.department.name}` : ''}
          </p>
          <p className="text-sm text-muted-foreground">Employee ID: {employee.employeeId}</p>
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail size={16} />Email
                  </dt>
                  <dd className="text-sm">{employee.userId?.email || 'Not available'}</dd>
                </div>
                
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CalendarDays size={16} />Date of Birth
                  </dt>
                  <dd className="text-sm">{employee.dateOfBirth ? formatDate(employee.dateOfBirth) : 'Not specified'}</dd>
                </div>
                
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar size={16} />Date of Joining
                  </dt>
                  <dd className="text-sm">{formatDate(employee.dateOfJoining)}</dd>
                </div>
                
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CalendarDays size={16} />Status
                  </dt>
                  <dd className="text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      employee.status === 'active' ? 'bg-green-100 text-green-800' :
                      employee.status === 'onLeave' ? 'bg-yellow-100 text-yellow-800' :
                      employee.status === 'terminated' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {employee.status || 'Unknown'}
                    </span>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
              {employee.emergencyContact?.name ? (
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                    <dd className="text-sm">{employee.emergencyContact.name}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Relationship</dt>
                    <dd className="text-sm">{employee.emergencyContact.relationship || 'Not specified'}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                    <dd className="text-sm">{employee.emergencyContact.phone || 'Not specified'}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">No emergency contact information available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="employment" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Job Details</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Building size={16} />Department
                  </dt>
                  <dd className="text-sm">{employee.department?.name || 'Not assigned'}</dd>
                </div>
                
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Briefcase size={16} />Position
                  </dt>
                  <dd className="text-sm">{employee.position?.title || 'Not assigned'}</dd>
                </div>
                
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User size={16} />Manager
                  </dt>
                  <dd className="text-sm">{employee.manager?.userId?.name || 'Not assigned'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Leave Balance</h3>
              {employee.leaveBalance ? (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-green-800">Sick Leave</p>
                    <p className="text-2xl font-bold text-green-600">{employee.leaveBalance.sick || 0}</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-blue-800">Casual Leave</p>
                    <p className="text-2xl font-bold text-blue-600">{employee.leaveBalance.casual || 0}</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium text-purple-800">Annual Leave</p>
                    <p className="text-2xl font-bold text-purple-600">{employee.leaveBalance.annual || 0}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No leave balance information available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Contact Information</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone size={16} />Phone
                  </dt>
                  <dd className="text-sm">{employee.contactInformation?.phone || 'Not specified'}</dd>
                </div>
                
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail size={16} />Alternate Email
                  </dt>
                  <dd className="text-sm">{employee.contactInformation?.alternateEmail || 'Not specified'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Home size={18} />Address
              </h3>
              {employee.contactInformation?.address?.street ? (
                <address className="not-italic">
                  <p className="text-sm">{employee.contactInformation.address.street}</p>
                  <p className="text-sm">
                    {employee.contactInformation.address.city && employee.contactInformation.address.city + ', '}
                    {employee.contactInformation.address.state && employee.contactInformation.address.state + ' '}
                    {employee.contactInformation.address.zipCode}
                  </p>
                  <p className="text-sm">{employee.contactInformation.address.country}</p>
                </address>
              ) : (
                <p className="text-sm text-muted-foreground">No address information available</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <CreditCard size={18} />Bank Details
              </h3>
              {employee.bankDetails?.accountNumber ? (
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Account Name</dt>
                    <dd className="text-sm">{employee.bankDetails.accountName}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Account Number</dt>
                    <dd className="text-sm">XXXX-XXXX-{employee.bankDetails.accountNumber.slice(-4)}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Bank Name</dt>
                    <dd className="text-sm">{employee.bankDetails.bankName || 'Not specified'}</dd>
                  </div>
                  
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">IFSC/SWIFT Code</dt>
                    <dd className="text-sm">{employee.bankDetails.ifscCode || 'Not specified'}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">No bank details available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <FileText size={18} />Documents
              </h3>
              {employee.documents && employee.documents.length > 0 ? (
                <ul className="space-y-2">
                  {employee.documents.map((doc: any, index: number) => (
                    <li key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-primary" />
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded on {formatDate(doc.uploadDate)}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No documents uploaded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

export default EmployeeDetails;
