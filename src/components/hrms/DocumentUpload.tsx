
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FileUp } from 'lucide-react';

// Create the form schema
const documentFormSchema = z.object({
  title: z.string().min(1, "Document title is required"),
  fileUrl: z.string().min(1, "File URL is required"),
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

interface DocumentUploadProps {
  employeeId: string;
  onSuccess: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ employeeId, onSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: '',
      fileUrl: '',
    },
  });

  const onSubmit = async (data: DocumentFormValues) => {
    setIsUploading(true);
    try {
      await api.hrms.uploadDocument(employeeId, data);
      toast.success('Document uploaded successfully');
      onSuccess();
    } catch (error) {
      console.error('Document upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  // In a real app, we would upload to a file storage service (like S3, Firebase, etc.)
  // For now, we'll just simulate the file upload with a mock URL
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file upload by creating a fake URL
      const mockFileUrl = `https://example.com/documents/${Date.now()}-${file.name}`;
      form.setValue('fileUrl', mockFileUrl);
      toast.info('File selected (using mock URL for demo)');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Title</FormLabel>
              <FormControl>
                <Input placeholder="Resume, ID Proof, Certificate, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <FormLabel>Document File</FormLabel>
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            <Input
              type="file"
              className="hidden"
              id="file-upload"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <FileUp className="w-10 h-10 text-gray-400 mb-2" />
              <span className="font-medium text-sm">Click to upload</span>
              <span className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX, JPG, PNG up to 10MB
              </span>
            </label>
          </div>
          {form.watch('fileUrl') && (
            <p className="text-xs text-green-600">File selected successfully</p>
          )}
          {form.formState.errors.fileUrl && (
            <p className="text-xs text-red-500">{form.formState.errors.fileUrl.message}</p>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isUploading || !form.watch('fileUrl')}>
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DocumentUpload;
