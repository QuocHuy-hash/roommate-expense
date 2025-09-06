import { useState } from "react";
import AppHeader from "@/components/app-header";
import Dashboard from "@/components/dashboard-new";
import TransactionList from "@/components/transaction-list-new";
import Reports from "@/components/reports-new";
import Profile from "@/components/profile";
import MobileNav from "@/components/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Tab = 'dashboard' | 'transactions' | 'reports' | 'profile';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <AppHeader />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="hidden md:block">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Tab)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="dashboard">Tổng quan</TabsTrigger>
              <TabsTrigger value="transactions">Giao dịch</TabsTrigger>
              <TabsTrigger value="reports">Báo cáo</TabsTrigger>
              <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <Dashboard />
            </TabsContent>
            
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Danh sách giao dịch</CardTitle>
                </CardHeader>
                <CardContent>
                  <TransactionList />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reports">
              <Reports />
            </TabsContent>
            
            <TabsContent value="profile">
              <Profile />
            </TabsContent>
          </Tabs>
        </div>

        {/* Mobile view */}
        <div className="md:hidden">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'transactions' && (
            <Card>
              <CardHeader>
                <CardTitle>Danh sách giao dịch</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionList />
              </CardContent>
            </Card>
          )}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'profile' && <Profile />}
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
