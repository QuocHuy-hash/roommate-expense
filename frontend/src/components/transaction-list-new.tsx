import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistance } from "date-fns";
import { vi } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { expensesAPI, settlementsAPI, handleAPIError, type Expense } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import ExpenseForm from "./expense-form";
import { Receipt, Handshake, Edit2, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";

type TransactionItem = {
  id: string;
  type: "expense" | "settlement";
  title: string;
  amount: string;
  description?: string | null;
  date: string;
  isShared?: boolean;
  payerId?: string;
  payeeId?: string;
  imageUrl?: string | null;
  canEdit?: boolean;
  canDelete?: boolean;
};

export default function TransactionList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Fetch expenses
  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: expensesAPI.getAll,
  });

  // Fetch settlements
  const { data: settlementsData, isLoading: settlementsLoading } = useQuery({
    queryKey: ["settlements"],
    queryFn: settlementsAPI.getAll,
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: (expenseId: string) => expensesAPI.delete(expenseId),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Xóa chi tiêu thành công",
      });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: handleAPIError(error),
        variant: "destructive",
      });
    },
  });

  const isLoading = expensesLoading || settlementsLoading;
  const expenses = expensesData?.expenses || [];
  const settlements = settlementsData?.settlements || [];

  // Combine and sort transactions
  const transactions: TransactionItem[] = [
    ...expenses.map((expense): TransactionItem => ({
      id: expense.id,
      type: "expense",
      title: expense.title,
      amount: expense.amount,
      description: expense.description,
      date: expense.createdAt,
      isShared: expense.isShared,
      payerId: expense.payerId,
      imageUrl: expense.imageUrl,
      canEdit: expense.payerId === user?.id,
      canDelete: expense.payerId === user?.id,
    })),
    ...settlements.map((settlement): TransactionItem => ({
      id: settlement.id,
      type: "settlement",
      title: "Thanh toán",
      amount: settlement.amount,
      description: settlement.description,
      date: settlement.createdAt,
      payerId: settlement.payerId,
      payeeId: settlement.payeeId,
      imageUrl: settlement.imageUrl,
      canEdit: false, // Settlements typically can't be edited
      canDelete: settlement.payerId === user?.id,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowEditDialog(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    deleteExpenseMutation.mutate(expenseId);
  };

  const handleEditSuccess = () => {
    setEditingExpense(null);
    setShowEditDialog(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Chưa có giao dịch nào
        </h3>
        <p className="text-gray-500">
          Bắt đầu bằng cách thêm chi tiêu đầu tiên của bạn
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <Card key={`${transaction.type}-${transaction.id}`} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="mt-1">
                  {transaction.type === "expense" ? (
                    <Receipt className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Handshake className="h-5 w-5 text-green-500" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {transaction.title}
                    </h3>
                    {transaction.type === "expense" && (
                      <Badge variant={transaction.isShared ? "default" : "secondary"}>
                        {transaction.isShared ? "Chung" : "Cá nhân"}
                      </Badge>
                    )}
                  </div>
                  
                  {transaction.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {transaction.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{formatDate(transaction.date)}</span>
                    <span>
                      {formatDistance(new Date(transaction.date), new Date(), { 
                        addSuffix: true, 
                        locale: vi 
                      })}
                    </span>
                    {transaction.imageUrl && (
                      <div className="flex items-center space-x-1">
                        <ImageIcon className="h-3 w-3" />
                        <span>Có hình ảnh</span>
                      </div>
                    )}
                  </div>
                  
                  {transaction.type === "settlement" && (
                    <p className="text-xs text-gray-500 mt-1">
                      {transaction.payerId === user?.id 
                        ? "Bạn đã thanh toán" 
                        : "Đã nhận thanh toán"
                      }
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <div className="text-right">
                  <div className={`font-semibold ${
                    transaction.type === "expense" 
                      ? "text-red-600" 
                      : transaction.payerId === user?.id 
                        ? "text-red-600" 
                        : "text-green-600"
                  }`}>
                    {transaction.type === "settlement" && transaction.payerId !== user?.id ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
                
                {(transaction.canEdit || transaction.canDelete) && (
                  <div className="flex items-center space-x-1">
                    {transaction.canEdit && transaction.type === "expense" && (
                      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditExpense(expenses.find(e => e.id === transaction.id)!)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          {editingExpense && (
                            <ExpenseForm
                              expense={{
                                id: editingExpense.id,
                                title: editingExpense.title,
                                amount: editingExpense.amount,
                                description: editingExpense.description,
                                isShared: editingExpense.isShared,
                                imageUrl: editingExpense.imageUrl,
                              }}
                              onSuccess={handleEditSuccess}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    {transaction.canDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {deleteExpenseMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa {transaction.type === "expense" ? "chi tiêu" : "thanh toán"} này không? 
                              Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteExpense(transaction.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
