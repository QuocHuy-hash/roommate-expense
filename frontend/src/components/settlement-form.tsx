import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { User } from "@shared/schema";
import { apiRequest } from "@/lib/utils";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Check } from "lucide-react";

const formSchema = z.object({
  payerId: z.string().min(1, "Payer is required"),
  payeeId: z.string().min(1, "Payee is required"),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SettlementFormProps {
  onSuccess: () => void;
}

export default function SettlementForm({ onSuccess }: SettlementFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payerId: user?.id || "",
      payeeId: "",
      amount: "",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const formData = new FormData();
      formData.append('payerId', data.payerId);
      formData.append('payeeId', data.payeeId);
      formData.append('amount', data.amount);
      formData.append('description', data.description || '');
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      return await apiRequest('POST', '/api/settlements', {
        body: formData,
        isFormData: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settlements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/balance"] });
      toast({
        title: "Success",
        description: "Settlement recorded successfully",
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
    if (data.payerId === data.payeeId) {
      toast({
        title: "Error",
        description: "Payer and payee cannot be the same person",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate(data);
  };

  return (
    <div data-testid="form-settlement">
      <DialogHeader>
        <DialogTitle data-testid="text-form-title">Ghi nhận thanh toán</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
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
            name="payeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Người nhận</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-payee">
                      <SelectValue placeholder="Chọn người nhận" />
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
                <FormLabel>Ghi chú</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Ví dụ: Chuyển khoản qua VietcomBank" 
                    rows={2} 
                    {...field} 
                    data-testid="input-description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Ảnh chuyển khoản (tùy chọn)
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange}
                id="transfer-image-upload"
                data-testid="input-image"
              />
              <label htmlFor="transfer-image-upload" className="cursor-pointer">
                {imageFile ? (
                  <div>
                    <Check className="text-success text-xl mb-1 mx-auto" />
                    <p className="text-xs text-success" data-testid="text-image-selected">
                      {imageFile.name}
                    </p>
                  </div>
                ) : (
                  <div>
                    <Camera className="text-muted-foreground text-xl mb-1 mx-auto" />
                    <p className="text-xs text-muted-foreground">Chọn ảnh</p>
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
              {mutation.isPending ? "Đang ghi nhận..." : "Ghi nhận"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
