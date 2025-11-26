import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface PaymentRecord {
  id: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'Received' | 'Rejected' | 'Pending';
  date: string;
  transactionId?: string;
}

interface PaymentHistoryProps {
  payments: PaymentRecord[];
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ payments }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Received':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Received':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Payment History</h2>
        <p className="text-zinc-400">View your transaction history and payment status</p>
      </div>

      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-zinc-800/50 border border-dashed border-zinc-700 rounded-xl p-4 mb-4">
            <Clock className="w-12 h-12 text-zinc-600 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-zinc-300 mb-2">No payment history yet</h3>
          <p className="text-zinc-500 max-w-md">
            Your payment transactions will appear here once you make a purchase.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-800/30 border border-white/5 rounded-xl p-4 hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(payment.status)}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{payment.planName}</h3>
                    <p className="text-sm text-zinc-400">
                      {new Date(payment.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">
                      {payment.currency} {(payment.amount / 100).toFixed(2)}
                    </p>
                    {payment.transactionId && (
                      <p className="text-xs text-zinc-500">ID: {payment.transactionId.substring(0, 8)}...</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};