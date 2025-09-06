import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/utils";
import type { User } from "@shared/schema";
import {
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudUpload, Check } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional(),
  payerId: z.string().min(1, "Payer is required"),
  isShared: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface ExpenseFormProps {
  onSuccess: () => void;
}

export default function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: "",
      description: "",
      payerId: user?.id || "",
      isShared: true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('amount', data.amount);
      formData.append('description', data.description || '');
      formData.append('payerId', data.payerId);
      formData.append('isShared', data.isShared.toString());
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      return await apiRequest('POST', '/api/expenses', {
        body: formData,
        isFormData: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/balance"] });
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
    }
  };

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <div data-testid="form-expense">
      <DialogHeader>
        <DialogTitle data-testid="text-form-title">Thêm chi tiêu mới</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiêu đề</FormLabel>
                <FormControl>
                  <Input placeholder="Ví dụ: Mua đồ ăn" {...field} data-testid="input-title" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số tiền (VND)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    min="1" 
                    {...field} 
                    data-testid="input-amount"
                  />
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
                <FormLabel>Mô tả</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Mô tả chi tiết về khoản chi tiêu..." 
                    rows={3} 
                    {...field} 
                    data-testid="input-description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Người trả</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-payer">
                      <SelectValue placeholder="Chọn người trả" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="927070657">Minh</SelectItem>
                    <SelectItem value="927070658">Linh</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isShared"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="checkbox-shared"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Chi tiêu chung (chia 50/50)</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Hóa đơn (tối đa 5MB)
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange}
                id="image-upload"
                data-testid="input-image"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                {imageFile ? (
                  <div>
                    <Check className="text-success text-2xl mb-2 mx-auto" />
                    <p className="text-sm text-success" data-testid="text-image-selected">
                      {imageFile.name}
                    </p>
                  </div>
                ) : (
                  <div>
                    <CloudUpload className="text-muted-foreground text-2xl mb-2 mx-auto" />
                    <p className="text-sm text-muted-foreground">Chọn ảnh hóa đơn</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              className="flex-1" 
              onClick={onSuccess}
              data-testid="button-cancel"
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={mutation.isPending}
              data-testid="button-submit"
            >
              {mutation.isPending ? "Đang thêm..." : "Thêm"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
