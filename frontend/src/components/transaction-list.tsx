import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { ShoppingCart, Coffee, Handshake, Users, User, Edit, Trash2, AlertTriangle } from "lucide-react";
import type { Expense, Settlement } from "@shared/schema";

type TransactionType = 'all' | 'shared' | 'personal';

interface Transaction {
  id: string;
  type: 'expense' | 'settlement';
  title: string;
  amount: string;
  description?: string | null;
  createdAt?: Date | null;
  isShared?: boolean;
  payerId?: string;
  payeeId?: string;
  imageUrl?: string | null;
}

export default function TransactionList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<TransactionType>('all');

  const { data: expenses = [], isLoading: expensesLoading, error: expensesError } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  // Handle expenses query error
  if (expensesError) {
    if (isUnauthorizedError(expensesError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }

  const { data: settlements = [], isLoading: settlementsLoading, error: settlementsError } = useQuery<Settlement[]>({
    queryKey: ["/api/settlements"],
  });

  // Handle settlements query error  
  if (settlementsError) {
    if (isUnauthorizedError(settlementsError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/balance"] });
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = apiUrl("/api/login");
          window.location.href = apiUrl("/api/login");
          window.location.href = apiUrl("/api/login");
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(parseFloat(amount));
  };

  const getUserName = (userId: string) => {
    return userId === "927070657" ? "Minh" : "Linh";
  };

  const formatDate = (date?: Date | null) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('vi-VN').format(new Date(date));
  };

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === 'settlement') {
      return <Handshake className="text-warning" size={24} />;
    }
    if (transaction.isShared) {
      return <ShoppingCart className="text-primary" size={24} />;
    }
    return <Coffee className="text-success" size={24} />;
  };

  const getTransactionBadge = (transaction: Transaction) => {
    if (transaction.type === 'settlement') {
      return (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
          <Handshake className="mr-1" size={12} />
          Thanh toán
        </Badge>
      );
    }
    if (transaction.isShared) {
      return (
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          <Users className="mr-1" size={12} />
          Chi tiêu chung
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
        <User className="mr-1" size={12} />
        Cá nhân
      </Badge>
    );
  };

  // Combine and sort transactions
  const allTransactions: Transaction[] = [
    ...expenses.map(expense => ({
      id: expense.id,
      type: 'expense' as const,
      title: expense.title,
      amount: expense.amount,
      description: expense.description,
      createdAt: expense.createdAt,
      isShared: expense.isShared,
      payerId: expense.payerId,
      imageUrl: expense.imageUrl,
    })),
    ...settlements.map(settlement => ({
      id: settlement.id,
      type: 'settlement' as const,
      title: 'Thanh toán nợ',
      amount: settlement.amount,
      description: settlement.description,
      createdAt: settlement.createdAt,
      payerId: settlement.payerId,
      payeeId: settlement.payeeId,
      imageUrl: settlement.imageUrl,
    })),
  ].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  // Filter transactions
  const filteredTransactions = allTransactions.filter(transaction => {
    if (filter === 'all') return true;
    if (filter === 'shared') return transaction.type === 'expense' && transaction.isShared;
    if (filter === 'personal') return transaction.type === 'expense' && !transaction.isShared;
    return true;
  });

  const isLoading = expensesLoading || settlementsLoading;

  if (isLoading) {
    return (
      <section data-testid="transaction-list">
        <h2 className="text-2xl font-bold text-foreground mb-6">Giao dịch gần đây</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section data-testid="transaction-list">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-4 sm:mb-0" data-testid="text-transactions-title">
          Giao dịch gần đây
        </h2>
        
        {/* Filter Buttons */}
        <div className="flex rounded-lg bg-muted p-1">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}
            data-testid="button-filter-all"
          >
            Tất cả
          </Button>
          <Button
            variant={filter === 'shared' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('shared')}
            className={filter === 'shared' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}
            data-testid="button-filter-shared"
          >
            Chung
          </Button>
          <Button
            variant={filter === 'personal' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('personal')}
            className={filter === 'personal' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}
            data-testid="button-filter-personal"
          >
            Cá nhân
          </Button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground" data-testid="text-no-transactions">
                Chưa có giao dịch nào
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="transaction-card hover:shadow-md transition-shadow" data-testid={`card-transaction-${transaction.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getTransactionIcon(transaction)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground" data-testid={`text-transaction-title-${transaction.id}`}>
                          {transaction.title}
                        </h3>
                        {transaction.description && (
                          <p className="text-sm text-muted-foreground" data-testid={`text-transaction-description-${transaction.id}`}>
                            {transaction.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          {getTransactionBadge(transaction)}
                          <span className="text-sm text-muted-foreground" data-testid={`text-transaction-date-${transaction.id}`}>
                            {formatDate(transaction.createdAt)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {transaction.type === 'settlement' 
                              ? `${getUserName(transaction.payerId!)} trả ${getUserName(transaction.payeeId!)}`
                              : `bởi ${getUserName(transaction.payerId!)}`
                            }
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className={`text-lg font-bold ${transaction.type === 'settlement' ? 'text-warning' : 'text-foreground'}`} data-testid={`text-transaction-amount-${transaction.id}`}>
                          {formatCurrency(transaction.amount)}
                        </p>
                        {transaction.type === 'expense' && transaction.isShared && (
                          <p className="text-sm text-muted-foreground">
                            Chia: {formatCurrency((parseFloat(transaction.amount) / 2).toString())}
                          </p>
                        )}
                        {transaction.type === 'expense' && !transaction.isShared && (
                          <p className="text-sm text-muted-foreground">Không chia</p>
                        )}
                        {transaction.type === 'settlement' && (
                          <p className="text-sm text-muted-foreground">Thanh toán</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        {transaction.imageUrl ? (
                          <>
                            <img 
                              src={transaction.imageUrl} 
                              alt="Receipt" 
                              className="w-8 h-8 rounded object-cover"
                              data-testid={`img-transaction-receipt-${transaction.id}`}
                            />
                            <span className="text-xs text-muted-foreground">
                              {transaction.type === 'settlement' ? 'Có ảnh chuyển khoản' : 'Có hóa đơn'}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {transaction.type === 'settlement' ? 'Không có ảnh chuyển khoản' : 'Không có hóa đơn'}
                          </span>
                        )}
                      </div>
                      
                      {transaction.type === 'expense' && (
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-muted-foreground hover:text-foreground p-1"
                            data-testid={`button-edit-transaction-${transaction.id}`}
                          >
                            <Edit size={16} />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-muted-foreground hover:text-destructive p-1"
                                data-testid={`button-delete-transaction-${transaction.id}`}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <div className="flex items-center mb-4">
                                  <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mr-4">
                                    <AlertTriangle className="text-destructive" size={24} />
                                  </div>
                                  <div>
                                    <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bạn có chắc muốn xóa giao dịch này? Hành động này không thể hoàn tác.
                                    </AlertDialogDescription>
                                  </div>
                                </div>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel data-testid={`button-cancel-delete-${transaction.id}`}>
                                  Hủy
                                </AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteExpenseMutation.mutate(transaction.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  disabled={deleteExpenseMutation.isPending}
                                  data-testid={`button-confirm-delete-${transaction.id}`}
                                >
                                  {deleteExpenseMutation.isPending ? "Đang xóa..." : "Xóa"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
