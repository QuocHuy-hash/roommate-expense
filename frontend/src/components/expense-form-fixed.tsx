import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { expensesAPI, handleAPIError, type CreateExpenseRequest } from "@/lib/api";
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
import { CloudUpload, Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  amount: z.string()
    .min(1, "Số tiền là bắt buộc")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Số tiền phải là số dương hợp lệ",
    }),
  description: z.string().optional(),
  isShared: z.boolean().default(true),
  imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ExpenseFormProps {
  onSuccess: () => void;
  expense?: {
    id: string;
    title: string;
    amount: string;
    description?: string | null;
    isShared: boolean;
    imageUrl?: string | null;
  };
}

export default function ExpenseForm({ onSuccess, expense }: ExpenseFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const isEditing = !!expense;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: expense?.title || "",
      amount: expense?.amount || "",
      description: expense?.description || "",
      isShared: expense?.isShared ?? true,
      imageUrl: expense?.imageUrl || "",
    },
  });

  // Create expense mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateExpenseRequest) => expensesAPI.create(data),
    onSuccess: (response) => {
      toast({
        title: "Thành công",
        description: response.message || "Tạo chi tiêu thành công",
      });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
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

  // Update expense mutation
  const updateMutation = useMutation({
    mutationFn: (data: CreateExpenseRequest) => 
      expensesAPI.update(expense!.id, data),
    onSuccess: (response) => {
      toast({
        title: "Thành công",
        description: response.message || "Cập nhật chi tiêu thành công",
      });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
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

      const expenseData: CreateExpenseRequest = {
        title: values.title,
        amount: values.amount,
        description: values.description || undefined,
        isShared: values.isShared,
        imageUrl: imageUrl || undefined,
      };

      if (isEditing) {
        updateMutation.mutate(expenseData);
      } else {
        createMutation.mutate(expenseData);
      }
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

  const isLoading = createMutation.isPending || updateMutation.isPending || uploading;

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Chỉnh sửa chi tiêu" : "Thêm chi tiêu mới"}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiêu đề *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ví dụ: Mua sắm tạp hóa"
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
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số tiền (VND) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="150000"
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
                    placeholder="Mô tả chi tiết về chi tiêu này..."
                    className="resize-none"
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
            name="isShared"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Chi tiêu chung</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Đánh dấu nếu đây là chi tiêu được chia sẻ
                  </p>
                </div>
              </FormItem>
            )}
          />

          {/* Image upload section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Hình ảnh hóa đơn</label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex items-center space-x-2 px-3 py-2 border border-input rounded-md hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CloudUpload className="h-4 w-4" />
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
                    placeholder="https://example.com/image.jpg"
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
              {isEditing ? "Cập nhật" : "Tạo chi tiêu"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
