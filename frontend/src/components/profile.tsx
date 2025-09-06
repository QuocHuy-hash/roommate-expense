import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LogOut, User, Mail, Calendar, Shield, Settings, HelpCircle, Heart } from "lucide-react";

export default function Profile() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = (firstName?: string | null, lastName?: string | null) => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) {
      return firstName;
    }
    return 'Người dùng';
  };

  const formatDate = (dateString?: Date | string | null) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  return (
    <section data-testid="profile-section">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-profile-title">
          Thông tin cá nhân
        </h2>
        <p className="text-muted-foreground">
          Quản lý tài khoản và cài đặt ứng dụng
        </p>
      </div>

      {/* User Profile Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16" data-testid="avatar-profile">
              <AvatarImage src={user?.profileImageUrl || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {getInitials(user?.firstName, user?.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground" data-testid="text-profile-name">
                {getDisplayName(user?.firstName, user?.lastName)}
              </h3>
              <p className="text-muted-foreground" data-testid="text-profile-email">
                {user?.email || 'No email provided'}
              </p>
              <Badge variant="outline" className="mt-2">
                <Shield className="mr-1" size={12} />
                Verified Account
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Account Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2" size={20} />
            Thông tin tài khoản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="text-muted-foreground" size={16} />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-xs text-muted-foreground" data-testid="text-account-email">
                  {user?.email || 'Chưa cung cấp'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="text-muted-foreground" size={16} />
              <div>
                <p className="text-sm font-medium">Ngày tham gia</p>
                <p className="text-xs text-muted-foreground" data-testid="text-join-date">
                  Mới tham gia
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="text-muted-foreground" size={16} />
              <div>
                <p className="text-sm font-medium">ID người dùng</p>
                <p className="text-xs text-muted-foreground font-mono" data-testid="text-user-id">
                  {user?.id || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2" size={20} />
            Về ứng dụng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="text-primary" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Chi Tiêu Chung</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Ứng dụng quản lý chi tiêu chung cho hai người. 
              Theo dõi, chia sẻ và tính toán số dư một cách dễ dàng.
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Phiên bản:</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cập nhật cuối:</span>
              <span className="font-medium">{new Date().toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Người dùng:</span>
              <span className="font-medium">2 người (Minh & Linh)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <HelpCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-medium text-foreground mb-1">Hướng dẫn sử dụng</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Tìm hiểu cách sử dụng ứng dụng hiệu quả
              </p>
              <Button variant="outline" size="sm" className="w-full" data-testid="button-help">
                Xem hướng dẫn
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <LogOut className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-medium text-foreground mb-1">Đăng xuất</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Thoát khỏi tài khoản hiện tại
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-destructive hover:text-destructive"
                onClick={handleLogout}
                data-testid="button-logout-profile"
              >
                Đăng xuất
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground">
        <p>
          Được phát triển với ❤️ để quản lý chi tiêu chung dễ dàng hơn
        </p>
      </div>
    </section>
  );
}