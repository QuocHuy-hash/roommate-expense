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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ExpenseForm from "./expense-form";
import { Receipt, Handshake, Edit2, Trash2, Image as ImageIcon, Loader2, CheckCircle, Clock } from "lucide-react";

type TransactionItem = {
  id: string;
  type: "expense" | "settlement";
  title: string;
  amount: string;
  description?: string | null;
  date: string;
  isShared?: boolean;
  isSettled?: boolean;
  payerId?: string;
  payeeId?: string;
  payerName?: string;
  imageUrl?: string | null;
  canEdit?: boolean;
  canDelete?: boolean;
  canUpdateSettlement?: boolean;
  isCurrentUserPayer?: boolean;
};

export default function TransactionListEnhanced() {
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
    mutationFn: expensesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({
        title: "Thành công",
        description: "Đã xóa chi tiêu thành công.",
      });
    },
    onError: (error) => {
      const errorMessage = handleAPIError(error);
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Update settlement status mutation
  const updateSettlementMutation = useMutation({
    mutationFn: ({ id, isSettled }: { id: string; isSettled: boolean }) =>
      expensesAPI.updateSettlementStatus(id, isSettled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái thanh toán.",
      });
    },
    onError: (error) => {
      const errorMessage = handleAPIError(error);
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Combine and sort transactions
  const transactions: TransactionItem[] = [
    ...(expensesData?.expenses || []).map((expense: Expense) => {
      const isCurrentUserPayer = user?.id === expense.payerId;
      console.log('=== EXPENSE DEBUG ===');
      console.log('Expense title:', expense.title);
      console.log('Current user ID:', user?.id);
      console.log('Expense payer ID:', expense.payerId);
      console.log('Is current user payer?:', isCurrentUserPayer);
      console.log('Is shared?:', expense.isShared);
      console.log('Is settled?:', expense.isSettled);
      console.log('Payer name:', expense.payerFirstName, expense.payerLastName);
      console.log('===================');
      
      return {
        id: expense.id,
        type: "expense" as const,
        title: expense.title,
        amount: expense.amount,
        description: expense.description,
        date: expense.createdAt,
        isShared: expense.isShared,
        isSettled: expense.isSettled,
        payerId: expense.payerId,
        payerName: expense.payerFirstName && expense.payerLastName 
          ? `${expense.payerFirstName} ${expense.payerLastName}` 
          : expense.payerEmail || 'Unknown',
        imageUrl: expense.imageUrl,
        canEdit: isCurrentUserPayer,
        canDelete: isCurrentUserPayer,
        canUpdateSettlement: isCurrentUserPayer && expense.isShared,
        isCurrentUserPayer: isCurrentUserPayer,
      };
    }),
    ...(settlementsData?.settlements || []).map((settlement) => ({
      id: settlement.id,
      type: "settlement" as const,
      title: `Thanh toán từ ${settlement.payerId} đến ${settlement.payeeId}`,
      amount: settlement.amount,
      description: settlement.description,
      date: settlement.createdAt,
      payerId: settlement.payerId,
      payeeId: settlement.payeeId,
      imageUrl: settlement.imageUrl,
      canEdit: false,
      canDelete: false,
      canUpdateSettlement: false,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDeleteExpense = (id: string) => {
    deleteExpenseMutation.mutate(id);
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setShowEditDialog(true);
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setEditingExpense(null);
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
  };

  const handleSettlementToggle = (id: string, currentStatus: boolean) => {
    updateSettlementMutation.mutate({ id, isSettled: !currentStatus });
  };

  if (expensesLoading || settlementsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải giao dịch...</span>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có giao dịch nào</h3>
        <p className="text-gray-600">Thêm chi tiêu đầu tiên của bạn để bắt đầu theo dõi.</p>
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
                      <>
                        <Badge variant={transaction.isShared ? "default" : "secondary"}>
                          {transaction.isShared ? "Chung" : "Cá nhân"}
                        </Badge>
                        {transaction.isShared && (
                          <Badge 
                            variant={transaction.isSettled ? "default" : "secondary"}
                            className={transaction.isSettled ? "bg-green-100 text-green-800 border-green-200" : "bg-orange-100 text-orange-800 border-orange-200"}
                          >
                            {transaction.isSettled ? (
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="h-3 w-3" />
                                <span>
                                  {transaction.isCurrentUserPayer ? "Đã được trả" : "Đã trả"}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {transaction.isCurrentUserPayer ? "Chưa được trả" : "Chưa trả"}
                                </span>
                              </div>
                            )}
                          </Badge>
                        )}
                      </>
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
                  
                  {/* Settlement Status Control for Payers (người thanh toán) */}
                  {transaction.canUpdateSettlement && (
                    <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200 bg-green-50 rounded-md p-3">
                      <Switch
                        id={`settlement-${transaction.id}`}
                        checked={transaction.isSettled || false}
                        onCheckedChange={() => handleSettlementToggle(transaction.id, transaction.isSettled || false)}
                        disabled={updateSettlementMutation.isPending}
                      />
                      <div className="flex-1">
                        <Label 
                          htmlFor={`settlement-${transaction.id}`}
                          className="text-sm font-medium text-gray-700 cursor-pointer block"
                        >
                          🏦 {transaction.isSettled ? "Đã được bạn cùng phòng trả tiền" : "Đánh dấu khi đã được trả"}
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          {transaction.isSettled 
                            ? "Bạn cùng phòng đã chia đôi tiền với bạn rồi" 
                            : "Toggle này khi bạn cùng phòng đã trả tiền chia đôi cho bạn"
                          }
                        </p>
                      </div>
                      {updateSettlementMutation.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      )}
                    </div>
                  )}
                  
                  {/* Settlement Status Display for Non-Payers (người khác) */}
                  {transaction.type === "expense" && transaction.isShared && !transaction.isCurrentUserPayer && (
                    <div className="mt-3 pt-3 border-t border-gray-200 bg-blue-50 rounded-md p-3">
                      <div className="flex items-center space-x-2">
                        {transaction.isSettled ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-orange-500" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">
                            💳 {transaction.isSettled 
                              ? `Bạn đã trả cho ${transaction.payerName}` 
                              : `Bạn cần trả cho ${transaction.payerName}`
                            }
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {transaction.isSettled 
                              ? "Bạn đã hoàn thành việc chia đôi cho giao dịch này" 
                              : `Số tiền cần trả: ${formatCurrency(parseFloat(transaction.amount) / 2)}`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(parseFloat(transaction.amount))}
                </span>
                
                {(transaction.canEdit || transaction.canDelete) && (
                  <div className="flex space-x-1">
                    {transaction.canEdit && (
                      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(expensesData?.expenses.find(e => e.id === transaction.id)!)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          {editingExpense && (
                            <ExpenseForm
                              expense={editingExpense}
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
