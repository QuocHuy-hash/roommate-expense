import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Receipt, Users, BarChart3, Shield } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  firstName: z.string().min(1, "Tên là bắt buộc"),
  lastName: z.string().min(1, "Họ là bắt buộc"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Landing() {
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      confirmPassword: "",
    },
  });

  const onLogin = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      toast({
        title: "Thành công",
        description: "Đăng nhập thành công!",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi đăng nhập",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const onRegister = async (values: RegisterFormValues) => {
    try {
      await register(values.email, values.password, values.firstName, values.lastName);
      toast({
        title: "Thành công",
        description: "Đăng ký thành công!",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi đăng ký",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full bg-blue-600 text-white">
              <Receipt className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Chi Tiêu Dung
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ứng dụng quản lý chi tiêu roommate thông minh, giúp bạn theo dõi và chia sẻ chi phí một cách dễ dàng
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Features */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Theo dõi chi tiêu</h3>
                  <p className="text-sm text-gray-600">Ghi lại mọi khoản chi tiêu với hình ảnh hóa đơn</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Chia sẻ chi phí</h3>
                  <p className="text-sm text-gray-600">Tự động chia đều chi phí chung giữa các roommate</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Báo cáo chi tiết</h3>
                  <p className="text-sm text-gray-600">Xem tổng quan và phân tích chi tiêu theo thời gian</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Bảo mật cao</h3>
                  <p className="text-sm text-gray-600">Dữ liệu được mã hóa và bảo vệ tuyệt đối</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-white/20">
              <h3 className="font-semibold text-gray-900 mb-2">Tại sao chọn Chi Tiêu Dung?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Giao diện đơn giản, dễ sử dụng</li>
                <li>• Tính toán tự động, không cần lo về số học</li>
                <li>• Lưu trữ hình ảnh hóa đơn để dễ dàng kiểm tra</li>
                <li>• Theo dõi thanh toán và công nợ real-time</li>
                <li>• Hoàn toàn miễn phí cho nhóm nhỏ</li>
              </ul>
            </div>
          </div>

          {/* Auth Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Chào mừng bạn!</CardTitle>
                <CardDescription>
                  Đăng nhập hoặc tạo tài khoản để bắt đầu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                    <TabsTrigger value="register">Đăng ký</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your@email.com"
                          {...loginForm.register("email")}
                          disabled={isLoading}
                        />
                        {loginForm.formState.errors.email && (
                          <p className="text-sm text-red-600">
                            {loginForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-password">Mật khẩu</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••"
                          {...loginForm.register("password")}
                          disabled={isLoading}
                        />
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-red-600">
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Đăng nhập
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4">
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="register-firstName">Tên</Label>
                          <Input
                            id="register-firstName"
                            placeholder="Tên"
                            {...registerForm.register("firstName")}
                            disabled={isLoading}
                          />
                          {registerForm.formState.errors.firstName && (
                            <p className="text-sm text-red-600">
                              {registerForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-lastName">Họ</Label>
                          <Input
                            id="register-lastName"
                            placeholder="Họ"
                            {...registerForm.register("lastName")}
                            disabled={isLoading}
                          />
                          {registerForm.formState.errors.lastName && (
                            <p className="text-sm text-red-600">
                              {registerForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="your@email.com"
                          {...registerForm.register("email")}
                          disabled={isLoading}
                        />
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-red-600">
                            {registerForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-password">Mật khẩu</Label>
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="••••••"
                          {...registerForm.register("password")}
                          disabled={isLoading}
                        />
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-600">
                            {registerForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-confirmPassword">Xác nhận mật khẩu</Label>
                        <Input
                          id="register-confirmPassword"
                          type="password"
                          placeholder="••••••"
                          {...registerForm.register("confirmPassword")}
                          disabled={isLoading}
                        />
                        {registerForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-red-600">
                            {registerForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Tạo tài khoản
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Bằng cách sử dụng ứng dụng, bạn đồng ý với{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Điều khoản dịch vụ
                    </a>{" "}
                    và{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Chính sách bảo mật
                    </a>
                    .
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
