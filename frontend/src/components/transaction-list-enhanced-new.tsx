import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistance } from "date-fns";
import { vi } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  expensesAPI,
  settlementsAPI,
  handleAPIError,
  type Expense,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Receipt,
  Handshake,
  Loader2,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  ImageIcon,
} from "lucide-react";
import { Checkbox } from "./ui/checkbox";

type TransactionItem = {
  id: string;
  type: "expense" | "settlement";
  title: string;
  amount: string;
  description?: string | null;
  date: string;
  isShared?: boolean;
  isSettled?: boolean;
  isPaid?: boolean;
  paymentDate?: string | null;
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
  const [expandedCards, setExpandedCards] = useState(new Set<string>());
  const [loadingActions, setLoadingActions] = useState(new Set<string>());

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

  // Update settlement status mutation
  const updateSettlementMutation = useMutation({
    mutationFn: ({ id, isSettled }: { id: string; isSettled: boolean }) =>
      expensesAPI.updateSettlementStatus(id, isSettled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
     
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
      return {
        id: expense.id,
        type: "expense" as const,
        title: expense.title,
        amount: expense.amount,
        description: expense.description,
        date: expense.createdAt,
        isShared: expense.isShared,
        isSettled: expense.isSettled,
        isPaid: expense.isPaid,
        paymentDate: expense.paymentDate,
        payerId: expense.payerId,
        payerName:
          expense.payerFirstName && expense.payerLastName
            ? `${expense.payerFirstName} ${expense.payerLastName}`
            : expense.payerEmail || "Unknown",
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

  const toggleCard = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedCards(newExpanded);
  };

  const handleSettlementToggle = (id: string, currentStatus: boolean) => {
    setLoadingActions((prev) => new Set(prev).add(id));
    updateSettlementMutation.mutate(
      { id, isSettled: !currentStatus },
      {
        onSettled: () => {
          setLoadingActions((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        },
      }
    );
  };

  if (expensesLoading || settlementsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
        <span className="text-gray-600 text-sm">Đang tải giao dịch...</span>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gray-50 p-6">
        <div className="bg-gray-100 rounded-full p-4 mb-3">
          <Receipt className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-base font-medium text-gray-900 mb-1">
          Chưa có giao dịch nào
        </h3>
        <p className="text-sm text-gray-600">
          Thêm chi tiêu đầu tiên của bạn để bắt đầu theo dõi.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-1 space-y-3">
      {transactions.map((transaction) => {
        const isExpanded = expandedCards.has(transaction.id);
        const isLoading = loadingActions.has(transaction.id);

        return (
          <div
            key={`${transaction.type}-${transaction.id}`}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="p-2 rounded-md bg-blue-500">
                    {transaction.type === "expense" ? (
                      <Receipt className="h-4 w-4 text-white" />
                    ) : (
                      <Handshake className="h-4 w-4 text-white" />
                    )}
                  </div>

                  <div className="flex-2 min-w-0">
                    <h3 className="text-base font-semibold truncate">
                      {transaction.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <div className="text-md font-semibold text-gray-900">
                        {formatCurrency(parseFloat(transaction.amount))}
                      </div>

                      {transaction.type === "expense" && (
                        <>
                          <Badge className="text-xs px-2 py-0.5 rounded-full">
                            {transaction.isShared ? "Chung" : "Cá nhân"}
                          </Badge>
                          {transaction.isShared && (
                            <Badge
                              className={`text-xs px-1 py-0.5 rounded-full ${transaction.isSettled
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                                }`}
                            >
                              {transaction.isSettled ? "Đã trả" : "Chưa trả"}
                            </Badge>
                          )}
                          {transaction.isPaid && (
                            <Badge className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              Đã thanh toán
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleCard(transaction.id)}
                  className="ml-2 p-1 hover:bg-gray-100 rounded-full"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap items-center text-xs text-gray-500 mt-3 gap-3 justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{transaction.payerName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {formatDistance(new Date(transaction.date), new Date(), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>
                  {transaction.imageUrl && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <ImageIcon className="h-3 w-3" />
                      <span>Có ảnh</span>
                    </div>
                  )}
                </div>

                {/* Toggle settlement */}
                {transaction.type === "expense" &&
  transaction.isShared &&
  transaction.canUpdateSettlement && (
    isLoading ? (
      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
    ) : (
      <Checkbox
        checked={transaction.isSettled || false}
        onCheckedChange={() =>
          handleSettlementToggle(
            transaction.id,
            transaction.isSettled || false
          )
        }
        className={`
          h-5 w-5 rounded border 
          ${transaction.isSettled 
            ? "bg-green-500 border-green-500" 
            : "border-orange-400"}
        `}
      />
    )
  )}
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="bg-gray-50 border-t border-gray-200 p-3 text-sm">
                {transaction.description && (
                  <p className="mb-2 text-gray-700">
                    📝 {transaction.description}
                  </p>
                )}

                {/* {transaction.type === "expense" &&
                  transaction.isShared &&
                  transaction.canUpdateSettlement && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {transaction.isSettled ? "Đã trả" : "Chưa trả"}
                      </span>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      ) : (
                        <Switch
                          checked={transaction.isSettled || false}
                          onCheckedChange={() =>
                            handleSettlementToggle(
                              transaction.id,
                              transaction.isSettled || false
                            )
                          }
                          className="scale-90"
                        />
                      )}
                    </div>
                  )} */}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
