import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { settlementsAPI, handleAPIError, type CreateSettlementRequest, type User } from "@/lib/api";
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
import { Camera, Loader2 } from "lucide-react";

const formSchema = z.object({
  payeeId: z.string().min(1, "Người nhận thanh toán là bắt buộc"),
  amount: z.string()
    .min(1, "Số tiền là bắt buộc")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Số tiền phải là số dương hợp lệ",
    }),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SettlementFormProps {
  onSuccess: () => void;
  users?: User[]; // List of users to settle with
}

export default function SettlementForm({ onSuccess, users = [] }: SettlementFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payeeId: "",
      amount: "",
      description: "",
      imageUrl: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateSettlementRequest) => settlementsAPI.create(data),
    onSuccess: (response) => {
      toast({
        title: "Thành công",
        description: response.message || "Tạo thanh toán thành công",
      });
      queryClient.invalidateQueries({ queryKey: ["settlements"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] }); // Invalidate expenses as balance might change
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: handleAPIError(error),
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Lỗi",
        description: "Bạn cần đăng nhập để thực hiện thao tác này",
        variant: "destructive",
      });
      return;
    }

    try {
      let imageUrl = values.imageUrl;

      // Handle image upload if there's a file
      if (imageFile) {
        setUploading(true);
        // For now, we'll skip image upload and just use a placeholder
        // In a real app, you'd upload to a service like Cloudinary or AWS S3
        imageUrl = URL.createObjectURL(imageFile);
      }

      const settlementData: CreateSettlementRequest = {
        payeeId: values.payeeId,
        amount: values.amount,
        description: values.description || undefined,
        imageUrl: imageUrl || undefined,
      };

      mutation.mutate(settlementData);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xử lý yêu cầu",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: "Kích thước file không được vượt quá 5MB",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Lỗi",
          description: "Chỉ được upload file hình ảnh",
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);
    }
  };

  const isLoading = mutation.isPending || uploading;

  // Filter out current user from the list
  const availableUsers = users.filter(u => u.id !== user?.id);

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Thanh toán</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="payeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thanh toán cho *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn người nhận thanh toán" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </SelectItem>
                    ))}
                    {availableUsers.length === 0 && (
                      <SelectItem value="no-users" disabled>
                        Không có người dùng khác
                      </SelectItem>
                    )}
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
                <FormLabel>Số tiền (VND) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="75000"
                    {...field}
                    disabled={isLoading}
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
                    placeholder="Mô tả về khoản thanh toán này..."
                    className="resize-none"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image upload section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Hình ảnh chuyển khoản</label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
                className="hidden"
                id="settlement-image-upload"
              />
              <label
                htmlFor="settlement-image-upload"
                className="cursor-pointer flex items-center space-x-2 px-3 py-2 border border-input rounded-md hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
                <span>Chọn hình ảnh</span>
              </label>
              {imageFile && (
                <span className="text-sm text-muted-foreground">
                  {imageFile.name}
                </span>
              )}
            </div>
          </div>

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hoặc nhập URL hình ảnh</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://example.com/transfer-receipt.jpg"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onSuccess}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tạo thanh toán
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
