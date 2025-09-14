import { BarChart3, CreditCard, User } from "lucide-react";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const navItems = [
    { 
      id: 'home', 
      label: 'Trang chủ', 
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-blue-600'
    },
    { 
      id: 'transactions', 
      label: 'Chi tiêu', 
      icon: <CreditCard className="w-5 h-5" />,
      color: 'text-green-600'
    },
    { 
      id: 'profile', 
      label: 'Cá nhân', 
      icon: <User className="w-5 h-5" />,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="grid grid-cols-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center py-3 px-2 text-xs transition-all duration-200 ${
              activeTab === item.id
                ? `${item.color} bg-blue-50 font-medium`
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors ${
              activeTab === item.id ? 'bg-white shadow-sm' : ''
            }`}>
              {item.icon}
            </div>
            <span className="mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
